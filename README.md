# RS-CIT Hybrid Micro-Learning Platform

> Democratizing RS-CIT certification through AI-driven micro-lessons and trusted local center network

## 🎯 Vision & Mission

**Mission**: Democratize RS-CIT certification by blending AI-driven micro-lessons with the trusted local ITGK network.

**Core Benefits**:
- **Students**: 30 min/day bite-sized lessons, adaptive quizzes, flexible EMIs, one-click center booking
- **Centers**: Fully-paid pre-qualified students (₹350 referral fee), attendance insights, zero upfront marketing

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Services**: OpenAI GPT-4 + RAG vector store
- **Payments**: Razorpay API with EMI support
- **Maps**: Mapbox for center location
- **Media**: ElevenLabs (AI voice), Synthesia (AI video)
- **Infrastructure**: Vercel (frontend), Supabase hosting

## 📦 Project Structure

```
rs-cit-platform/
├── components/          # Reusable React components
│   ├── AuthContext.tsx  # Authentication context
│   ├── Dashboard.tsx    # Student dashboard
│   ├── LandingPage.tsx  # Marketing landing page
│   └── Login.tsx        # Auth forms
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── lesson/         # Dynamic lesson pages
│   ├── centers.tsx     # Center finder
│   ├── payment.tsx     # Payment & EMI
│   └── index.tsx       # Home page
├── lib/                # Utilities and configurations
│   └── supabase.ts     # Supabase client
├── styles/             # CSS and styling
├── database/           # Database schema
└── public/             # Static assets
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- Razorpay account
- OpenAI API key
- Mapbox account (optional)

### 2. Environment Setup

Create `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# AI Media Services
ELEVENLABS_API_KEY=your_elevenlabs_key
SYNTHESIA_API_KEY=your_synthesia_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql` in Supabase SQL editor
3. Enable RLS (Row Level Security) policies

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 💳 Payment Integration

### EMI Plans Available:
- **3 months**: ₹1,566/month (Total: ₹4,698)
- **4 months**: ₹1,175/month (Total: ₹4,700)
- **6 months**: ₹783/month (Total: ₹4,698) - *Most Popular*

### Razorpay Setup:
1. Create Razorpay account
2. Get API keys from dashboard
3. Configure webhook endpoints for payment verification
4. Test with Razorpay test cards

## 🗺️ Center Network

### Pilot Cities (Phase 1):
- Bharatpur (Primary focus)
- Jaipur, Alwar, Mathura

### Expansion Plan:
- **Months 1-3**: 10-20 centers, 200 pilot learners
- **Months 4-6**: 200+ centers across Rajasthan
- **Year 2**: Adjacent states (UP-DICIT, MP-IT)

### Center Onboarding:
1. MoU signing with ITGK centers
2. Unique referral code generation
3. Dashboard access for center management
4. ₹350 referral fee per successful enrollment

## 🤖 AI-Powered Features

### Micro-Lessons:
- AI-generated scripts using RAG + GPT-4
- 1-3 minute video content (Synthesia)
- AI voice narration (ElevenLabs)
- Text backup for accessibility

### Adaptive Quizzes:
- Auto-generated MCQs with explanations
- Performance-based difficulty adjustment
- Instant feedback and retry logic

### Content Generation API:
```javascript
// Example: Generate lesson content
const response = await fetch('/api/ai/generate-lesson', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'MS Excel Formulas',
    difficulty: 'intermediate',
    duration: 30
  })
});
```

## 📊 Business Model

### Revenue Streams:
- **Student Packages**: ₹4,699 (₹4,200 exam + ₹499 premium)
- **Center Referral**: ₹350 per enrollment (platform keeps ₹150)
- **Subscription Upsell**: ₹499/year for extended features
- **Premium Services**: Doubt resolution, crash courses

### Success Metrics:
- **Engagement**: ≥60% daily lesson completion
- **Conversion**: ≥20% signup to paid enrollment
- **Retention**: ≥70% completion rate
- **Economics**: CAC <₹200, LTV ≈₹649

## 🚢 Deployment

### Vercel Deployment:
```bash
# Connect to Vercel
npm i -g vercel
vercel login
vercel --prod
```

### Environment Variables:
Set all environment variables in Vercel dashboard

### Database Migrations:
- Use Supabase migrations for schema changes
- Backup data before major updates

## 📱 Mobile Responsiveness

The platform is fully responsive and works seamlessly on:
- Desktop (1920px+)
- Laptop (1024px-1920px)
- Tablet (768px-1024px)
- Mobile (320px-768px)

## 🔒 Security Features

- **Authentication**: Supabase Auth with email/OTP
- **Data Protection**: Row Level Security (RLS)
- **Payment Security**: Razorpay with signature verification
- **API Security**: Rate limiting and input validation

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Test payment integration (use Razorpay test keys)
# Test cards: 4111111111111111 (Visa)
```

## 📞 Support & Contact

- **Email**: support@rscit-platform.com
- **Phone**: +91-XXXX-XXXXXX
- **Address**: Jaipur, Rajasthan

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)  
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for democratizing education in Rajasthan**

*Ready to revolutionize RS-CIT certification? Let's make IT education accessible to everyone!*