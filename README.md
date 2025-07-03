# RS-CIT Hybrid Micro-Learning Platform

## Overview
A full-featured, scalable platform for RS-CIT certification, blending AI-driven micro-lessons, adaptive quizzes, flexible payments, and trusted local ITGK centre partnerships.

---

## Features
- **Student Onboarding:** Email/OTP signup, profile completion, centre & EMI selection
- **Daily Lessons:** 30-min micro-lessons (video/audio/text), progress tracking, streaks
- **Adaptive Quizzes:** MCQs with instant feedback, retry logic, analytics
- **Payments:** Razorpay integration for EMI/one-time, payment status tracking
- **Dashboards:**
  - Student: Progress, badges, leaderboard, chat support
  - Centre: Referrals, attendance, payouts, earnings
  - Admin: Centre approvals, content management, analytics, payout management
- **Notifications:** Email/SMS for reminders, nudges, and status updates
- **24×7 Doubt Chat:** AI + human support (stubbed, ready for integration)
- **Reporting:** Downloadable reports for admin/centres
- **Mobile & PWA:** Fully responsive, installable
- **Accessibility & Localization:** ARIA, keyboard navigation, Hindi-ready

---

## Tech Stack
- **Frontend:** Next.js (TypeScript), React, Tailwind CSS, Bootstrap
- **Backend/Auth/DB:** Supabase (Postgres, Auth)
- **Payments:** Razorpay
- **Maps:** Mapbox (or Google Maps)
- **AI/Media:** OpenAI, ElevenLabs, Synthesia (stubbed for now)
- **Deployment:** Vercel, Supabase hosting, GitHub Actions (CI/CD)

---

## Getting Started

### 1. Clone the Repo
```bash
git clone <your-repo-url>
cd recite-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root with the following keys:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
NEXT_PUBLIC_RAZORPAY_KEY=your-razorpay-key
# Add any other API keys as needed
```

- **Supabase:** [Get your project URL and anon key from the Supabase dashboard.](https://app.supabase.com/)
- **Mapbox:** [Get your access token here.](https://account.mapbox.com/)
- **Razorpay:** [Get your API key here.](https://dashboard.razorpay.com/)

### 4. Run the Project
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Project Structure
- `src/app/` — Next.js app directory (routing, pages)
- `src/components/` — Shared React components
- `src/supabaseClient.ts` — Supabase client setup
- `pages/api/` — API routes (if needed)
- `public/` — Static assets
- `types/` — TypeScript types

---

## Deployment
- **Frontend:** Deploy to [Vercel](https://vercel.com/)
- **Backend:** Supabase auto-hosted (Postgres, Auth, Storage)
- **CI/CD:** GitHub Actions (already configured)

---

## Contribution Guidelines
- Fork the repo and create a feature branch
- Commit descriptive messages
- Open a pull request for review
- For environment/API changes, update this README

---

## API & Integration Notes
- **Supabase** is the backend for all data, auth, and storage. Configure your project in `src/supabaseClient.ts` and `.env.local`.
- **Mapbox** is used for centre finder maps. Set your token in `.env.local`.
- **Razorpay** is used for payments. Set your key in `.env.local`.
- **AI/Media** integrations (OpenAI, ElevenLabs, Synthesia) are stubbed; add your keys and endpoints as you integrate.

---

## Support
For help, open an issue or contact the project maintainer.