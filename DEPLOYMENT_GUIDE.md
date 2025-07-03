# 🚀 RS-CIT Platform Deployment Guide

> Complete guide to deploy your RS-CIT Hybrid Micro-Learning Platform

## 📋 Prerequisites

Before deployment, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Supabase account
- ✅ Razorpay account
- ✅ OpenAI API key
- ✅ Vercel account (for deployment)
- ✅ Domain name (optional)

## 🛠️ Environment Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd rs-cit-platform

# Install dependencies
npm install

# Verify installation
npm run type-check
```

### 2. Environment Variables

Create `.env.local` file in root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Mapbox (Optional)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token

# AI Media Services (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_key
SYNTHESIA_API_KEY=your_synthesia_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string
```

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Note down your URL and anon key

### 2. Run Database Schema

1. Open Supabase SQL Editor
2. Copy entire content from `database/schema.sql`
3. Execute the SQL commands
4. Verify all tables are created

### 3. Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### 4. Set Up Authentication

1. In Supabase Dashboard → Authentication → Settings
2. Enable email authentication
3. Configure email templates
4. Set site URL to your domain

## 💳 Payment Setup

### 1. Razorpay Configuration

1. Create [Razorpay](https://razorpay.com) account
2. Get API keys from Dashboard
3. Enable webhooks for payment verification
4. Test with provided test cards

### 2. Test Payment Flow

```bash
# Test payment endpoints
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":78300,"currency":"INR","plan":"6_months","center_id":"test","user_id":"test"}'
```

## 🌍 Local Development

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# Open browser to http://localhost:3000
```

### 2. Test Key Features

- ✅ User registration/login
- ✅ Course browsing
- ✅ Lesson completion
- ✅ Payment flow
- ✅ Center finder
- ✅ Admin dashboard

### 3. Create Sample Data

```sql
-- Insert sample centers (run in Supabase SQL editor)
INSERT INTO centers (name, address, city, phone, email, fees, referral_code, verified) VALUES
('ABC Computer Center', 'Main Market', 'bharatpur', '9876543210', 'abc@example.com', 4200, 'BHA001', true),
('XYZ IT Institute', 'Civil Lines', 'jaipur', '9876543211', 'xyz@example.com', 4500, 'JAI001', true);
```

## 🚀 Production Deployment

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. Environment Variables on Vercel

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Update `NEXT_PUBLIC_APP_URL` to your production URL

### 3. Custom Domain (Optional)

1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS records
4. Update environment variables

## 🔒 Security Configuration

### 1. Database Security

```sql
-- Update RLS policies for production
CREATE POLICY "authenticated_users_only" ON users 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Restrict API access
CREATE POLICY "service_role_only" ON payments 
  FOR INSERT USING (auth.role() = 'service_role');
```

### 2. API Rate Limiting

Add rate limiting middleware in `pages/api/` endpoints:

```typescript
// Example rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

## 📊 Monitoring Setup

### 1. Analytics Integration

```typescript
// Add to _app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### 2. Error Monitoring

```bash
# Install Sentry (optional)
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentry } = require('@sentry/nextjs')
module.exports = withSentry({
  // your existing config
})
```

## 🧪 Testing

### 1. Test User Flows

```bash
# Create test user accounts
# Test payment with Razorpay test cards:
# Card: 4111111111111111
# CVV: 123
# Expiry: Any future date
```

### 2. Performance Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test performance
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## 📱 Mobile Optimization

### 1. PWA Setup (Optional)

```bash
# Install PWA dependencies
npm install next-pwa

# Configure in next.config.js
const withPWA = require('next-pwa')({
  dest: 'public'
})

module.exports = withPWA({
  // your existing config
})
```

### 2. Mobile Testing

- Test on actual devices
- Verify responsive design
- Check payment flow on mobile
- Test offline functionality

## 🔄 Backup Strategy

### 1. Database Backups

- Supabase provides automatic backups
- Set up additional backup scripts if needed
- Store sensitive data securely

### 2. Code Backups

```bash
# Set up GitHub repository
git remote add origin https://github.com/your-username/rs-cit-platform.git
git push -u origin main
```

## 📈 Scaling Considerations

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_user_progress_user_lesson ON user_progress(user_id, lesson_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_centers_city_verified ON centers(city, verified);
```

### 2. CDN Setup

- Use Vercel's edge network
- Configure caching headers
- Optimize images and assets

## 🐛 Troubleshooting

### Common Issues:

1. **Supabase Connection Error**
   ```bash
   # Check environment variables
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

2. **Payment Issues**
   ```bash
   # Verify Razorpay credentials
   # Check webhook URLs
   ```

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

## 📞 Support

For deployment support:
- Check GitHub issues
- Review documentation
- Contact platform administrators

---

**🎉 Congratulations! Your RS-CIT platform is now live and ready to democratize computer education in Rajasthan!**