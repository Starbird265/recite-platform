-- RS-CIT Platform Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security on all tables
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  enquiry_id TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
  center_id UUID REFERENCES centers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Centers table
CREATE TABLE centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0.0,
  fees INTEGER NOT NULL,
  capacity INTEGER DEFAULT 50,
  verified BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE NOT NULL,
  owner_name TEXT,
  owner_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_hours INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table (updated to link with courses)
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- HTML content
  video_url TEXT,
  audio_url TEXT,
  duration_minutes INTEGER DEFAULT 30,
  order_number INTEGER NOT NULL,
  module TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE quiz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer INTEGER NOT NULL, -- Index of correct option
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER, -- Quiz score percentage
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  center_id UUID REFERENCES centers(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'razorpay',
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  emi_plan TEXT CHECK (emi_plan IN ('3_months', '4_months', '6_months')),
  installment_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  center_id UUID REFERENCES centers(id),
  emi_plan TEXT CHECK (emi_plan IN ('3_months', '4_months', '6_months')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed', 'cancelled')),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exam_date DATE,
  admit_card_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- Emoji or icon name
  criteria JSONB, -- Conditions to earn achievement
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Attendance table (for center tracking)
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  center_id UUID REFERENCES centers(id),
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  hours_attended DECIMAL(4, 2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, center_id, date)
);

-- Center referrals table
CREATE TABLE center_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID REFERENCES centers(id),
  user_id UUID REFERENCES users(id),
  referral_fee DECIMAL(10, 2) DEFAULT 350.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_centers_city ON centers(city);
CREATE INDEX idx_centers_verified ON centers(verified);
CREATE INDEX idx_lessons_module ON lessons(module);
CREATE INDEX idx_lessons_order ON lessons(order_number);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_center_id ON enrollments(center_id);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress 
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment policies
CREATE POLICY "Users can view own payments" ON payments 
  FOR SELECT USING (auth.uid() = user_id);

-- Enrollment policies  
CREATE POLICY "Users can view own enrollments" ON enrollments 
  FOR SELECT USING (auth.uid() = user_id);

-- Public read access for some tables
CREATE POLICY "Anyone can view centers" ON centers FOR SELECT USING (verified = true);
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view quiz" ON quiz FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

-- Sample data insertion
-- Insert some sample achievements
INSERT INTO achievements (title, description, icon, points) VALUES 
('First Steps', 'Complete your first lesson', '🎯', 10),
('Week Warrior', 'Maintain a 7-day learning streak', '🔥', 50),
('Quiz Master', 'Score 90%+ on 5 quizzes', '🏆', 100),
('Early Bird', 'Complete lessons before 10 AM for 7 days', '🌅', 75),
('Night Owl', 'Complete lessons after 8 PM for 7 days', '🦉', 75),
('Perfect Score', 'Get 100% on any quiz', '💯', 25),
('Consistent Learner', 'Complete 30 lessons', '📚', 200),
('Speed Demon', 'Complete a lesson in under 15 minutes', '⚡', 30);

-- Insert sample RS-CIT courses
INSERT INTO courses (title, description, duration_hours, difficulty) VALUES
('RS-CIT Fundamentals', 'Complete RS-CIT certification course covering all essential topics', 132, 'beginner'),
('Advanced Computer Applications', 'Advanced topics for RS-CIT including databases and networking', 40, 'intermediate'),
('MS Office Mastery', 'Comprehensive Microsoft Office training for RS-CIT', 60, 'beginner');

-- Insert sample RS-CIT lesson modules (linked to courses)
INSERT INTO lessons (course_id, title, description, content, duration_minutes, order_number, module, difficulty) VALUES
((SELECT id FROM courses WHERE title = 'RS-CIT Fundamentals' LIMIT 1), 'Introduction to Computers', 'Basic concepts of computer systems and their components', '<h2>What is a Computer?</h2><p>A computer is an electronic device that processes data...</p>', 30, 1, 'Computer Fundamentals', 'beginner'),
((SELECT id FROM courses WHERE title = 'RS-CIT Fundamentals' LIMIT 1), 'Operating Systems Basics', 'Understanding operating systems and their functions', '<h2>Operating Systems</h2><p>An operating system manages computer hardware and software...</p>', 35, 2, 'Computer Fundamentals', 'beginner'),
((SELECT id FROM courses WHERE title = 'MS Office Mastery' LIMIT 1), 'Microsoft Word Basics', 'Introduction to word processing with MS Word', '<h2>Microsoft Word</h2><p>Learn the basics of document creation and formatting...</p>', 40, 3, 'MS Office', 'beginner'),
((SELECT id FROM courses WHERE title = 'MS Office Mastery' LIMIT 1), 'Excel Fundamentals', 'Spreadsheet basics and formulas in Excel', '<h2>Microsoft Excel</h2><p>Introduction to spreadsheets, cells, and basic formulas...</p>', 45, 4, 'MS Office', 'intermediate');

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON centers
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();