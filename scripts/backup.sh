#!/bin/bash

# WorkflowGuard Production Backup Script
# This script creates automated backups of the database and critical files

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/tmp/workflowguard-backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if required environment variables are set
check_environment() {
    log "Checking environment variables..."
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    if [ -z "$BACKUP_STORAGE_PATH" ]; then
        warning "BACKUP_STORAGE_PATH not set, using default: $BACKUP_DIR"
        export BACKUP_STORAGE_PATH="$BACKUP_DIR"
    fi
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory..."
    mkdir -p "$BACKUP_STORAGE_PATH"
    
    if [ ! -w "$BACKUP_STORAGE_PATH" ]; then
        error "Backup directory is not writable: $BACKUP_STORAGE_PATH"
        exit 1
    fi
}

# Database backup
backup_database() {
    log "Starting database backup..."
    
    local backup_file="$BACKUP_STORAGE_PATH/database_backup_$DATE.sql"
    
    # Extract database connection details from DATABASE_URL
    # Format: postgresql://username:password@host:port/database
    local db_url="$DATABASE_URL"
    
    # Use pg_dump with the full connection string
    if command -v pg_dump >/dev/null 2>&1; then
        log "Using pg_dump for database backup..."
        pg_dump "$db_url" > "$backup_file"
    else
        # Fallback: use docker if pg_dump is not available
        log "pg_dump not found, using Docker..."
        docker run --rm postgres:15-alpine pg_dump "$db_url" > "$backup_file"
    fi
    
    # Compress the backup
    gzip "$backup_file"
    backup_file="${backup_file}.gz"
    
    # Verify backup was created
    if [ -f "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "Database backup completed: $backup_file ($size)"
    else
        error "Database backup failed"
        exit 1
    fi
}

# Environment variables backup
backup_environment() {
    log "Backing up environment configuration..."
    
    local env_backup="$BACKUP_STORAGE_PATH/environment_$DATE.env"
    
    # Create a sanitized version of environment variables
    cat > "$env_backup" << EOF
# WorkflowGuard Environment Backup - $DATE
# Sensitive values are masked for security

NODE_ENV=$NODE_ENV
PORT=$PORT
APP_VERSION=$APP_VERSION

# Database (connection string masked)
DATABASE_URL=postgresql://***:***@***:***/***

# JWT (secret masked)
JWT_SECRET=***

# HubSpot (credentials masked)
HUBSPOT_CLIENT_ID=${HUBSPOT_CLIENT_ID:0:8}***
HUBSPOT_CLIENT_SECRET=***
HUBSPOT_REDIRECT_URI=$HUBSPOT_REDIRECT_URI

# Razorpay (credentials masked)
RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID:0:8}***
RAZORPAY_KEY_SECRET=***

# Twilio (credentials masked)
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:0:8}***
TWILIO_AUTH_TOKEN=***
TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER

# Monitoring
SENTRY_DSN=${SENTRY_DSN:0:20}***
LOG_LEVEL=$LOG_LEVEL

# Rate Limiting
RATE_LIMIT_WINDOW_MS=$RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX_REQUESTS=$RATE_LIMIT_MAX_REQUESTS

# CORS
CORS_ORIGINS=$CORS_ORIGINS
EOF

    log "Environment backup completed: $env_backup"
}

# Application files backup (if running locally)
backup_application() {
    if [ -d "./backend" ] && [ -d "./frontend" ]; then
        log "Backing up application files..."
        
        local app_backup="$BACKUP_STORAGE_PATH/application_$DATE.tar.gz"
        
        # Create tar archive excluding node_modules and other unnecessary files
        tar -czf "$app_backup" \
            --exclude="node_modules" \
            --exclude="dist" \
            --exclude="build" \
            --exclude=".git" \
            --exclude="logs" \
            --exclude="*.log" \
            ./backend ./frontend ./docker-compose*.yml ./package*.json
        
        local size=$(du -h "$app_backup" | cut -f1)
        log "Application backup completed: $app_backup ($size)"
    else
        log "Application files not found in current directory, skipping..."
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_STORAGE_PATH" -name "*backup*" -type f -mtime +$RETENTION_DAYS -delete
    
    local remaining=$(find "$BACKUP_STORAGE_PATH" -name "*backup*" -type f | wc -l)
    log "Cleanup completed. $remaining backup files remaining."
}

# Upload to cloud storage (if configured)
upload_to_cloud() {
    if [ -n "$CLOUD_STORAGE_BUCKET" ]; then
        log "Uploading backups to cloud storage..."
        
        # Google Cloud Storage
        if command -v gsutil >/dev/null 2>&1; then
            gsutil -m cp "$BACKUP_STORAGE_PATH/*_$DATE.*" "gs://$CLOUD_STORAGE_BUCKET/backups/"
            log "Backups uploaded to Google Cloud Storage"
        fi
        
        # AWS S3
        if command -v aws >/dev/null 2>&1; then
            aws s3 cp "$BACKUP_STORAGE_PATH/" "s3://$CLOUD_STORAGE_BUCKET/backups/" --recursive --exclude "*" --include "*_$DATE.*"
            log "Backups uploaded to AWS S3"
        fi
    else
        log "No cloud storage configured, keeping backups locally"
    fi
}

# Send notification (if configured)
send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"WorkflowGuard Backup $status: $message\"}" \
            >/dev/null 2>&1 || true
    fi
    
    if [ -n "$EMAIL_RECIPIENT" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "WorkflowGuard Backup $status" "$EMAIL_RECIPIENT" || true
    fi
}

# Main backup function
main() {
    log "Starting WorkflowGuard backup process..."
    
    local start_time=$(date +%s)
    
    # Trap to ensure cleanup on exit
    trap 'error "Backup process interrupted"; send_notification "FAILED" "Backup process was interrupted"; exit 1' INT TERM
    
    try {
        check_environment
        create_backup_dir
        backup_database
        backup_environment
        backup_application
        cleanup_old_backups
        upload_to_cloud
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "Backup process completed successfully in ${duration}s"
        send_notification "SUCCESS" "All backups completed successfully in ${duration}s"
        
    } catch {
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        error "Backup process failed after ${duration}s"
        send_notification "FAILED" "Backup process failed after ${duration}s"
        exit 1
    }
}

# Error handling wrapper
try() {
    "$@"
}

catch() {
    case $? in
        0) ;;
        *) "$@" ;;
    esac
}

# Run main function
main "$@"
