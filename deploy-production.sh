#!/bin/bash
# WorkflowGuard Production Deployment Script
# Run this on your Hostinger VPS (145.79.0.218)

set -e  # Exit on any error

echo "🚀 Starting WorkflowGuard Production Deployment"
echo "=============================================="

# Navigate to project directory
cd /root/workflowguard_app

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git stash  # Stash any local changes
git pull origin main

# Copy environment file
echo "⚙️ Setting up environment variables..."
cp .env.production .env

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Clean up Docker to avoid cache issues
echo "🧹 Cleaning Docker cache..."
docker system prune -f
docker volume prune -f

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.production.yml up -d --build --force-recreate

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check container status
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check backend health
echo "🏥 Checking backend health..."
sleep 10
curl -f http://localhost:3001/api/health || echo "⚠️ Backend health check failed"

# Check frontend
echo "🌐 Checking frontend..."
curl -f http://localhost:3000 || echo "⚠️ Frontend check failed"

# Show logs for debugging
echo "📋 Recent backend logs:"
docker logs --tail=20 workflowguard_backend

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at:"
echo "   - Frontend: http://workflowguard.pro"
echo "   - API: http://api.workflowguard.pro"
echo ""
echo "🔍 To check logs: docker logs -f workflowguard_backend"
echo "🔍 To check status: docker ps"
