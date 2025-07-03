import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-supabase-url.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Database Types
export interface User {
  id: string
  email: string
  name: string
  phone: string
  city: string
  enquiry_id?: string
  subscription_plan?: 'basic' | 'premium'
  center_id?: string
  created_at: string
  updated_at: string
}

export interface Center {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  latitude: number
  longitude: number
  rating: number
  fees: number
  capacity: number
  verified: boolean
  referral_code: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  duration_hours: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  content: string
  video_url?: string
  audio_url?: string
  duration_minutes: number
  order_number: number
  module: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  lesson_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  score?: number
  completed_at?: string
  time_spent_minutes: number
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  payment_method: string
  razorpay_payment_id?: string
  razorpay_order_id?: string
  emi_plan?: '3_months' | '4_months' | '6_months'
  created_at: string
}