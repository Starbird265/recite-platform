import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { user_id, lesson_id, completed, score, time_spent_minutes } = req.body

    // Validate input
    if (!user_id || !lesson_id) {
      return res.status(400).json({ message: 'User ID and Lesson ID are required' })
    }

    // Update or insert progress
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id,
        lesson_id,
        completed: completed || false,
        score: score || null,
        time_spent_minutes: time_spent_minutes || 0,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Check for achievements if lesson completed
    if (completed) {
      await checkAndAwardAchievements(user_id, lesson_id, score)
    }

    res.status(200).json({ 
      message: 'Progress updated successfully',
      progress: data 
    })

  } catch (error: any) {
    console.error('Progress update error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}

async function checkAndAwardAchievements(userId: string, lessonId: string, score?: number) {
  try {
    // Get user's total completed lessons
    const { data: completedLessons } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)

    const completedCount = completedLessons?.length || 0

    // Check for "First Steps" achievement
    if (completedCount === 1) {
      await awardAchievement(userId, 'First Steps')
    }

    // Check for "Perfect Score" achievement
    if (score === 100) {
      await awardAchievement(userId, 'Perfect Score')
    }

    // Check for "Consistent Learner" achievement
    if (completedCount >= 30) {
      await awardAchievement(userId, 'Consistent Learner')
    }

  } catch (error) {
    console.error('Achievement check error:', error)
  }
}

async function awardAchievement(userId: string, achievementTitle: string) {
  try {
    // Get achievement ID
    const { data: achievement } = await supabase
      .from('achievements')
      .select('id')
      .eq('title', achievementTitle)
      .single()

    if (!achievement) return

    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .single()

    if (existing) return

    // Award achievement
    await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
        earned_at: new Date().toISOString()
      })

  } catch (error) {
    console.error('Award achievement error:', error)
  }
}