import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons(
          id,
          title,
          description,
          duration_minutes,
          order_number,
          module
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    // Add lesson count and total duration to each course
    const coursesWithStats = courses?.map(course => ({
      ...course,
      lesson_count: course.lessons?.length || 0,
      total_duration_minutes: course.lessons?.reduce((sum: number, lesson: any) => 
        sum + (lesson.duration_minutes || 0), 0) || 0
    })) || []

    res.status(200).json(coursesWithStats)

  } catch (error: any) {
    console.error('Courses fetch error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}