# Deploy workflow version fix to production
Write-Host "Deploying workflow version fix to production..."

# Connect to production server and deploy
$commands = @(
    "cd /root/workflowguard_app",
    "git pull origin main",
    "docker-compose -f docker-compose.prod.yml build backend",
    "docker-compose -f docker-compose.prod.yml up -d backend",
    "docker-compose -f docker-compose.prod.yml logs backend --tail=20"
)

$commandString = $commands -join " && "
ssh root@72.60.64.89 $commandString

Write-Host "Deployment complete. Checking backend status..."
