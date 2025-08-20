#!/bin/bash

# Server Setup Script for WorkflowGuard
# Run this script on your server to prepare for deployment

set -e

echo "🔧 Setting up WorkflowGuard on server..."

# Create application directory
sudo mkdir -p /opt/workflowguard
sudo chown $USER:$USER /opt/workflowguard

# Clone repository (replace with your actual repo URL)
cd /opt/workflowguard
git clone https://github.com/riishi101/workflowguard_app.git .

# Copy production environment
cp .env.production .env

# Make scripts executable
chmod +x scripts/*.sh

echo "✅ Server setup complete!"
echo "📁 Application directory: /opt/workflowguard"
echo "🚀 Ready for deployment!"
