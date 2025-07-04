import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MapPin,
  BookOpen,
  Award,
  Bell,
  Settings,
  Eye,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Target,
  BarChart3,
  PieChart,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

interface PartnerStats {
  totalStudents: number
  activeEnrollments: number
  completedStudents: number
  totalEarnings: number
  monthlyEarnings: number
  referralCommissions: number
  avgRating: number
  totalReferrals: number
  pendingPayouts: number
  thisMonthEnrollments: number
}

interface Student {
  id: string
  name: string
  email: string
  phone: string
  enrolled_at: string
  course_progress: number
  payment_status: 'pending' | 'completed' | 'failed'
  emi_plan: string
  amount_paid: number
  next_payment_date?: string
}

interface Payout {
  id: string
  amount: number
  commission_type: 'referral' | 'completion_bonus'
  student_name: string
  status: 'pending' | 'processed' | 'paid'
  created_at: string
  processed_at?: string
}

interface CenterDetails {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  rating: number
  verified: boolean
  referral_code: string
  created_at: string
}

export default function PartnersDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<PartnerStats>({
    totalStudents: 0,
    activeEnrollments: 0,
    completedStudents: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    referralCommissions: 0,
    avgRating: 0,
    totalReferrals: 0,
    pendingPayouts: 0,
    thisMonthEnrollments: 0
  })
  const [centerDetails, setCenterDetails] = useState<CenterDetails | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!user) return
  
      try {
        setLoading(true)
        
        // Get center details
        const { data: centerData, error: centerError } = await supabase
          .from('centers')
          .select('*')
          .eq('email', user.email)
          .single()
  
        if (centerError) {
          toast.error('Center not found. Please contact support.')
          return
        }
  
        setCenterDetails(centerData)
  
        // Get students referred by this center
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            *,
            users (
              id,
              name,
              email,
              phone
            ),
            user_progress (
              completed,
              lessons (
                id
              )
            )
          `)
          .eq('center_id', centerData.id)
  
        if (enrollmentError) throw enrollmentError
  
        // Process student data
        const studentData: Student[] = enrollmentData?.map(enrollment => {
          const completedLessons = enrollment.user_progress?.filter((p: any) => p.completed).length || 0
          const totalLessons = enrollment.user_progress?.length || 1
          const progress = Math.round((completedLessons / totalLessons) * 100)
  
          return {
            id: enrollment.users.id,
            name: enrollment.users.name,
            email: enrollment.users.email,
            phone: enrollment.users.phone,
            enrolled_at: enrollment.created_at,
            course_progress: progress,
            payment_status: enrollment.payment_status,
            emi_plan: enrollment.emi_plan,
            amount_paid: enrollment.amount_paid || 0,
            next_payment_date: enrollment.next_payment_date
          }
        }) || []
  
        setStudents(studentData)
  
        // Calculate statistics
        const activeEnrollments = studentData.filter(s => s.payment_status === 'completed').length
        const completedStudents = studentData.filter(s => s.course_progress >= 80).length
        const totalEarnings = studentData.reduce((sum, s) => sum + (s.amount_paid * 0.075), 0) // 7.5% commission
        const thisMonthEnrollments = studentData.filter(s => 
          new Date(s.enrolled_at).getMonth() === new Date().getMonth()
        ).length
  
        // Mock additional data for demo
        const mockStats: PartnerStats = {
          totalStudents: studentData.length,
          activeEnrollments,
          completedStudents,
          totalEarnings,
          monthlyEarnings: totalEarnings * 0.3, // Mock monthly earnings
          referralCommissions: totalEarnings * 0.6,
          avgRating: centerData.rating || 4.2,
          totalReferrals: studentData.length,
          pendingPayouts: totalEarnings * 0.2,
          thisMonthEnrollments
        }
  
        setStats(mockStats)
  
        // Mock payout data
        const mockPayouts: Payout[] = [
          {
            id: '1',
            amount: 350,
            commission_type: 'referral',
            student_name: 'John Doe',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            amount: 500,
            commission_type: 'completion_bonus',
            student_name: 'Jane Smith',
            status: 'paid',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            processed_at: new Date().toISOString()
          }
        ]
  
        setPayouts(mockPayouts)
  
      } catch (error) {
        console.error('Error fetching partner data:', error)
        toast.error('Failed to load partner dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPartnerData()
    }
  }, [user, dateRange])

  const fetchPartnerData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get center details
      const { data: centerData, error: centerError } = await supabase
        .from('centers')
        .select('*')
        .eq('email', user.email)
        .single()

      if (centerError) {
        toast.error('Center not found. Please contact support.')
        return
      }

      setCenterDetails(centerData)

      // Get students referred by this center
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          *,
          users (
            id,
            name,
            email,
            phone
          ),
          user_progress (
            completed,
            lessons (
              id
            )
          )
        `)
        .eq('center_id', centerData.id)

      if (enrollmentError) throw enrollmentError

      // Process student data
      const studentData: Student[] = enrollmentData?.map(enrollment => {
        const completedLessons = enrollment.user_progress?.filter((p: any) => p.completed).length || 0
        const totalLessons = enrollment.user_progress?.length || 1
        const progress = Math.round((completedLessons / totalLessons) * 100)

        return {
          id: enrollment.users.id,
          name: enrollment.users.name,
          email: enrollment.users.email,
          phone: enrollment.users.phone,
          enrolled_at: enrollment.created_at,
          course_progress: progress,
          payment_status: enrollment.payment_status,
          emi_plan: enrollment.emi_plan,
          amount_paid: enrollment.amount_paid || 0,
          next_payment_date: enrollment.next_payment_date
        }
      }) || []

      setStudents(studentData)

      // Calculate statistics
      const activeEnrollments = studentData.filter(s => s.payment_status === 'completed').length
      const completedStudents = studentData.filter(s => s.course_progress >= 80).length
      const totalEarnings = studentData.reduce((sum, s) => sum + (s.amount_paid * 0.075), 0) // 7.5% commission
      const thisMonthEnrollments = studentData.filter(s => 
        new Date(s.enrolled_at).getMonth() === new Date().getMonth()
      ).length

      // Mock additional data for demo
      const mockStats: PartnerStats = {
        totalStudents: studentData.length,
        activeEnrollments,
        completedStudents,
        totalEarnings,
        monthlyEarnings: totalEarnings * 0.3, // Mock monthly earnings
        referralCommissions: totalEarnings * 0.6,
        avgRating: centerData.rating || 4.2,
        totalReferrals: studentData.length,
        pendingPayouts: totalEarnings * 0.2,
        thisMonthEnrollments
      }

      setStats(mockStats)

      // Mock payout data
      const mockPayouts: Payout[] = [
        {
          id: '1',
          amount: 350,
          commission_type: 'referral',
          student_name: 'John Doe',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          amount: 500,
          commission_type: 'completion_bonus',
          student_name: 'Jane Smith',
          status: 'paid',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          processed_at: new Date().toISOString()
        }
      ]

      setPayouts(mockPayouts)

    } catch (error) {
      console.error('Error fetching partner data:', error)
      toast.error('Failed to load partner dashboard')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || student.payment_status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to access the partner dashboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partner dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Partners Dashboard | RS-CIT Platform</title>
        <meta name="description" content="Partner dashboard for RS-CIT center owners and administrators" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-gray-900">Partners Dashboard</h1>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{centerDetails?.name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Period:</span>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-rs-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>
                <button
                  onClick={fetchPartnerData}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{stats.thisMonthEnrollments} this month
                  </div>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% from last month
                  </div>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeEnrollments}</p>
                  <div className="flex items-center text-sm text-blue-600 mt-1">
                    <Target className="h-4 w-4 mr-1" />
                    {Math.round((stats.activeEnrollments / stats.totalStudents) * 100)}% active
                  </div>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Center Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                  <div className="flex items-center text-sm text-yellow-600 mt-1">
                    <Star className="h-4 w-4 mr-1" />
                    Excellent rating
                  </div>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'students', label: 'Students', icon: Users },
                  { id: 'payouts', label: 'Payouts', icon: DollarSign },
                  { id: 'analytics', label: 'Analytics', icon: PieChart },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-rs-blue-500 text-rs-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {students.slice(0, 5).map((student) => (
                          <div key={student.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-rs-blue-100 rounded-full p-2">
                              <Users className="h-4 w-4 text-rs-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-600">
                                Enrolled on {new Date(student.enrolled_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.payment_status)}`}>
                                {student.payment_status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Completion Rate</span>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.round((stats.completedStudents / stats.totalStudents) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(stats.completedStudents / stats.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Payment Success Rate</span>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.round((stats.activeEnrollments / stats.totalStudents) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(stats.activeEnrollments / stats.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Monthly Growth</span>
                            <span className="text-sm font-medium text-green-600">+22%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: '78%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link
                        href="/partners/referral-link"
                        className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rs-blue-500 hover:bg-rs-blue-50 transition-colors"
                      >
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Generate Referral Link</p>
                        </div>
                      </Link>

                      <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                        <div className="text-center">
                          <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Download Report</p>
                        </div>
                      </button>

                      <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                        <div className="text-center">
                          <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Send Notification</p>
                        </div>
                      </button>

                      <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                        <div className="text-center">
                          <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Update Profile</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrollment Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                                <div className="text-sm text-gray-500">{student.phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${student.course_progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{student.course_progress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.payment_status)}`}>
                                {student.payment_status}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatCurrency(student.amount_paid)} paid
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(student.enrolled_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <button className="text-rs-blue-600 hover:text-rs-blue-700">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-700">
                                <Download className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payouts Tab */}
              {activeTab === 'payouts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Payout Management</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Pending: {formatCurrency(stats.pendingPayouts)}
                      </div>
                      <button className="px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700">
                        Request Payout
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Earned</p>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pending Payouts</p>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pendingPayouts)}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">This Month</p>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.monthlyEarnings)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payouts.map((payout) => (
                          <tr key={payout.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(payout.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payout.student_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {payout.commission_type.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(payout.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payout.status)}`}>
                                {payout.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Analytics & Reports</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Enrollment Trends</h4>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <p>Chart placeholder - Enrollment trends over time</p>
                      </div>
                    </div>
                    
                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Revenue Breakdown</h4>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <p>Chart placeholder - Revenue sources breakdown</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Performance Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                        <p className="text-sm text-gray-600">Total Students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{Math.round((stats.completedStudents / stats.totalStudents) * 100)}%</p>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.avgRating}</p>
                        <p className="text-sm text-gray-600">Average Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalEarnings)}</p>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Center Settings</h3>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Center Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Center Name</label>
                        <input
                          type="text"
                          value={centerDetails?.name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                        <input
                          type="email"
                          value={centerDetails?.email || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={centerDetails?.phone || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
                        <input
                          type="text"
                          value={centerDetails?.referral_code || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={centerDetails?.address || ''}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Account Status</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">Verified Center</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm text-gray-700">Rating: {centerDetails?.rating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Payout Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                        <p className="text-sm text-gray-600">Update your bank details for receiving payouts</p>
                        <button className="mt-2 px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700">
                          Update Bank Details
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent">
                          <option>Monthly</option>
                          <option>Bi-weekly</option>
                          <option>Weekly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}