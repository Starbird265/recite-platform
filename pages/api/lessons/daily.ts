import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    // Get user's progress to determine next lesson
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', user_id)
      .eq('completed', true)

    if (progressError) {
      throw progressError
    }

    const completedLessonIds = progressData?.map(p => p.lesson_id) || []
    
    // Get the next lesson that hasn't been completed
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .not('id', 'in', completedLessonIds.length > 0 ? `(${completedLessonIds.join(',')})` : '()')
      .order('order')
      .limit(1)

    if (lessonError) {
      throw lessonError
    }

    if (!lessonData || lessonData.length === 0) {
      return res.status(200).json({ 
        lesson: null, 
        message: 'All lessons completed! Congratulations!' 
      })
    }

    const todayLesson = lessonData[0]

    // Get related quiz questions
    const { data: quizData } = await supabase
      .from('quiz')
      .select('*')
      .eq('lesson_id', todayLesson.id)

    res.status(200).json({
      lesson: {
        ...todayLesson,
        quiz_questions: quizData || []
      }
    })

  } catch (error: any) {
    console.error('Error fetching daily lesson:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}