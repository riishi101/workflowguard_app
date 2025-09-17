#!/bin/bash

# Create self-signed SSL certificates for WorkflowGuard (temporary solution)
echo "🔐 Creating self-signed SSL certificates..."

# Create directories
mkdir -p /etc/letsencrypt/live/www.workflowguard.pro
mkdir -p /etc/letsencrypt/live/api.workflowguard.pro

# Generate self-signed certificate for www.workflowguard.pro
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/www.workflowguard.pro/privkey.pem \
  -out /etc/letsencrypt/live/www.workflowguard.pro/fullchain.pem \
  -subj "/C=US/ST=CA/L=San Francisco/O=WorkflowGuard/OU=IT/CN=www.workflowguard.pro/subjectAltName=DNS:workflowguard.pro,DNS:www.workflowguard.pro"

# Generate self-signed certificate for api.workflowguard.pro
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/api.workflowguard.pro/privkey.pem \
  -out /etc/letsencrypt/live/api.workflowguard.pro/fullchain.pem \
  -subj "/C=US/ST=CA/L=San Francisco/O=WorkflowGuard/OU=IT/CN=api.workflowguard.pro"

echo "✅ Self-signed certificates created!"
echo "⚠️  Note: Browsers will show security warnings for self-signed certificates"
echo "🔄 Replace with Let's Encrypt certificates once DNS is configured"
