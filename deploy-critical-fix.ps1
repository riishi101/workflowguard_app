# Deploy critical fixes for Prisma transaction and HubSpot API errors
Write-Host "Deploying critical fixes to production..."

# Deploy to production server
ssh root@72.60.64.89 @"
cd /root/workflowguard_app
echo "Pulling latest changes..."
git pull origin main
echo "Rebuilding backend with fixes..."
docker-compose -f docker-compose.prod.yml build backend
echo "Restarting backend service..."
docker-compose -f docker-compose.prod.yml up -d backend
echo "Checking backend logs..."
docker logs workflowguard_backend_1 --tail=10
echo "Deployment complete!"
"@

Write-Host "Critical fixes deployed successfully!"
