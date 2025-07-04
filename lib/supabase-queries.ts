import { supabase } from './supabase'

// 🎯 User Management
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// 🏢 Center Management
export const getCenters = async () => {
  const { data, error } = await supabase
    .from('centres')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export const createCenter = async (centerData: {
  name: string
  address: string
  lat: number
  lng: number
  referral_code: string
}) => {
  const { data, error } = await supabase
    .from('centres')
    .insert([centerData])
    .single()

  if (error) throw error
  return data
}

export const updateCenter = async (centerId: string, updates: any) => {
  const { data, error } = await supabase
    .from('centres')
    .update(updates)
    .eq('id', centerId)
    .single()

  if (error) throw error
  return data
}

// 🎓 Course Content
export const getVideos = async (moduleId?: string) => {
  let query = supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: true })

  if (moduleId) {
    query = query.eq('module_id', moduleId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const getQuizQuestions = async (quizId?: string) => {
  let query = supabase
    .from('quiz_questions')
    .select('*')
    .order('created_at', { ascending: true })

  if (quizId) {
    query = query.eq('quiz_id', quizId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const getQuizzes = async (moduleId?: string) => {
  let query = supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: true })

  if (moduleId) {
    query = query.eq('module_id', moduleId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const createVideo = async (videoData: {
  module_id: string
  title: string
  youtube_id: string
}) => {
  const { data, error } = await supabase
    .from('videos')
    .insert([videoData])
    .single()

  if (error) throw error
  return data
}

export const createQuizQuestion = async (quizQuestionData: {
  module_id: string
  question: string
  choices: string[]
  correct_index: number
  quiz_id: string
}) => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert([quizQuestionData])
    .single()

  if (error) throw error
  return data
}

export const createQuiz = async (quizData: {
  module_id: string
  title: string
  description?: string
  difficulty?: string
  duration_minutes?: number
  num_questions?: number
  passing_score?: number
}) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([quizData])
    .single()

  if (error) throw error
  return data
}

// 💰 Payment Management
export const createPayment = async (paymentData: {
  user_id: string
  plan_id: string
  amount: number
  method: string
  status: 'pending' | 'completed' | 'failed'
  transaction_id?: string
}) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .single()

  if (error) throw error
  return data
}

export const getPayments = async (userId?: string) => {
  let query = supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const updatePaymentStatus = async (paymentId: string, status: string, transactionId?: string) => {
  const updates: any = { status }
  if (transactionId) updates.transaction_id = transactionId

  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', paymentId)
    .single()

  if (error) throw error
  return data
}

// 📊 Student Progress
export const getStudentProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export const updateStudentProgress = async (userId: string, moduleId: string, progress: {
  completed_lessons: number
  total_lessons: number
  average_score: number
  time_spent: number
}) => {
  const { data, error } = await supabase
    .from('student_progress')
    .upsert([{
      user_id: userId,
      module_id: moduleId,
      ...progress,
      updated_at: new Date().toISOString()
    }])
    .single()

  if (error) throw error
  return data
}

// 🏆 Achievements
export const getAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })

  if (error) throw error
  return data
}

export const unlockAchievement = async (userId: string, achievementType: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .insert([{
      user_id: userId,
      type: achievementType,
      unlocked_at: new Date().toISOString()
    }])
    .single()

  if (error) throw error
  return data
}

// 📝 Enquiries
export const createEnquiry = async (enquiryData: {
  user_id?: string
  name: string
  email: string
  phone: string
  message: string
  center_id?: string
}) => {
  const { data, error } = await supabase
    .from('enquiries')
    .insert([enquiryData])
    .single()

  if (error) throw error
  return data
}

export const getEnquiries = async (userId?: string) => {
  let query = supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// 🔗 Referrals
export const createReferral = async (referralData: {
  user_id: string
  centre_id: string
  referral_code: string
}) => {
  const { data, error } = await supabase
    .from('referrals')
    .insert([referralData])
    .single()

  if (error) throw error
  return data
}

export const getReferrals = async (userId?: string, centreId?: string) => {
  let query = supabase
    .from('referrals')
    .select('*, centres(*)')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (centreId) {
    query = query.eq('centre_id', centreId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// 📊 Analytics
export const getPartnerStats = async (partnerId: string) => {
  // Get centers for this partner
  const { data: centers, error: centersError } = await supabase
    .from('centres')
    .select('id')
    .eq('partner_id', partnerId)

  if (centersError) throw centersError

  const centerIds = centers.map(c => c.id)

  // Get referrals for these centers
  const { data: referrals, error: referralsError } = await supabase
    .from('referrals')
    .select('*, payments(*)')
    .in('centre_id', centerIds)

  if (referralsError) throw referralsError

  // Calculate stats
  const totalStudents = referrals.length
  const totalRevenue = referrals.reduce((sum, r) => sum + (r.payments?.amount || 0), 0)
  const activeStudents = referrals.filter(r => r.status === 'active').length

  return {
    totalStudents,
    activeStudents,
    totalRevenue,
    centers: centers.length,
    referrals: referrals.length
  }
}

export const getSystemStats = async () => {
  // Get total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Get total centers
  const { count: totalCenters } = await supabase
    .from('centres')
    .select('*', { count: 'exact', head: true })

  // Get total payments
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')

  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

  return {
    totalUsers: totalUsers || 0,
    totalCenters: totalCenters || 0,
    totalRevenue,
    totalPayments: payments?.length || 0
  }
}

// 🔍 Search Functions
export const searchCenters = async (query: string, lat?: number, lng?: number) => {
  let searchQuery = supabase
    .from('centres')
    .select('*')
    .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    .order('name', { ascending: true })

  const { data, error } = await searchQuery

  if (error) throw error

  // If coordinates provided, sort by distance
  if (lat && lng && data) {
    return data.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2))
      const distB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2))
      return distA - distB
    })
  }

  return data
}

export const searchUsers = async (query: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

// 📧 Notifications
export const createNotification = async (notificationData: {
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
}) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .single()

  if (error) throw error
  return data
}

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .single()

  if (error) throw error
  return data
}

// 🗂️ File Upload
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  if (error) throw error
  return data
}

export const getFileUrl = async (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}

// 📱 Real-time Subscriptions
export const subscribeToPayments = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('payments')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'payments',
        filter: `user_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe()
}

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe()
}

// 🔄 Batch Operations
export const batchCreateUsers = async (users: any[]) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(users)

  if (error) throw error
  return data
}

export const batchUpdateProgress = async (progressUpdates: any[]) => {
  const { data, error } = await supabase
    .from('student_progress')
    .upsert(progressUpdates)

  if (error) throw error
  return data
}

// 🎯 Dashboard Specific Functions
export const getTodayLesson = async (userId: string) => {
  try {
    // Get user's current progress to determine next lesson
    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (progressError) throw progressError

    // Get the next lesson based on progress or first lesson if no progress
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('is_active', true)
      .order('order_number', { ascending: true })
      .limit(1)
      .single()

    if (lessonError && lessonError.code !== 'PGRST116') throw lessonError

    return lesson
  } catch (error) {
    console.error('Error fetching today\'s lesson:', error)
    return null
  }
}

export const getUserDashboardStats = async (userId: string) => {
  try {
    // Get user's completed lessons
    const { data: completedLessons, error: lessonsError } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)

    if (lessonsError) throw lessonsError

    // Get total lessons
    const { count: totalLessons, error: countError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (countError) throw countError

    // Get user's quiz attempts
    const { data: quizAttempts, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('score, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10)

    if (quizError) throw quizError

    // Calculate current streak (simplified)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentActivity, error: activityError } = await supabase
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', yesterday.toISOString())

    if (activityError) throw activityError

    // Calculate points (100 points per completed lesson, bonus for quiz scores)
    const lessonPoints = (completedLessons?.length || 0) * 100
    const quizPoints = quizAttempts?.reduce((sum, attempt) => sum + (attempt.score || 0), 0) || 0
    const totalPoints = lessonPoints + quizPoints

    return {
      totalModules: 132, // Fixed for RS-CIT course
      completedModules: completedLessons?.length || 0,
      currentStreak: recentActivity?.length || 0,
      totalPoints,
      recentQuizzes: quizAttempts?.slice(0, 5) || []
    }
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error)
    return {
      totalModules: 132,
      completedModules: 0,
      currentStreak: 0,
      totalPoints: 0,
      recentQuizzes: []
    }
  }
}

export const getRecentQuizAttempts = async (userId: string, limit: number = 5) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        id,
        score,
        completed_at,
        quiz:quizzes(id, module_id, title)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(attempt => {
      return {
        id: attempt.id,
        module: attempt.quiz[0]?.module_id || 'Unknown Module',
        title: attempt.quiz[0]?.title || 'Unknown Title',
        score: attempt.score || 0,
        completedAt: attempt.completed_at
      }
    }) || []
  } catch (error) {
    console.error('Error fetching recent quiz attempts:', error)
    return []
  }
}

export const getLearningStreak = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('completed_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if user has activity today or yesterday
    const sortedDates = data.map(item => new Date(item.completed_at))
    
    for (let i = 0; i < sortedDates.length; i++) {
      const activityDate = new Date(sortedDates[i])
      activityDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - streak)
      
      if (activityDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating learning streak:', error)
    return 0
  }
}

// Practice Test Specific Functions
export const getUserPracticeTestStats = async (userId: string) => {
  try {
    const { data: attempts, error } = await supabase
      .from('practice_test_attempts')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    const totalAttempts = attempts?.length || 0
    const completedTests = attempts?.filter(a => a.status === 'completed').length || 0
    const scores = attempts?.filter(a => a.score !== null).map(a => a.score) || []
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const totalTime = attempts?.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0) || 0

    return {
      totalAttempts,
      completedTests,
      averageScore,
      bestScore,
      timeSpent: Math.round(totalTime / 60) // Convert to minutes
    }
  } catch (error) {
    console.error('Error fetching practice test stats:', error)
    return {
      totalAttempts: 0,
      completedTests: 0,
      averageScore: 0,
      bestScore: 0,
      timeSpent: 0
    }
  }
}