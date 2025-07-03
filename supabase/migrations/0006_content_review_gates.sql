-- This migration adds content review gates (status column and RLS) to content tables.

-- 1. Create ENUM for content status
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Add status column to existing content tables

ALTER TABLE public.videos
ADD COLUMN status content_status NOT NULL DEFAULT 'pending';

ALTER TABLE public.quizzes
ADD COLUMN status content_status NOT NULL DEFAULT 'pending';

ALTER TABLE public.questions
ADD COLUMN status content_status NOT NULL DEFAULT 'pending';

ALTER TABLE public.answers
ADD COLUMN status content_status NOT NULL DEFAULT 'pending';

-- 3. Update RLS policies for content review

-- Helper function to check for admin role (assuming 'role' in user_metadata)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin';
END;
$$;

-- Videos RLS
DROP POLICY IF EXISTS "auth read videos" ON public.videos;
CREATE POLICY "allow select approved videos" ON public.videos
FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "allow insert pending videos" ON public.videos
FOR INSERT WITH CHECK (status = 'pending' AND auth.role() = 'authenticated');
-- Removed: Videos are not directly owned by users in this schema for updates.
-- CREATE POLICY "allow update own pending videos" ON public.videos
-- FOR UPDATE USING (status = 'pending' AND auth.uid() = user_id)
-- WITH CHECK (status = 'pending' AND auth.uid() = user_id);
CREATE POLICY "allow admin update videos" ON public.videos
FOR UPDATE USING (is_admin() OR auth.role() = 'service_role');
CREATE POLICY "allow admin delete videos" ON public.videos
FOR DELETE USING (is_admin() OR auth.role() = 'service_role');

-- Quizzes RLS
DROP POLICY IF EXISTS "auth read quizzes" ON public.quizzes;
CREATE POLICY "allow select approved quizzes" ON public.quizzes
FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "allow insert pending quizzes" ON public.quizzes
FOR INSERT WITH CHECK (status = 'pending' AND auth.role() = 'authenticated');
-- Removed: Quizzes are not directly owned by users in this schema for updates.
-- CREATE POLICY "allow update own pending quizzes" ON public.quizzes
-- FOR UPDATE USING (status = 'pending' AND auth.uid() = user_id)
-- WITH CHECK (status = 'pending' AND auth.uid() = user_id);
CREATE POLICY "allow admin update quizzes" ON public.quizzes
FOR UPDATE USING (is_admin() OR auth.role() = 'service_role');
CREATE POLICY "allow admin delete quizzes" ON public.quizzes
FOR DELETE USING (is_admin() OR auth.role() = 'service_role');

-- Questions RLS
DROP POLICY IF EXISTS "allow select for authenticated users" ON public.questions;
DROP POLICY IF EXISTS "allow all on own questions" ON public.questions;
CREATE POLICY "allow select approved questions" ON public.questions
FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "allow insert pending questions" ON public.questions
FOR INSERT WITH CHECK (status = 'pending' AND auth.uid() = user_id);
CREATE POLICY "allow update own pending questions" ON public.questions
FOR UPDATE USING (status = 'pending' AND auth.uid() = user_id)
WITH CHECK (status = 'pending' AND auth.uid() = user_id);
CREATE POLICY "allow admin update questions" ON public.questions
FOR UPDATE USING (is_admin() OR auth.role() = 'service_role');
CREATE POLICY "allow admin delete questions" ON public.questions
FOR DELETE USING (is_admin() OR auth.role() = 'service_role');

-- Answers RLS
DROP POLICY IF EXISTS "allow select for authenticated users" ON public.answers;
DROP POLICY IF EXISTS "allow all on own answers" ON public.answers;
CREATE POLICY "allow select approved answers" ON public.answers
FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "allow insert pending answers" ON public.answers
FOR INSERT WITH CHECK (status = 'pending' AND auth.uid() = user_id);
CREATE POLICY "allow update own pending answers" ON public.answers
FOR UPDATE USING (status = 'pending' AND auth.uid() = user_id)
WITH CHECK (status = 'pending' AND auth.uid() = user_id);
CREATE POLICY "allow admin update answers" ON public.answers
FOR UPDATE USING (is_admin() OR auth.role() = 'service_role');
CREATE POLICY "allow admin delete answers" ON public.answers
FOR DELETE USING (is_admin() OR auth.role() = 'service_role');
