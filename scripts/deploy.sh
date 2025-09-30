#!/bin/bash

# WorkflowGuard Production Deployment Script
# Automates the complete deployment process with safety checks

set -e  # Exit on any error

# Configuration
PROJECT_ID="continual-mind-473007-h8"
REGION="us-central1"
BACKEND_SERVICE="workflowguard-backend"
FRONTEND_SERVICE="workflowguard-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if gcloud is installed and authenticated
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "Not authenticated with gcloud. Please run 'gcloud auth login'"
        exit 1
    fi
    
    # Check project
    local current_project=$(gcloud config get-value project 2>/dev/null)
    if [ "$current_project" != "$PROJECT_ID" ]; then
        warning "Current project is '$current_project', switching to '$PROJECT_ID'"
        gcloud config set project "$PROJECT_ID"
    fi
    
    # Check if Docker is running (for local builds)
    if ! docker info &> /dev/null; then
        warning "Docker is not running. Cloud Build will be used instead."
    fi
    
    log "Prerequisites check completed"
}

# Pre-deployment health check
pre_deployment_check() {
    log "Running pre-deployment health checks..."
    
    # Check if services are currently healthy
    local backend_url="https://api.workflowguard.pro/api/health"
    local frontend_url="https://www.workflowguard.pro"
    
    info "Checking current backend health..."
    if curl -f -s "$backend_url" > /dev/null; then
        log "Backend is currently healthy"
    else
        warning "Backend health check failed - proceeding with deployment"
    fi
    
    info "Checking current frontend..."
    if curl -f -s "$frontend_url" > /dev/null; then
        log "Frontend is currently accessible"
    else
        warning "Frontend check failed - proceeding with deployment"
    fi
}

# Build and test
build_and_test() {
    log "Building and testing application..."
    
    # Backend build
    info "Building backend..."
    cd backend
    npm ci --only=production
    npm run build
    
    # Run production tests if they exist
    if [ -f "src/testing/production.test.ts" ]; then
        info "Running production tests..."
        npm test -- --testPathPattern=production.test.ts --testTimeout=30000 || {
            error "Production tests failed"
            exit 1
        }
    fi
    
    cd ..
    
    # Frontend build
    info "Building frontend..."
    cd frontend
    npm ci --only=production
    npm run build
    cd ..
    
    log "Build and test completed successfully"
}

# Deploy using Cloud Build
deploy_with_cloud_build() {
    log "Starting deployment with Cloud Build..."
    
    local build_id=$(gcloud builds submit --config=cloudbuild.yaml --format="value(id)")
    
    if [ -z "$build_id" ]; then
        error "Failed to start Cloud Build"
        exit 1
    fi
    
    info "Cloud Build started with ID: $build_id"
    info "You can monitor the build at: https://console.cloud.google.com/cloud-build/builds/$build_id"
    
    # Wait for build to complete
    log "Waiting for build to complete..."
    gcloud builds log --stream "$build_id"
    
    # Check build status
    local build_status=$(gcloud builds describe "$build_id" --format="value(status)")
    
    if [ "$build_status" = "SUCCESS" ]; then
        log "Cloud Build completed successfully"
        return 0
    else
        error "Cloud Build failed with status: $build_status"
        exit 1
    fi
}

# Post-deployment verification
post_deployment_verification() {
    log "Running post-deployment verification..."
    
    # Wait for services to be ready
    sleep 30
    
    # Test backend health
    info "Verifying backend deployment..."
    local backend_url="https://api.workflowguard.pro/api/health"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$backend_url" | grep -q '"status":"ok"'; then
            log "Backend health check passed"
            break
        else
            warning "Backend health check failed (attempt $attempt/$max_attempts)"
            if [ $attempt -eq $max_attempts ]; then
                error "Backend deployment verification failed"
                return 1
            fi
            sleep 10
            ((attempt++))
        fi
    done
    
    # Test detailed health check
    info "Verifying detailed health check..."
    local detailed_health=$(curl -s "https://api.workflowguard.pro/api/health/detailed")
    if echo "$detailed_health" | grep -q '"database":.*"status":"ok"'; then
        log "Database connectivity verified"
    else
        error "Database connectivity check failed"
        return 1
    fi
    
    # Test frontend
    info "Verifying frontend deployment..."
    if curl -f -s "https://www.workflowguard.pro" > /dev/null; then
        log "Frontend deployment verified"
    else
        error "Frontend deployment verification failed"
        return 1
    fi
    
    # Test critical API endpoints
    info "Testing critical API endpoints..."
    
    # Test auth endpoint
    local auth_response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.workflowguard.pro/api/auth/hubspot/url")
    if [ "$auth_response" = "200" ] || [ "$auth_response" = "400" ]; then
        log "Auth endpoint responding correctly"
    else
        warning "Auth endpoint returned unexpected status: $auth_response"
    fi
    
    # Test payment plans endpoint
    local plans_response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.workflowguard.pro/api/payments/plans")
    if [ "$plans_response" = "200" ]; then
        log "Payment plans endpoint responding correctly"
    else
        warning "Payment plans endpoint returned status: $plans_response"
    fi
    
    log "Post-deployment verification completed"
}

# Rollback function
rollback_deployment() {
    error "Deployment failed, initiating rollback..."
    
    # Get previous revisions
    local backend_revisions=$(gcloud run revisions list --service="$BACKEND_SERVICE" --region="$REGION" --format="value(metadata.name)" --limit=2)
    local frontend_revisions=$(gcloud run revisions list --service="$FRONTEND_SERVICE" --region="$REGION" --format="value(metadata.name)" --limit=2)
    
    # Get previous revision (second in list)
    local prev_backend=$(echo "$backend_revisions" | sed -n '2p')
    local prev_frontend=$(echo "$frontend_revisions" | sed -n '2p')
    
    if [ -n "$prev_backend" ]; then
        warning "Rolling back backend to revision: $prev_backend"
        gcloud run services update-traffic "$BACKEND_SERVICE" --to-revisions="$prev_backend=100" --region="$REGION"
    fi
    
    if [ -n "$prev_frontend" ]; then
        warning "Rolling back frontend to revision: $prev_frontend"
        gcloud run services update-traffic "$FRONTEND_SERVICE" --to-revisions="$prev_frontend=100" --region="$REGION"
    fi
    
    log "Rollback completed"
}

# Send deployment notification
send_notification() {
    local status=$1
    local duration=$2
    local build_id=$3
    
    local message="WorkflowGuard deployment $status"
    if [ -n "$duration" ]; then
        message="$message in ${duration}s"
    fi
    if [ -n "$build_id" ]; then
        message="$message (Build: $build_id)"
    fi
    
    # Webhook notification
    if [ -n "$DEPLOYMENT_WEBHOOK_URL" ]; then
        curl -X POST "$DEPLOYMENT_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"$message\", \"status\":\"$status\"}" \
            >/dev/null 2>&1 || true
    fi
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        if [ "$status" = "FAILED" ]; then
            color="danger"
        fi
        
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            >/dev/null 2>&1 || true
    fi
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    local build_id=""
    
    log "🚀 Starting WorkflowGuard production deployment..."
    
    # Trap to handle failures
    trap 'error "Deployment interrupted"; rollback_deployment; send_notification "INTERRUPTED" "$(($(date +%s) - start_time))"; exit 1' INT TERM
    
    try {
        check_prerequisites
        pre_deployment_check
        build_and_test
        build_id=$(deploy_with_cloud_build)
        post_deployment_verification
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "🎉 Deployment completed successfully in ${duration}s"
        send_notification "SUCCESS" "$duration" "$build_id"
        
        # Display deployment summary
        echo ""
        log "=== DEPLOYMENT SUMMARY ==="
        info "Backend URL: https://api.workflowguard.pro"
        info "Frontend URL: https://www.workflowguard.pro"
        info "Health Check: https://api.workflowguard.pro/api/health"
        info "Build Duration: ${duration}s"
        if [ -n "$build_id" ]; then
            info "Build ID: $build_id"
        fi
        log "=========================="
        
    } catch {
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        error "Deployment failed after ${duration}s"
        rollback_deployment
        send_notification "FAILED" "$duration" "$build_id"
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

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-verification)
            SKIP_VERIFICATION=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --skip-tests        Skip running tests before deployment"
            echo "  --skip-verification Skip post-deployment verification"
            echo "  --force            Force deployment even if checks fail"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
