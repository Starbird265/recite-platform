#!/bin/bash

# RS-CIT Platform Quick Setup Script for Mac
# This script will help you get the platform running quickly

echo "🎨 RS-CIT Platform - Quick Setup for Mac"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/en/download/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating environment file..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your actual configuration values"
    echo "   - Supabase URL and keys"
    echo "   - Razorpay keys (for payments)"
    echo "   - Google Maps API key (for center locations)"
else
    echo "✅ Environment file already exists"
fi

# Create a basic .env.local with demo values
cat > .env.local << EOF
# Demo configuration - Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Development settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Your app will be available at:"
echo "   http://localhost:3000"
echo ""
echo "📄 Demo Pages Available:"
echo "   • http://localhost:3000 - Home page"
echo "   • http://localhost:3000/pixel-test - Pixel art showcase"
echo "   • http://localhost:3000/pixel-landing - Landing page"
echo "   • http://localhost:3000/student-dashboard - Student dashboard"
echo "   • http://localhost:3000/partner-dashboard - Partner dashboard"
echo "   • http://localhost:3000/pixel-payment - Payment system"
echo "   • http://localhost:3000/pixel-analytics - Analytics dashboard"
echo "   • http://localhost:3000/auth - Authentication page"
echo ""
echo "🔧 Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Set up your Supabase database using the schema in database/schema.sql"
echo "3. Configure your payment provider (Razorpay) if needed"
echo "4. Run: npm run dev"
echo ""
echo "🎯 Happy coding! 🎨"