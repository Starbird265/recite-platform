import type { NextApiRequest, NextApiResponse } from 'next'

// Demo data for testing without database
export const demoData = {
  user: {
    id: 'demo-user-id',
    email: 'demo@rscit.com',
    name: 'Demo User',
    phone: '+91 98765 43210',
    city: 'Jaipur',
    subscription_plan: 'premium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  courses: [
    {
      id: 'course-1',
      title: 'RS-CIT Fundamentals',
      description: 'Complete RS-CIT certification course covering all essential topics',
      thumbnail_url: '/images/rscit-course.jpg',
      duration_hours: 132,
      difficulty: 'beginner',
      is_active: true,
      lesson_count: 15,
      total_duration_minutes: 450
    },
    {
      id: 'course-2',
      title: 'Advanced Computer Applications',
      description: 'Advanced topics for RS-CIT including databases and networking',
      thumbnail_url: '/images/advanced-course.jpg',
      duration_hours: 40,
      difficulty: 'intermediate',
      is_active: true,
      lesson_count: 8,
      total_duration_minutes: 320
    }
  ],
  
  lessons: [
    {
      id: 'lesson-1',
      course_id: 'course-1',
      title: 'Introduction to Computers',
      description: 'Basic concepts of computer systems and their components',
      duration_minutes: 30,
      order_number: 1,
      module: 'Computer Fundamentals',
      difficulty: 'beginner',
      is_active: true
    },
    {
      id: 'lesson-2',
      course_id: 'course-1',
      title: 'Operating Systems Basics',
      description: 'Understanding operating systems and their functions',
      duration_minutes: 35,
      order_number: 2,
      module: 'Computer Fundamentals',
      difficulty: 'beginner',
      is_active: true
    }
  ],
  
  progress: [
    {
      id: 'progress-1',
      user_id: 'demo-user-id',
      lesson_id: 'lesson-1',
      completed: true,
      score: 95,
      time_spent_minutes: 28,
      completed_at: new Date().toISOString()
    },
    {
      id: 'progress-2',
      user_id: 'demo-user-id',
      lesson_id: 'lesson-2',
      completed: false,
      score: null,
      time_spent_minutes: 15,
      completed_at: null
    }
  ],
  
  centers: [
    {
      id: 'center-1',
      name: 'Jaipur Central Hub',
      address: 'MI Road, Jaipur',
      city: 'Jaipur',
      phone: '+91 98765 12345',
      email: 'jaipur@rscit.com',
      latitude: 26.9124,
      longitude: 75.7873,
      rating: 4.8,
      fees: 3500,
      capacity: 50,
      verified: true,
      referral_code: 'JAIPUR001'
    },
    {
      id: 'center-2',
      name: 'Udaipur Tech Center',
      address: 'City Palace Road, Udaipur',
      city: 'Udaipur',
      phone: '+91 98765 12346',
      email: 'udaipur@rscit.com',
      latitude: 24.5854,
      longitude: 73.6855,
      rating: 4.6,
      fees: 3200,
      capacity: 40,
      verified: true,
      referral_code: 'UDAIPUR001'
    }
  ],
  
  analytics: {
    overview: {
      totalUsers: 1247,
      totalLessons: 45,
      totalCourses: 3,
      totalCenters: 8,
      totalRevenue: 485000,
      completionRate: 87,
      averageScore: 92,
      activeEnrollments: 156
    },
    
    userGrowth: Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 20) + 5,
        enrollments: Math.floor(Math.random() * 10) + 2
      }
    }),
    
    revenueAnalytics: Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        enrollments: Math.floor(Math.random() * 100) + 20
      }
    })
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { type } = req.query

  try {
    switch (type) {
      case 'user':
        res.status(200).json(demoData.user)
        break
      case 'courses':
        res.status(200).json(demoData.courses)
        break
      case 'lessons':
        res.status(200).json(demoData.lessons)
        break
      case 'progress':
        res.status(200).json(demoData.progress)
        break
      case 'centers':
        res.status(200).json(demoData.centers)
        break
      case 'analytics':
        res.status(200).json(demoData.analytics)
        break
      default:
        res.status(200).json(demoData)
    }
  } catch (error: any) {
    console.error('Demo data error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}