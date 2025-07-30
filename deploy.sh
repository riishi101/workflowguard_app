#!/bin/bash

echo "🚀 WorkflowGuard Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Build backend
echo "🔨 Building backend..."
cd backend
npm install
npm run build
echo "✅ Backend built successfully"

# Build frontend
echo "🔨 Building frontend..."
cd ../frontend
npm install
npm run build
echo "✅ Frontend built successfully"

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "2. Deploy Backend to Render:"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Use the configuration from DEPLOYMENT_CHECKLIST.md"
echo ""
echo "3. Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Create new project"
echo "   - Import your GitHub repo"
echo "   - Set root directory to 'frontend'"
echo ""
echo "4. Configure custom domains:"
echo "   - api.workflowguard.pro (Render)"
echo "   - www.workflowguard.pro (Vercel)"
echo ""
echo "✅ Deployment preparation complete!" 