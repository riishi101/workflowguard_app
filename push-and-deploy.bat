@echo off
echo 🚀 Pushing Changes and Setting Up Deployment...
echo.

echo 📝 Adding all changes to git...
git add .
if %errorlevel% neq 0 (
    echo ❌ Git add failed
    pause
    exit /b 1
)

echo 📝 Committing changes...
git commit -m "🚀 Production Ready: PostgreSQL database, security features, and automatic deployment"
if %errorlevel% neq 0 (
    echo ❌ Git commit failed
    pause
    exit /b 1
)

echo 📝 Pushing to main branch...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Git push failed
    pause
    exit /b 1
)

echo.
echo ✅ Changes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Set up Render for backend deployment
echo 2. Set up Vercel for frontend deployment
echo 3. Configure environment variables
echo 4. Test the production deployment
echo.
echo 📖 See AUTOMATIC_DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause 