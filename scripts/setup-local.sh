#!/bin/bash

# RS-CIT Platform Local Development Setup
echo "🚀 Setting up RS-CIT Platform for local development..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Initialize Supabase project (if not already initialized)
if [ ! -f "supabase/config.toml" ]; then
    echo "Initializing Supabase project..."
    supabase init
fi

# Start local Supabase services
echo "Starting local Supabase services..."
supabase start

# Get the local API URL and anon key
echo "Getting local Supabase credentials..."
API_URL=$(supabase status | grep 'API URL' | awk '{print $3}')
ANON_KEY=$(supabase status | grep 'anon key' | awk '{print $3}')

# Create or update .env.local with local settings
echo "Updating .env.local with local credentials..."
cat > .env.local << EOF
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY

# Third-party Services (Public Keys Only)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_YOUTUBE_DOMAIN=yourdomain.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

# AI Services (Keep private - used in Edge Functions)
GEMINI_SA_KEY=''
GEMINI_PROJECT=''
GEMINI_MODEL=''

# Development
NODE_ENV=development
EOF

# Install dependencies
echo "Installing dependencies..."
npm install

# Run database migrations
echo "Running database migrations..."
supabase db reset

# Seed database with sample data
echo "Seeding database with sample data..."
supabase db seed

# Start Next.js development server
echo "✅ Setup complete! Starting development server..."
echo ""
echo "🌐 Local Supabase Studio: http://localhost:54323"
echo "🌐 Next.js App: http://localhost:3000"
echo ""
echo "To stop local services, run: supabase stop"
echo ""

# Start Next.js in the background
npm run dev &

# Keep the script running
wait