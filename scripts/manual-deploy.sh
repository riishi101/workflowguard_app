#!/bin/bash

# Manual Deployment Script for WorkflowGuard
# Run this on your server for manual deployments

set -e

echo "🔧 Manual WorkflowGuard Deployment"
echo "=================================="

# Quick deployment commands
echo "1. Pull latest code:"
echo "   git pull origin main"
echo ""

echo "2. Stop current containers:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""

echo "3. Build and start:"
echo "   docker-compose -f docker-compose.prod.yml up -d --build"
echo ""

echo "4. Check status:"
echo "   docker-compose -f docker-compose.prod.yml ps"
echo ""

echo "5. View logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""

echo "🚀 Quick one-liner deployment:"
echo "git pull && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build"
