#!/bin/bash

# WorkflowGuard Deployment Script for Hostinger VPS
set -e

echo "Starting WorkflowGuard deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please create it first."
    exit 1
fi

# Copy environment files
echo "Setting up environment files..."
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env

# Build and start containers
echo "Building and starting Docker containers..."
docker-compose down
docker-compose up -d --build

# Run database migrations
echo "Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Check if services are running
echo "Checking if services are running..."
docker-compose ps

echo "Deployment completed successfully!"
echo "Frontend: https://workflowguard.pro"
echo "API: https://api.workflowguard.pro"