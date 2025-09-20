#!/bin/bash

echo "🚀 Deploying Frontend Environment Variable Fix..."

# Step 1: Commit changes
echo "📝 Committing changes..."
git add .
git commit -m "Fix frontend environment variables - resolve Railway URL issue in production build"

# Step 2: Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Changes pushed to GitHub!"
echo ""
echo "🔧 Now run these commands on your Hostinger server:"
echo ""
echo "# 1. Pull latest changes"
echo "git pull origin main"
echo ""
echo "# 2. Copy production environment file"
echo "cp .env.production .env"
echo ""
echo "# 3. Stop and rebuild frontend container (no cache)"
echo "docker-compose -f docker-compose.production.yml stop frontend"
echo "docker-compose -f docker-compose.production.yml rm -f frontend"
echo "docker-compose -f docker-compose.production.yml build --no-cache frontend"
echo ""
echo "# 4. Start the updated frontend"
echo "docker-compose -f docker-compose.production.yml up -d frontend"
echo ""
echo "# 5. Check container status"
echo "docker-compose -f docker-compose.production.yml ps"
echo ""
echo "🎯 After deployment, test: https://workflowguard.pro"
echo "🔗 HubSpot OAuth should now connect to: https://api.workflowguard.pro"
