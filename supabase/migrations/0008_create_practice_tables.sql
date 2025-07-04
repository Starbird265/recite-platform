create table practice_tests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  started_at timestamp default now(),
  ended_at timestamp,
  score int
);

create table practice_test_questions (
  id serial primary key,
  test_id uuid references practice_tests,
  quiz_id uuid references quizzes,
  answer text,
  is_correct boolean
);