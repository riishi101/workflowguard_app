#!/bin/bash

# Generate SSL certificates for WorkflowGuard domains
echo "🔐 Generating SSL certificates for WorkflowGuard..."

# Stop nginx to free up port 80 for certbot
echo "📦 Stopping nginx container..."
docker-compose -f docker-compose.prod.yml stop nginx

# Generate certificate for www.workflowguard.pro (covers both workflowguard.pro and www.workflowguard.pro)
echo "🌐 Generating certificate for www.workflowguard.pro..."
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email \
  -d workflowguard.pro \
  -d www.workflowguard.pro

# Generate certificate for api.workflowguard.pro
echo "🔗 Generating certificate for api.workflowguard.pro..."
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email \
  -d api.workflowguard.pro

# Start nginx with HTTPS configuration
echo "🚀 Starting nginx with HTTPS configuration..."
docker-compose -f docker-compose.prod.yml start nginx

echo "✅ SSL certificates generated and nginx restarted!"
echo "🌐 Your WorkflowGuard app should now be accessible at:"
echo "   https://workflowguard.pro"
echo "   https://www.workflowguard.pro"
echo "   https://api.workflowguard.pro"
