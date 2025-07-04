interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  fees: number;
  capacity: number;
  verified: boolean;
}

interface Video {
  youtube_id: string;
  title: string;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  correct_index: number;
}

interface Question {
  id: string;
  user_id: string;
  module_id: string;
  text: string;
  created_at: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  video_url?: string;
  completed?: boolean;
}
