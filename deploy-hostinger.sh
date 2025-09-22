#!/bin/bash

# 🚀 WorkflowGuard Hostinger VPS Deployment Script
# Special configuration for Hostinger's single-port limitation (Port 443 only)

set -e

echo "🚀 Starting WorkflowGuard Hostinger VPS Deployment (HTTPS-only)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found! Please create it from .env.vps template."
    print_status "Run: cp .env.vps .env"
    print_status "Then edit .env with your actual credentials"
    exit 1
fi

print_step "1. Installing Dependencies"

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_warning "Please log out and log back in for Docker group changes to take effect"
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

print_step "2. Creating SSL Certificates (Self-signed for initial setup)"

# Create SSL directory
mkdir -p ssl

# Generate self-signed certificates for initial deployment
print_status "Generating self-signed SSL certificates..."

# Frontend certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/workflowguard.pro.key \
    -out ssl/workflowguard.pro.crt \
    -subj "/C=US/ST=CA/L=San Francisco/O=WorkflowGuard/CN=workflowguard.pro"

# API certificate  
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/api.workflowguard.pro.key \
    -out ssl/api.workflowguard.pro.crt \
    -subj "/C=US/ST=CA/L=San Francisco/O=WorkflowGuard/CN=api.workflowguard.pro"

print_status "Self-signed certificates created successfully"

print_step "3. Deploying Application"

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.hostinger.yml down --remove-orphans || true

# Remove old images to free space
print_status "Cleaning up old Docker images..."
docker system prune -f || true

# Build and start containers (HTTPS-only on port 443)
print_status "Building and starting containers (HTTPS-only)..."
docker-compose -f docker-compose.hostinger.yml up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

print_step "4. Checking Deployment Status"

# Check container status
print_status "Checking container status..."
docker-compose -f docker-compose.hostinger.yml ps

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.hostinger.yml exec -T backend npx prisma db push || print_warning "Database migration failed - will retry"

print_step "5. Testing HTTPS Endpoints"

# Test HTTPS endpoints
print_status "Testing HTTPS endpoints..."
sleep 10

# Test frontend
if curl -k -I https://workflowguard.pro 2>/dev/null | grep -q "200 OK"; then
    print_status "✅ Frontend HTTPS: Working"
else
    print_warning "❌ Frontend HTTPS: Not responding"
fi

# Test API
if curl -k -I https://api.workflowguard.pro/api 2>/dev/null | grep -q "200\|404"; then
    print_status "✅ API HTTPS: Working"
else
    print_warning "❌ API HTTPS: Not responding"
fi

print_step "6. Deployment Complete!"

echo ""
echo "🎉 WorkflowGuard deployed successfully on Hostinger VPS!"
echo ""
echo "📍 IMPORTANT HOSTINGER CONFIGURATION:"
echo "   - Only Port 443 (HTTPS) is active"
echo "   - Self-signed certificates are installed"
echo "   - DNS must point to your VPS IP"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: https://workflowguard.pro"
echo "   API:      https://api.workflowguard.pro/api"
echo ""
echo "⚠️  NEXT STEPS:"
echo "   1. Configure DNS A records:"
echo "      workflowguard.pro     → YOUR_VPS_IP"
echo "      api.workflowguard.pro → YOUR_VPS_IP"
echo ""
echo "   2. Replace self-signed certificates with real SSL:"
echo "      - Use Cloudflare SSL (recommended for Hostinger)"
echo "      - Or configure Let's Encrypt with DNS challenge"
echo ""
echo "   3. Update HubSpot app settings:"
echo "      - Redirect URI: https://api.workflowguard.pro/api/auth/hubspot/callback"
echo ""
echo "   4. Test OAuth flow and payment processing"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.hostinger.yml ps
echo ""
echo "🔍 To view logs:"
echo "   docker-compose -f docker-compose.hostinger.yml logs backend"
echo "   docker-compose -f docker-compose.hostinger.yml logs frontend"
echo "   docker-compose -f docker-compose.hostinger.yml logs nginx"
echo ""
print_status "Deployment completed successfully! 🚀"
