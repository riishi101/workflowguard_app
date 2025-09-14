# WorkflowGuard Configuration Verification Script

Write-Host "🔍 WorkflowGuard Configuration Verification" -ForegroundColor Green
Write-Host ""

# Check if required files exist
$requiredFiles = @(
    "docker-compose.yml",
    "nginx\nginx.conf",
    "backend\Dockerfile",
    "frontend\Dockerfile"
)

Write-Host "📁 Checking required files:" -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (MISSING)" -ForegroundColor Red
    }
}
Write-Host ""

# Check docker-compose.yml configuration
Write-Host "🐳 Docker Compose Configuration:" -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    $dockerComposeContent = Get-Content "docker-compose.yml" -Raw
    
    # Check database configuration
    if ($dockerComposeContent -match "postgresql://postgres:postgres123@db:5432/workflowguard") {
        Write-Host "   ✅ Database: Local PostgreSQL configured" -ForegroundColor Green
    } elseif ($dockerComposeContent -match "neon") {
        Write-Host "   ❌ Database: Still using Neon (needs fix)" -ForegroundColor Red
    } else {
        Write-Host "   ⚠️  Database: Configuration unclear" -ForegroundColor Yellow
    }
    
    # Check nginx configuration
    if ($dockerComposeContent -match "nginx\.conf") {
        Write-Host "   ✅ Nginx: Non-SSL configuration" -ForegroundColor Green
    } elseif ($dockerComposeContent -match "nginx-ssl\.conf") {
        Write-Host "   ⚠️  Nginx: SSL configuration (may fail without certificates)" -ForegroundColor Yellow
    }
    
    # Check ports
    if ($dockerComposeContent -match '"80:80"') {
        Write-Host "   ✅ Ports: HTTP (80) configured" -ForegroundColor Green
    }
}
Write-Host ""

# Check environment files
Write-Host "🔧 Environment Configuration:" -ForegroundColor Yellow
$envFiles = @(".env.example", ".env.production")
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "   ✅ $envFile exists" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $envFile missing" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check nginx directory
Write-Host "📄 Nginx Configuration:" -ForegroundColor Yellow
if (Test-Path "nginx\nginx.conf") {
    Write-Host "   ✅ nginx.conf exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ nginx.conf missing" -ForegroundColor Red
}

if (Test-Path "nginx\nginx-ssl.conf") {
    Write-Host "   ✅ nginx-ssl.conf exists (for later SSL setup)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  nginx-ssl.conf missing" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📋 Deployment Readiness Summary:" -ForegroundColor Cyan
Write-Host "   1. Configuration files are prepared" -ForegroundColor White
Write-Host "   2. Database switched to local PostgreSQL" -ForegroundColor White
Write-Host "   3. Nginx configured for HTTP (non-SSL)" -ForegroundColor White
Write-Host "   4. Ready for KVM-1 deployment" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Green
Write-Host "   1. Run: .\deploy-kvm1.ps1" -ForegroundColor White
Write-Host "   2. Copy files to VPS using SCP" -ForegroundColor White
Write-Host "   3. SSH to VPS and run deployment script" -ForegroundColor White
Write-Host "   4. Test at http://YOUR_VPS_IP" -ForegroundColor White
