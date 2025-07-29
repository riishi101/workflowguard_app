@echo off
REM Frontend-Backend Integration Setup Script for Windows
REM This script helps set up the integration between frontend and backend

echo 🚀 Setting up WorkflowGuard Frontend-Backend Integration

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    exit /b 1
)

REM Install dependencies
echo 📦 Installing frontend dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ✅ Created .env file. Please update the API URL and other settings as needed.
) else (
    echo ✅ .env file already exists
)

REM Check if backend is running (Windows equivalent)
echo 🔍 Checking backend connection...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:4000' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '✅ Backend is running on http://localhost:4000' } catch { Write-Host '⚠️  Backend is not running on http://localhost:4000' }"

REM Build the project
echo 🔨 Building frontend...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed. Please check the error messages above.
    exit /b 1
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update the .env file with your API configuration
echo 2. Start the backend: cd ../backend ^&^& npm run start:dev
echo 3. Start the frontend: npm run dev
echo 4. Visit http://localhost:3000 to test the integration
echo.
echo For Docker deployment:
echo docker-compose up 