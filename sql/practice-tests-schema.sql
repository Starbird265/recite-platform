-- Practice Tests Schema for RS-CIT Platform
-- Run this in your Supabase SQL Editor

-- Practice Test Templates (Admin creates these)
CREATE TABLE practice_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 90, -- 1.5 hours typical
    total_questions INTEGER NOT NULL DEFAULT 50,
    passing_score INTEGER NOT NULL DEFAULT 60, -- 60% to pass
    category VARCHAR(100) DEFAULT 'general', -- 'general', 'module-specific', 'mock-exam'
    difficulty_level VARCHAR(50) DEFAULT 'intermediate', -- 'easy', 'intermediate', 'hard'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Practice Test Attempts (Student takes tests)
CREATE TABLE practice_test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_test_id UUID REFERENCES practice_tests(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    time_taken_seconds INTEGER,
    score DECIMAL(5,2), -- Out of 100
    total_questions INTEGER,
    correct_answers INTEGER,
    wrong_answers INTEGER,
    unanswered INTEGER,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Individual Question Responses in Practice Tests
CREATE TABLE practice_test_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES practice_test_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    selected_answer VARCHAR(10), -- 'A', 'B', 'C', 'D' or NULL for unanswered
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Practice Test Question Pool (Links tests to questions)
CREATE TABLE practice_test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practice_test_id UUID REFERENCES practice_tests(id) ON DELETE CASCADE,
    question_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample practice tests
INSERT INTO practice_tests (title, description, duration_minutes, total_questions, category) VALUES
('RS-CIT Mock Exam - Set 1', 'Complete practice test covering all RS-CIT syllabus topics', 90, 50, 'mock-exam'),
('Computer Fundamentals Test', 'Practice test focused on basic computer concepts', 60, 30, 'module-specific'),
('MS Office Mastery Test', 'Advanced test covering Word, Excel, PowerPoint', 75, 40, 'module-specific'),
('Internet & Email Test', 'Practice test on internet usage and email management', 45, 25, 'module-specific'),
('Full Syllabus Marathon', 'Comprehensive test covering entire RS-CIT curriculum', 120, 75, 'mock-exam');

-- Row Level Security (RLS) Policies
ALTER TABLE practice_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_test_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active practice tests
CREATE POLICY "Anyone can view active practice tests" ON practice_tests
    FOR SELECT USING (is_active = true);

-- Users can only view their own attempts
CREATE POLICY "Users can view own attempts" ON practice_test_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts" ON practice_test_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own attempts
CREATE POLICY "Users can update own attempts" ON practice_test_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own responses
CREATE POLICY "Users can view own responses" ON practice_test_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM practice_test_attempts 
            WHERE id = attempt_id AND user_id = auth.uid()
        )
    );

-- Users can insert their own responses
CREATE POLICY "Users can insert own responses" ON practice_test_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_test_attempts 
            WHERE id = attempt_id AND user_id = auth.uid()
        )
    );

-- Anyone can view practice test questions (for active tests)
CREATE POLICY "Anyone can view practice test questions" ON practice_test_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM practice_tests 
            WHERE id = practice_test_id AND is_active = true
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_practice_test_attempts_user_id ON practice_test_attempts(user_id);
CREATE INDEX idx_practice_test_attempts_test_id ON practice_test_attempts(practice_test_id);
CREATE INDEX idx_practice_test_responses_attempt_id ON practice_test_responses(attempt_id);
CREATE INDEX idx_practice_test_questions_test_id ON practice_test_questions(practice_test_id);