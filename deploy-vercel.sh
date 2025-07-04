#!/bin/bash

echo "🚀 Deploying RS-CIT Platform to Vercel..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."
echo "📋 Follow these steps:"
echo "1. Login to Vercel when prompted"
echo "2. Choose 'Link to existing project' or 'Create new project'"
echo "3. Select your project directory"
echo "4. Use default settings (Next.js should be auto-detected)"
echo "5. Deploy!"
echo ""

# Start deployment
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your live URL from above"
echo "2. Test all features on the live site"
echo "3. Set up environment variables in Vercel dashboard"
echo "4. Share your link and start collecting leads!"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"