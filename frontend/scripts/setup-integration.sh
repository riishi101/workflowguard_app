#!/bin/bash

# Frontend-Backend Integration Setup Script
# This script helps set up the integration between frontend and backend

echo "🚀 Setting up WorkflowGuard Frontend-Backend Integration"

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ Created .env file. Please update the API URL and other settings as needed."
else
    echo "✅ .env file already exists"
fi

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -s http://localhost:4000 > /dev/null; then
    echo "✅ Backend is running on http://localhost:4000"
else
    echo "⚠️  Backend is not running on http://localhost:4000"
    echo "   Please start the backend first:"
    echo "   cd ../backend && npm run start:dev"
fi

# Build the project
echo "🔨 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your API configuration"
echo "2. Start the backend: cd ../backend && npm run start:dev"
echo "3. Start the frontend: npm run dev"
echo "4. Visit http://localhost:3000 to test the integration"
echo ""
echo "For Docker deployment:"
echo "docker-compose up" 