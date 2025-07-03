-- This migration enables Supabase Realtime for the Q&A feature.

-- 1. Set the replica identity for the tables.
-- This allows Supabase to broadcast detailed changes (e.g., old vs. new data on update).
ALTER TABLE public.questions REPLICA IDENTITY FULL;
ALTER TABLE public.answers REPLICA IDENTITY FULL;

-- 2. Add the tables to the Supabase Realtime publication.
-- This tells Postgres to start broadcasting insert, update, and delete events for these tables.
-- The 'supabase_realtime' publication is the default used by the Supabase platform.
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;

-- Note: After applying this migration, you can subscribe to changes
-- on the 'questions' and 'answers' tables from your frontend client
-- using the Supabase JS library to build the real-time Q&A UI.
