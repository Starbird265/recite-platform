-- This migration adds the schema needed for missed lesson reminders.

-- 1. Add a publication date to videos to define when a lesson is available

ALTER TABLE public.videos
ADD COLUMN published_at TIMESTAMPTZ DEFAULT now();

-- 2. Create a table to log notifications for users

CREATE TYPE notification_type AS ENUM ('missed_lesson_reminder', 'new_enquiry', 'payment_complete', 'qa_answered');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    status notification_status NOT NULL DEFAULT 'pending',
    content JSONB, -- Store extra info, e.g., { missed_count: 3 }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS and set policies

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "allow select on own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- Service roles can do anything (for the edge function)
CREATE POLICY "allow all for service role" ON public.notifications
FOR ALL USING (auth.role() = 'service_role');
