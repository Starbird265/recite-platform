insert into quizzes (id, module_id, title, description, difficulty, duration_minutes, num_questions, passing_score, created_at, updated_at)
values
  ('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'module-1', 'Introduction to Computers Quiz', 'Test your basic computer knowledge.', 'beginner', 15, 10, 70, now(), now()),
  ('2b3c4d5e-6f78-9012-3456-7890abcdef01', 'module-2', 'MS Word Basics Quiz', 'Assess your understanding of Microsoft Word.', 'beginner', 20, 15, 75, now(), now()),
  ('3c4d5e6f-7890-1234-5678-90abcdef0123', 'module-3', 'Internet Fundamentals Quiz', 'Check your knowledge of internet concepts.', 'intermediate', 25, 20, 80, now(), now());

insert into quiz_questions (id, module_id, question, choices, correct_index, created_at, quiz_id)
values
  (uuid_generate_v4(), 'module-1', 'What does CPU stand for?', ARRAY['Central Processing Unit', 'Computer Personal Unit', 'Central Power Unit', 'Computer Process Unit'], 0, now(), '1a2b3c4d-5e6f-7890-1234-567890abcdef'),
  (uuid_generate_v4(), 'module-1', 'Which of these is an input device?', ARRAY['Monitor', 'Keyboard', 'Printer', 'Speaker'], 1, now(), '1a2b3c4d-5e6f-7890-1234-567890abcdef'),
  (uuid_generate_v4(), 'module-2', 'What is the shortcut for saving a document in MS Word?', ARRAY['Ctrl + S', 'Ctrl + V', 'Ctrl + C', 'Ctrl + X'], 0, now(), '2b3c4d5e-6f78-9012-3456-7890abcdef01'),
  (uuid_generate_v4(), 'module-2', 'Which tab contains the Page Setup options?', ARRAY['Home', 'Insert', 'Layout', 'Design'], 2, now(), '2b3c4d5e-6f78-9012-3456-7890abcdef01'),
  (uuid_generate_v4(), 'module-3', 'What is a web browser?', ARRAY['A software application for accessing information on the World Wide Web', 'A type of computer virus', 'A programming language', 'A search engine'], 0, now(), '3c4d5e6f-7890-1234-5678-90abcdef0123'),
  (uuid_generate_v4(), 'module-3', 'What does URL stand for?', ARRAY['Uniform Resource Locator', 'Universal Reference Link', 'Unified Resource Language', 'User Right Login'], 0, now(), '3c4d5e6f-7890-1234-5678-90abcdef0123');
