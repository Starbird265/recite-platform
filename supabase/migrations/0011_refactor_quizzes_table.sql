-- Rename the old quizzes table to quiz_questions
ALTER TABLE quizzes RENAME TO quiz_questions;

-- Add a new column to quiz_questions to link to the new quizzes table
ALTER TABLE quiz_questions ADD COLUMN quiz_id UUID;

-- Create the new quizzes table for quiz metadata
create table quizzes (
  id uuid primary key default uuid_generate_v4(),
  module_id text not null,
  title text not null,
  description text,
  difficulty text,
  duration_minutes int,
  num_questions int,
  passing_score int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add foreign key constraint to quiz_questions referencing the new quizzes table
ALTER TABLE quiz_questions ADD CONSTRAINT fk_quiz
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

-- Update practice_test_questions to reference the new quizzes table
ALTER TABLE practice_test_questions DROP CONSTRAINT practice_test_questions_quiz_id_fkey;
ALTER TABLE practice_test_questions ADD CONSTRAINT practice_test_questions_quiz_id_fkey
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

-- Enable Row Level Security for the new quizzes table
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;