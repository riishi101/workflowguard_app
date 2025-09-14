# WorkflowGuard KVM-1 Deployment Script for Windows
# This script helps deploy WorkflowGuard to a KVM-1 VPS without SSL initially

param(
    [string]$ServerIP = "",
    [string]$Username = "root"
)

Write-Host "🚀 WorkflowGuard KVM-1 Deployment Helper" -ForegroundColor Green
Write-Host ""

if ($ServerIP -eq "") {
    $ServerIP = Read-Host "Enter your VPS IP address (e.g., 145.79.0.218)"
}

Write-Host "📋 Deployment Steps for VPS: $ServerIP" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣ Copy files to VPS:" -ForegroundColor Cyan
Write-Host "   scp -r . ${Username}@${ServerIP}:/root/workflowguard_app/" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣ SSH into VPS:" -ForegroundColor Cyan
Write-Host "   ssh ${Username}@${ServerIP}" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣ Run these commands on VPS:" -ForegroundColor Cyan
Write-Host "   cd /root/workflowguard_app" -ForegroundColor White
Write-Host "   chmod +x deploy-kvm1.sh" -ForegroundColor White
Write-Host "   ./deploy-kvm1.sh" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣ Alternative manual deployment on VPS:" -ForegroundColor Cyan
Write-Host "   docker-compose down --remove-orphans" -ForegroundColor White
Write-Host "   docker system prune -f" -ForegroundColor White
Write-Host "   docker-compose up --build -d" -ForegroundColor White
Write-Host "   docker-compose exec backend npx prisma migrate deploy" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣ Test deployment:" -ForegroundColor Cyan
Write-Host "   curl http://${ServerIP}/" -ForegroundColor White
Write-Host "   curl http://${ServerIP}/api/health" -ForegroundColor White
Write-Host ""

Write-Host "6️⃣ Monitor services:" -ForegroundColor Cyan
Write-Host "   docker-compose ps" -ForegroundColor White
Write-Host "   docker-compose logs -f" -ForegroundColor White
Write-Host "   docker stats --no-stream" -ForegroundColor White
Write-Host ""

Write-Host "📝 Configuration Summary:" -ForegroundColor Yellow
Write-Host "   ✅ Database: Local PostgreSQL (not Neon)" -ForegroundColor Green
Write-Host "   ✅ Nginx: Non-SSL configuration" -ForegroundColor Green
Write-Host "   ✅ Ports: 80 (HTTP), 5432 (PostgreSQL)" -ForegroundColor Green
Write-Host "   ✅ Memory: Optimized for KVM-1 (4GB RAM)" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 After successful deployment:" -ForegroundColor Yellow
Write-Host "   1. Test at http://${ServerIP}" -ForegroundColor White
Write-Host "   2. Verify DNS points to ${ServerIP}" -ForegroundColor White
Write-Host "   3. Set up SSL with Certbot" -ForegroundColor White
Write-Host "   4. Switch to nginx-ssl.conf" -ForegroundColor White
Write-Host ""

$response = Read-Host "Would you like to generate the SCP command to copy files? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "📁 Copy command:" -ForegroundColor Green
    Write-Host "scp -r * ${Username}@${ServerIP}:/root/workflowguard_app/" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: Run this from your workflowguard_app directory" -ForegroundColor Yellow
}
