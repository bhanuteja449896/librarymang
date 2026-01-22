#!/bin/bash

echo "🚀 Library Management System - Quick Setup Script"
echo "=================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not detected. Please ensure MongoDB is installed and running."
    echo "   You can install it from: https://www.mongodb.com/try/download/community"
else
    echo "✅ MongoDB detected"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing frontend dependencies..."
npm install

# Install server dependencies
echo "Installing backend dependencies..."
cd server && npm install && cd ..

echo ""
echo "🔧 Setting up environment files..."

# Create root .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file in root"
else
    echo "⚠️  .env already exists in root"
fi

# Create server .env if it doesn't exist
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env file"
    echo "⚠️  Please update server/.env with your MongoDB URI and JWT secret"
else
    echo "⚠️  server/.env already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update server/.env with your MongoDB connection string"
echo "   2. Ensure MongoDB is running (run 'mongod' in a terminal)"
echo "   3. Start the application:"
echo "      - Backend: cd server && npm run dev"
echo "      - Frontend: npm run dev"
echo "      - Or both: npm run dev:all"
echo ""
echo "📚 Documentation:"
echo "   - API: docs/API.md"
echo "   - Development: docs/DEVELOPMENT.md"
echo "   - Deployment: docs/DEPLOYMENT.md"
echo ""
echo "🎉 Happy coding!"
