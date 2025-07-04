#!/bin/bash

# RS-CIT Platform Production Deployment Script
echo "🚀 Deploying RS-CIT Platform to production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if environment variables are set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "❌ SUPABASE_PROJECT_ID environment variable not set"
    exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN environment variable not set"
    exit 1
fi

# Build the application
echo "Building Next.js application..."
npm run build

# Deploy Edge Functions to Supabase
echo "Deploying Edge Functions to Supabase..."
supabase functions deploy --project-ref $SUPABASE_PROJECT_ID

# Deploy database migrations
echo "Deploying database migrations..."
supabase db push --project-ref $SUPABASE_PROJECT_ID

# Deploy to Vercel (if using Vercel)
if command -v vercel &> /dev/null; then
    echo "Deploying to Vercel..."
    vercel --prod
else
    echo "Vercel CLI not found. Please deploy manually or install Vercel CLI."
fi

# Set production environment variables reminder
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Don't forget to set these environment variables in your production environment:"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo "   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key"
echo "   NEXT_PUBLIC_YOUTUBE_DOMAIN=yourdomain.com"
echo "   NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key"
echo ""
echo "🔐 Keep these secret keys in your deployment platform's secret store:"
echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "   RAZORPAY_KEY_SECRET=your-razorpay-secret"
echo "   GEMINI_SA_KEY=your-gemini-key"
echo ""