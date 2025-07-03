-- This migration adds user statistics and the triggers to keep them updated.

-- 1. Create a table to store user stats per module

CREATE TABLE public.user_module_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    average_score NUMERIC(5, 2) DEFAULT 0.00,
    quiz_attempts INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, module_id) -- Ensure only one stats entry per user/module
);

-- Enable RLS for the new table
ALTER TABLE public.user_module_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats
CREATE POLICY "allow select on own stats" ON public.user_module_stats
FOR SELECT USING (auth.uid() = user_id);


-- 2. Create a trigger function to update the stats table

CREATE OR REPLACE FUNCTION update_user_module_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Use a common table expression to calculate new stats
    WITH new_stats AS (
        SELECT
            AVG(score) as new_avg_score,
            COUNT(*) as new_quiz_attempts
        FROM public.results
        WHERE user_id = NEW.user_id AND module_id = NEW.module_id
    )
    -- Insert or update the stats table
    INSERT INTO public.user_module_stats (user_id, module_id, average_score, quiz_attempts, updated_at)
    VALUES (NEW.user_id, NEW.module_id, (SELECT new_avg_score FROM new_stats), (SELECT new_quiz_attempts FROM new_stats), now())
    ON CONFLICT (user_id, module_id)
    DO UPDATE SET
        average_score = EXCLUDED.average_score,
        quiz_attempts = EXCLUDED.quiz_attempts,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger that fires after a new result is inserted

CREATE TRIGGER on_new_result_update_stats
AFTER INSERT ON public.results
FOR EACH ROW
EXECUTE FUNCTION update_user_module_stats();
