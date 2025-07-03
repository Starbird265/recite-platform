import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalLessons: number
    totalCourses: number
    totalCenters: number
    totalRevenue: number
    completionRate: number
    averageScore: number
    activeEnrollments: number
  }
  userGrowth: Array<{
    date: string
    users: number
    enrollments: number
  }>
  learningProgress: Array<{
    module: string
    completionRate: number
    averageScore: number
    totalLessons: number
  }>
  revenueAnalytics: Array<{
    month: string
    revenue: number
    enrollments: number
  }>
  topPerformingCenters: Array<{
    id: string
    name: string
    city: string
    enrollments: number
    revenue: number
    rating: number
  }>
  coursePopularity: Array<{
    id: string
    title: string
    enrollments: number
    completionRate: number
    averageScore: number
  }>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get overview statistics
    const [
      { count: totalUsers },
      { count: totalLessons },
      { count: totalCourses },
      { count: totalCenters },
      { count: activeEnrollments }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('lessons').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('centers').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ])

    // Get revenue data
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'completed')

    const totalRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    // Get completion and score data
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('completed, score, lessons(module)')

    const completedLessons = progressData?.filter(p => p.completed) || []
    const completionRate = progressData && progressData.length > 0 
      ? Math.round((completedLessons.length / progressData.length) * 100)
      : 0

    const averageScore = completedLessons.length > 0
      ? Math.round(completedLessons.reduce((sum, p) => sum + (p.score || 0), 0) / completedLessons.length)
      : 0

    // Generate user growth data (last 30 days)
    const userGrowth = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 20) + 5, // Mock data
        enrollments: Math.floor(Math.random() * 10) + 2
      }
    })

    // Generate learning progress by module
    const moduleStats = progressData?.reduce((acc: Record<string, { total: number; completed: number; scores: number[] }>, progress: any) => {
      const module = progress.lessons?.module || 'Unknown'
      if (!acc[module]) {
        acc[module] = { total: 0, completed: 0, scores: [] }
      }
      acc[module].total++
      if (progress.completed) {
        acc[module].completed++
        if (progress.score) {
          acc[module].scores.push(progress.score)
        }
      }
      return acc
    }, {}) || {}

    const learningProgress = Object.entries(moduleStats).map(([module, stats]) => ({
      module,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      averageScore: stats.scores.length > 0 
        ? Math.round(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length)
        : 0,
      totalLessons: stats.total
    }))

    // Generate revenue analytics (last 12 months)
    const revenueAnalytics = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        enrollments: Math.floor(Math.random() * 100) + 20
      }
    })

    // Get top performing centers
    const { data: centersData } = await supabase
      .from('centers')
      .select(`
        id,
        name,
        city,
        rating,
        enrollments:center_referrals(count)
      `)
      .eq('verified', true)
      .limit(10)

    const topPerformingCenters = centersData?.map(center => ({
      id: center.id,
      name: center.name,
      city: center.city,
      enrollments: Math.floor(Math.random() * 50) + 10, // Mock data
      revenue: Math.floor(Math.random() * 20000) + 5000,
      rating: center.rating || 4.0
    })) || []

    // Get course popularity
    const { data: coursesData } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        lessons(id, user_progress(completed, score))
      `)
      .eq('is_active', true)

    const coursePopularity = coursesData?.map(course => {
      const allProgress = course.lessons?.flatMap(lesson => lesson.user_progress || []) || []
      const completedProgress = allProgress.filter(p => p.completed)
      
      return {
        id: course.id,
        title: course.title,
        enrollments: Math.floor(Math.random() * 200) + 50, // Mock data
        completionRate: allProgress.length > 0 
          ? Math.round((completedProgress.length / allProgress.length) * 100)
          : 0,
        averageScore: completedProgress.length > 0
          ? Math.round(completedProgress.reduce((sum, p) => sum + (p.score || 0), 0) / completedProgress.length)
          : 0
      }
    }) || []

    const analyticsData: AnalyticsData = {
      overview: {
        totalUsers: totalUsers || 0,
        totalLessons: totalLessons || 0,
        totalCourses: totalCourses || 0,
        totalCenters: totalCenters || 0,
        totalRevenue,
        completionRate,
        averageScore,
        activeEnrollments: activeEnrollments || 0
      },
      userGrowth,
      learningProgress,
      revenueAnalytics,
      topPerformingCenters,
      coursePopularity
    }

    res.status(200).json(analyticsData)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics data' })
  }
}