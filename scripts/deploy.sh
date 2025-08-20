#!/bin/bash

# WorkflowGuard Production Deployment Script
# Usage: ./scripts/deploy.sh

set -e  # Exit on any error

echo "🚀 Starting WorkflowGuard deployment..."

# Configuration
APP_DIR="/opt/workflowguard"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/opt/backups/workflowguard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root for security reasons"
   exit 1
fi

# Create app directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    log_info "Creating application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
fi

# Navigate to app directory
cd "$APP_DIR"

# Check if git repository exists
if [ ! -d ".git" ]; then
    log_info "Cloning repository..."
    git clone https://github.com/YOUR_USERNAME/workflowguard_app.git .
else
    log_info "Updating repository..."
    git fetch origin
    git reset --hard origin/main
fi

# Create backup directory
sudo mkdir -p "$BACKUP_DIR"

# Backup current deployment (if exists)
if [ -f "$COMPOSE_FILE" ]; then
    log_info "Creating backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    sudo cp "$COMPOSE_FILE" "$BACKUP_DIR/docker-compose.prod.yml.$TIMESTAMP"
fi

# Copy environment file
if [ -f ".env.production" ]; then
    log_info "Setting up environment..."
    cp .env.production .env
else
    log_warn "No .env.production file found. Using defaults."
fi

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down || true

# Build and start new containers
log_info "Building application..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

log_info "Starting application..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be ready
log_info "Waiting for services to start..."
sleep 30

# Health check
log_info "Performing health checks..."
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    log_info "✅ Backend health check passed"
else
    log_error "❌ Backend health check failed"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_info "✅ Frontend health check passed"
else
    log_error "❌ Frontend health check failed"
fi

# Clean up old images
log_info "Cleaning up old Docker images..."
docker system prune -f

# Show running containers
log_info "Current running containers:"
docker-compose -f "$COMPOSE_FILE" ps

log_info "🎉 Deployment completed successfully!"
log_info "🌐 Application available at: https://workflowguard.pro"
log_info "📊 Monitoring available at: http://72.60.64.89:19999"
