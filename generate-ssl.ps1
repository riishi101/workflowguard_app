# Generate SSL certificates for WorkflowGuard domains
Write-Host "🔐 Generating SSL certificates for WorkflowGuard..." -ForegroundColor Green

# Stop nginx to free up port 80 for certbot
Write-Host "📦 Stopping nginx container..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml stop nginx

# Generate certificate for www.workflowguard.pro (covers both workflowguard.pro and www.workflowguard.pro)
Write-Host "🌐 Generating certificate for www.workflowguard.pro..." -ForegroundColor Cyan
docker run --rm `
  -v /etc/letsencrypt:/etc/letsencrypt `
  -v /var/www/certbot:/var/www/certbot `
  -p 80:80 `
  certbot/certbot certonly `
  --standalone `
  --email admin@workflowguard.pro `
  --agree-tos `
  --no-eff-email `
  -d workflowguard.pro `
  -d www.workflowguard.pro

# Generate certificate for api.workflowguard.pro
Write-Host "🔗 Generating certificate for api.workflowguard.pro..." -ForegroundColor Cyan
docker run --rm `
  -v /etc/letsencrypt:/etc/letsencrypt `
  -v /var/www/certbot:/var/www/certbot `
  -p 80:80 `
  certbot/certbot certonly `
  --standalone `
  --email admin@workflowguard.pro `
  --agree-tos `
  --no-eff-email `
  -d api.workflowguard.pro

# Start nginx with HTTPS configuration
Write-Host "🚀 Starting nginx with HTTPS configuration..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml start nginx

Write-Host "✅ SSL certificates generated and nginx restarted!" -ForegroundColor Green
Write-Host "🌐 Your WorkflowGuard app should now be accessible at:" -ForegroundColor White
Write-Host "   https://workflowguard.pro" -ForegroundColor Cyan
Write-Host "   https://www.workflowguard.pro" -ForegroundColor Cyan
Write-Host "   https://api.workflowguard.pro" -ForegroundColor Cyan
