#!/bin/bash

# Quick deployment script for RS-CIT Platform
echo "🚀 Deploying RS-CIT Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel (you'll need to install Vercel CLI first)
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your real Supabase project"
echo "2. Add your domain to environment variables"
echo "3. Test all features on live site"
echo "4. Share your link and start collecting leads!"
echo ""
echo "🎉 Your RS-CIT Platform is now LIVE!"