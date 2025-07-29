#!/bin/bash

# WorkflowGuard Production Optimization Script
echo "🚀 Optimizing WorkflowGuard for Production..."

# Check if we're in the project root
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root"
    exit 1
fi

echo "📋 Checking production configuration..."

# Backend optimization
echo "🔧 Optimizing backend..."
cd backend

# Check environment variables
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from example..."
    cp env.example .env
fi

# Check if production database URL is set
if grep -q "neondb_owner" .env; then
    echo "✅ Production database configured"
else
    echo "⚠️  Using local database for development"
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Frontend optimization
echo "🎨 Optimizing frontend..."
cd ../frontend

# Check environment variables
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from example..."
    cp env.example .env
fi

# Check if production API URL is set
if grep -q "api.workflowguard.pro" .env; then
    echo "✅ Production API URL configured"
else
    echo "⚠️  Using local API for development"
fi

# Build frontend for production
echo "🔨 Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Check Docker configuration
echo "🐳 Checking Docker configuration..."
cd ..

if [ -f "docker-compose.yml" ]; then
    echo "✅ Docker Compose configuration found"
else
    echo "⚠️  No Docker Compose configuration found"
fi

# Check for production domains
echo "🌐 Checking production domains..."
if grep -q "workflowguard.pro" frontend/.env; then
    echo "✅ Production domains configured"
else
    echo "⚠️  Using development URLs"
fi

echo ""
echo "🎉 Production optimization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend to Render:"
echo "   - Connect GitHub repository"
echo "   - Set environment variables"
echo "   - Deploy automatically"
echo ""
echo "2. Deploy frontend to Vercel:"
echo "   - Install Vercel CLI: npm i -g vercel"
echo "   - Deploy: vercel --prod"
echo ""
echo "3. Test production:"
echo "   - Visit https://www.workflowguard.pro"
echo "   - Create test account"
echo "   - Verify all features work"
echo ""
echo "4. Monitor deployment:"
echo "   - Vercel dashboard for frontend"
echo "   - Render dashboard for backend"
echo "   - Neon dashboard for database"
echo ""
echo "🚀 Your WorkflowGuard app is ready for production!" 