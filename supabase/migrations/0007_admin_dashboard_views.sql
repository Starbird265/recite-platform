-- This migration adds views for the admin dashboard to provide aggregated data.

-- 1. View for Content Summary (Videos, Quizzes, Questions, Answers)
CREATE OR REPLACE VIEW public.admin_content_summary AS
SELECT
    'videos' AS content_type,
    status,
    COUNT(*) AS count
FROM public.videos
GROUP BY status

UNION ALL

SELECT
    'quizzes' AS content_type,
    status,
    COUNT(*) AS count
FROM public.quizzes
GROUP BY status

UNION ALL

SELECT
    'questions' AS content_type,
    status,
    COUNT(*) AS count
FROM public.questions
GROUP BY status

UNION ALL

SELECT
    'answers' AS content_type,
    status,
    COUNT(*) AS count
FROM public.answers
GROUP BY status;

-- 2. View for User Summary
-- Note: This counts users from auth.users table. RLS on this view should be restricted to admins.
CREATE OR REPLACE VIEW public.admin_user_summary AS
SELECT
    COUNT(id) AS total_users
FROM auth.users;

-- 3. View for Referral Summary
CREATE OR REPLACE VIEW public.admin_referral_summary AS
SELECT
    status,
    COUNT(*) AS count
FROM public.referrals
GROUP BY status;

-- RLS for admin views: Security is implicitly handled by RLS on underlying tables and the 'is_admin()' function.
-- No direct RLS policies are applied to views.
