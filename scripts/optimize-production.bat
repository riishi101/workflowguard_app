@echo off
REM WorkflowGuard Production Optimization Script for Windows
echo 🚀 Optimizing WorkflowGuard for Production...

REM Check if we're in the project root
if not exist "docker-compose.yml" (
    echo ❌ Error: Please run this script from the project root
    exit /b 1
)

echo 📋 Checking production configuration...

REM Backend optimization
echo 🔧 Optimizing backend...
cd backend

REM Check environment variables
if not exist ".env" (
    echo ⚠️  Creating .env file from example...
    copy env.example .env
)

REM Check if production database URL is set
findstr "neondb_owner" .env >nul
if %errorlevel% equ 0 (
    echo ✅ Production database configured
) else (
    echo ⚠️  Using local database for development
)

REM Generate Prisma client
echo 🔨 Generating Prisma client...
call npx prisma generate

REM Frontend optimization
echo 🎨 Optimizing frontend...
cd ..\frontend

REM Check environment variables
if not exist ".env" (
    echo ⚠️  Creating .env file from example...
    copy env.example .env
)

REM Check if production API URL is set
findstr "api.workflowguard.pro" .env >nul
if %errorlevel% equ 0 (
    echo ✅ Production API URL configured
) else (
    echo ⚠️  Using local API for development
)

REM Build frontend for production
echo 🔨 Building frontend for production...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Frontend build successful
) else (
    echo ❌ Frontend build failed
    exit /b 1
)

REM Check Docker configuration
echo 🐳 Checking Docker configuration...
cd ..

if exist "docker-compose.yml" (
    echo ✅ Docker Compose configuration found
) else (
    echo ⚠️  No Docker Compose configuration found
)

REM Check for production domains
echo 🌐 Checking production domains...
findstr "workflowguard.pro" frontend\.env >nul
if %errorlevel% equ 0 (
    echo ✅ Production domains configured
) else (
    echo ⚠️  Using development URLs
)

echo.
echo 🎉 Production optimization complete!
echo.
echo 📋 Next steps:
echo 1. Deploy backend to Render:
echo    - Connect GitHub repository
echo    - Set environment variables
echo    - Deploy automatically
echo.
echo 2. Deploy frontend to Vercel:
echo    - Install Vercel CLI: npm i -g vercel
echo    - Deploy: vercel --prod
echo.
echo 3. Test production:
echo    - Visit https://www.workflowguard.pro
echo    - Create test account
echo    - Verify all features work
echo.
echo 4. Monitor deployment:
echo    - Vercel dashboard for frontend
echo    - Render dashboard for backend
echo    - Neon dashboard for database
echo.
echo 🚀 Your WorkflowGuard app is ready for production! 