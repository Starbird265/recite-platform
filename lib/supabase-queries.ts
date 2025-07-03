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

export const createQuiz = async (quizData: {
  module_id: string
  question: string
  choices: string[]
  correct_index: number
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