-- This migration is based on the backend plan provided.

-- 1. Alter Existing Tables

-- Add preferred_district to enquiries
ALTER TABLE public.enquiries
ADD COLUMN preferred_district TEXT;

-- Create a status type for referrals and add the column
CREATE TYPE referral_status AS ENUM ('pending', 'paid', 'expired');
ALTER TABLE public.referrals
ADD COLUMN status referral_status NOT NULL DEFAULT 'pending';

-- Add optional columns to centres
ALTER TABLE public.centres
ADD COLUMN coordinator_email TEXT,
ADD COLUMN upi_id TEXT,
ADD COLUMN commission_rate NUMERIC(4, 2); -- Example: 99.99

-- Add description to videos
ALTER TABLE public.videos
ADD COLUMN description TEXT;

-- 2. Create New Tables

-- Table for quiz results
CREATE TABLE public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    score INT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT score_check CHECK (score >= 0 AND score <= 100)
);

-- Table for Q&A questions
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for Q&A answers
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS for New Tables

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- 4. Define RLS Policies

-- Overwrite existing policies for more specific rules from the plan
DROP POLICY IF EXISTS "insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "select own enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "select own referrals" ON public.referrals;

-- results: Users can manage their own results.
CREATE POLICY "allow all on own results" ON public.results
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- enquiries: Users can manage their own enquiries.
CREATE POLICY "allow all on own enquiries" ON public.enquiries
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- referrals: Users can see their own referrals. A centre-specific policy would be added separately.
CREATE POLICY "allow select on own referrals" ON public.referrals
FOR SELECT USING (auth.uid() = user_id);

-- questions: Authenticated users can view, and users can manage their own.
CREATE POLICY "allow select for authenticated users" ON public.questions
FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow all on own questions" ON public.questions
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- answers: Authenticated users can view, and users can manage their own.
CREATE POLICY "allow select for authenticated users" ON public.answers
FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow all on own answers" ON public.answers
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

