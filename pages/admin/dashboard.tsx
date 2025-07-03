import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Users, 
  BookOpen, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter
} from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalLessons: number
  totalCenters: number
  totalRevenue: number
  activeEnrollments: number
  completionRate: number
  averageScore: number
}

interface RecentActivity {
  id: string
  type: 'enrollment' | 'completion' | 'payment' | 'center_signup'
  user_name: string
  description: string
  amount?: number
  timestamp: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalCenters: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    completionRate: 0,
    averageScore: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Note: In a real app, you'd check for admin privileges
  useEffect(() => {
    if (user) {
      fetchAdminStats()
      fetchRecentActivity()
    }
  }, [user])

  const fetchAdminStats = async () => {
    try {
      // Get users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      // Get lessons count
      const { count: lessonsCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })

      // Get centers count
      const { count: centersCount } = await supabase
        .from('centers')
        .select('*', { count: 'exact', head: true })

      // Get revenue sum
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')

      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Get active enrollments
      const { count: enrollmentsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get completion rate
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('completed, score')

      const completedCount = progressData?.filter(p => p.completed).length || 0
      const totalProgressCount = progressData?.length || 1
      const completionRate = Math.round((completedCount / totalProgressCount) * 100)

      const averageScore = progressData?.length > 0 
        ? Math.round(progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length)
        : 0

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalLessons: lessonsCount || 0,
        totalCenters: centersCount || 0,
        totalRevenue,
        activeEnrollments: enrollmentsCount || 0,
        completionRate,
        averageScore
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // This would be a more complex query in a real app
      // For now, we'll simulate recent activity
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'enrollment',
          user_name: 'John Doe',
          description: 'Enrolled in RS-CIT Fundamentals',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'payment',
          user_name: 'Jane Smith',
          description: 'Payment completed for EMI plan',
          amount: 783,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          type: 'completion',
          user_name: 'Mike Johnson',
          description: 'Completed Introduction to Computers',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]

      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <Users className="h-4 w-4 text-blue-500" />
      case 'payment': return <DollarSign className="h-4 w-4 text-green-500" />
      case 'completion': return <CheckCircle className="h-4 w-4 text-purple-500" />
      case 'center_signup': return <MapPin className="h-4 w-4 text-orange-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to access the admin dashboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | RS-CIT Platform</title>
        <meta name="description" content="Manage the RS-CIT platform - users, courses, centers, and analytics" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <nav className="hidden md:flex space-x-6">
                  <Link href="/admin/dashboard" className="text-rs-blue-600 font-medium">
                    Dashboard
                  </Link>
                  <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
                    Users
                  </Link>
                  <Link href="/admin/courses" className="text-gray-600 hover:text-gray-900">
                    Courses
                  </Link>
                  <Link href="/admin/centers" className="text-gray-600 hover:text-gray-900">
                    Centers
                  </Link>
                  <Link href="/admin/payments" className="text-gray-600 hover:text-gray-900">
                    Payments
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Back to User Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Centers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCenters}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Enrollments</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeEnrollments}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completionRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lessons</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalLessons}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <button className="text-rs-blue-600 hover:text-rs-blue-700 text-sm">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          <span className="font-medium">{activity.user_name}</span> {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {activity.amount && (
                        <div className="flex-shrink-0 text-sm font-medium text-green-600">
                          ₹{activity.amount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/create-course"
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rs-blue-500 hover:bg-rs-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Create Course</p>
                    </div>
                  </Link>

                  <Link
                    href="/create-lesson"
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rs-blue-500 hover:bg-rs-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Create Lesson</p>
                    </div>
                  </Link>

                  <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <div className="text-center">
                      <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Export Data</p>
                    </div>
                  </button>

                  <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Analytics</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}