#!/bin/bash

# WorkflowGuard KVM-1 Deployment Script
# This script deploys WorkflowGuard to a KVM-1 VPS without SSL initially

set -e

echo "🚀 Starting WorkflowGuard KVM-1 Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are available"

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove existing containers and images for clean deployment
print_status "Cleaning up existing containers and images..."
docker system prune -f || true

# Build and start services
print_status "Building and starting WorkflowGuard services..."
docker-compose up --build -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
print_status "Checking service status..."
docker-compose ps

# Check database connection
print_status "Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U postgres -d workflowguard; then
        print_status "Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start after 30 attempts"
        exit 1
    fi
    sleep 2
done

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T backend npx prisma migrate deploy || {
    print_warning "Migration failed, trying to generate and push schema..."
    docker-compose exec -T backend npx prisma generate
    docker-compose exec -T backend npx prisma db push
}

# Check backend health
print_status "Checking backend health..."
for i in {1..20}; do
    if curl -f http://localhost:4000/api/health &>/dev/null; then
        print_status "Backend is healthy!"
        break
    fi
    if [ $i -eq 20 ]; then
        print_warning "Backend health check failed, but continuing..."
        break
    fi
    sleep 3
done

# Check frontend
print_status "Checking frontend..."
if curl -f http://localhost/ &>/dev/null; then
    print_status "Frontend is accessible!"
else
    print_warning "Frontend check failed, but continuing..."
fi

# Display final status
echo ""
print_status "🎉 WorkflowGuard deployment completed!"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   Direct Backend: http://localhost:4000"
echo ""
echo "📝 Next Steps:"
echo "   1. Test the application at http://localhost"
echo "   2. If working, update DNS to point to this server"
echo "   3. Set up SSL certificates with Certbot"
echo "   4. Switch to nginx-ssl.conf for production"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"
echo "   Stop: docker-compose down"
echo ""

# Show resource usage
print_status "Current resource usage:"
docker stats --no-stream
