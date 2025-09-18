# WorkflowGuard Cloud Deployment Script
# This script helps deploy to Vercel + Railway

Write-Host "🚀 WorkflowGuard Cloud Deployment Helper" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if required tools are installed
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check for npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found." -ForegroundColor Red
    exit 1
}

# Check for git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

Write-Host "`n🎯 Deployment Options:" -ForegroundColor Yellow
Write-Host "1. Install Vercel CLI and deploy frontend"
Write-Host "2. Install Railway CLI and deploy backend"
Write-Host "3. Deploy both (full deployment)"
Write-Host "4. Just show deployment guide"

$choice = Read-Host "`nSelect option (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Installing Vercel CLI and deploying frontend..." -ForegroundColor Cyan
        
        # Install Vercel CLI
        npm install -g vercel
        
        # Navigate to frontend
        Set-Location "frontend"
        
        # Deploy to Vercel
        Write-Host "`nDeploying to Vercel..." -ForegroundColor Yellow
        vercel
        
        Write-Host "`n✅ Frontend deployment initiated!" -ForegroundColor Green
        Write-Host "📝 Remember to:" -ForegroundColor Yellow
        Write-Host "   1. Update VITE_API_URL with your Railway backend URL" -ForegroundColor White
        Write-Host "   2. Configure environment variables in Vercel dashboard" -ForegroundColor White
    }
    
    "2" {
        Write-Host "`n🚀 Installing Railway CLI and deploying backend..." -ForegroundColor Cyan
        
        # Install Railway CLI
        npm install -g @railway/cli
        
        # Navigate to backend
        Set-Location "backend"
        
        # Login to Railway
        Write-Host "`nLogging into Railway..." -ForegroundColor Yellow
        railway login
        
        # Deploy to Railway
        Write-Host "`nDeploying to Railway..." -ForegroundColor Yellow
        railway up
        
        Write-Host "`n✅ Backend deployment initiated!" -ForegroundColor Green
        Write-Host "📝 Remember to:" -ForegroundColor Yellow
        Write-Host "   1. Add PostgreSQL service in Railway dashboard" -ForegroundColor White
        Write-Host "   2. Configure all environment variables" -ForegroundColor White
    }
    
    "3" {
        Write-Host "`n🚀 Full deployment starting..." -ForegroundColor Cyan
        
        # Install both CLIs
        npm install -g vercel @railway/cli
        
        # Deploy backend first
        Write-Host "`n📦 Deploying backend to Railway..." -ForegroundColor Yellow
        Set-Location "backend"
        railway login
        railway up
        
        # Deploy frontend
        Write-Host "`n🌐 Deploying frontend to Vercel..." -ForegroundColor Yellow
        Set-Location "../frontend"
        vercel
        
        Write-Host "`n✅ Full deployment initiated!" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "`n📖 Deployment Guide:" -ForegroundColor Cyan
        Write-Host "===================" -ForegroundColor Cyan
        Write-Host "`n1. Backend (Railway):" -ForegroundColor Yellow
        Write-Host "   - Go to railway.app and create account" -ForegroundColor White
        Write-Host "   - Add PostgreSQL service" -ForegroundColor White
        Write-Host "   - Deploy backend from GitHub" -ForegroundColor White
        Write-Host "   - Configure environment variables from .env.railway" -ForegroundColor White
        
        Write-Host "`n2. Frontend (Vercel):" -ForegroundColor Yellow
        Write-Host "   - Go to vercel.com and create account" -ForegroundColor White
        Write-Host "   - Import GitHub repository" -ForegroundColor White
        Write-Host "   - Set root directory to 'frontend'" -ForegroundColor White
        Write-Host "   - Configure environment variables from .env.vercel" -ForegroundColor White
        
        Write-Host "`n📚 Read the detailed guides:" -ForegroundColor Cyan
        Write-Host "   - RAILWAY_DEPLOYMENT.md" -ForegroundColor White
        Write-Host "   - VERCEL_DEPLOYMENT.md" -ForegroundColor White
        Write-Host "   - CLOUD_DEPLOYMENT_COMPLETE_GUIDE.md" -ForegroundColor White
    }
    
    default {
        Write-Host "`n❌ Invalid option. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n🎉 Deployment helper completed!" -ForegroundColor Green
Write-Host "📖 Check the deployment guides for detailed instructions." -ForegroundColor Yellow
