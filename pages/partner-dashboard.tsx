import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelTitle, 
  PixelStats, 
  PixelSection, 
  PixelGrid 
} from '@/components/ui/PixelComponents'

interface PartnerStats {
  totalStudents: number
  activeStudents: number
  totalRevenue: number
  monthlyRevenue: number
  conversionRate: number
  referrals: number
  centers: number
  avgRating: number
}

interface RecentActivity {
  id: string
  type: 'enrollment' | 'completion' | 'payment' | 'referral'
  title: string
  amount?: number
  studentName?: string
  timestamp: string
}

interface Center {
  id: string
  name: string
  address: string
  students: number
  revenue: number
  status: 'active' | 'inactive'
}

const PartnerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<PartnerStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    referrals: 0,
    centers: 0,
    avgRating: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPartnerData()
    }
  }, [user])

  const fetchPartnerData = async () => {
    try {
      // Simulate API calls for demo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demo
      setStats({
        totalStudents: 1247,
        activeStudents: 892,
        totalRevenue: 485000,
        monthlyRevenue: 78500,
        conversionRate: 85.2,
        referrals: 145,
        centers: 8,
        avgRating: 4.8
      })

      setRecentActivity([
        {
          id: '1',
          type: 'enrollment',
          title: 'New Student Enrolled',
          studentName: 'Priya Sharma',
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          amount: 1175,
          studentName: 'Raj Kumar',
          timestamp: '4 hours ago'
        },
        {
          id: '3',
          type: 'completion',
          title: 'Course Completed',
          studentName: 'Sunita Devi',
          timestamp: '6 hours ago'
        },
        {
          id: '4',
          type: 'referral',
          title: 'New Referral',
          studentName: 'Amit Singh',
          timestamp: '8 hours ago'
        }
      ])

      setCenters([
        {
          id: '1',
          name: 'Central Hub - Jaipur',
          address: 'MI Road, Jaipur',
          students: 245,
          revenue: 125000,
          status: 'active'
        },
        {
          id: '2',
          name: 'Tech Center - Udaipur',
          address: 'City Palace Road, Udaipur',
          students: 198,
          revenue: 98000,
          status: 'active'
        },
        {
          id: '3',
          name: 'Learning Hub - Jodhpur',
          address: 'Clock Tower, Jodhpur',
          students: 156,
          revenue: 76000,
          status: 'active'
        }
      ])

      setLoading(false)
    } catch (error) {
      console.error('Error fetching partner data:', error)
      setLoading(false)
    }
  }

  const statsData = [
    { number: stats.totalStudents, label: 'Total Students', color: 'primary' as const },
    { number: stats.activeStudents, label: 'Active Students', color: 'success' as const },
    { number: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`, label: 'Total Revenue', color: 'warning' as const },
    { number: `${stats.conversionRate}%`, label: 'Conversion Rate', color: 'accent' as const },
  ]

  const quickActions = [
    { icon: '👥', title: 'Add New Center', description: 'Register a new training center', color: 'primary' as const },
    { icon: '📊', title: 'View Analytics', description: 'Detailed performance reports', color: 'secondary' as const },
    { icon: '💰', title: 'Manage Payments', description: 'Track payments and payouts', color: 'success' as const },
    { icon: '🎓', title: 'Student Progress', description: 'Monitor student learning', color: 'accent' as const }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return '🎓'
      case 'payment': return '💰'
      case 'completion': return '✅'
      case 'referral': return '👥'
      default: return '📋'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': return 'primary'
      case 'payment': return 'success'
      case 'completion': return 'warning'
      case 'referral': return 'accent'
      default: return 'primary'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCard className="text-center">
          <PixelIcon color="accent">🔒</PixelIcon>
          <h2 className="text-xl font-semibold mb-4">Access Restricted</h2>
          <p className="pixel-text-gray-600 mb-6">Please log in to access the partner dashboard.</p>
          <PixelButton>Login to Continue</PixelButton>
        </PixelCard>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>🎯 Partner Dashboard - RS-CIT Platform</title>
        <meta name="description" content="Partner dashboard for RS-CIT training centers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200">
          <div className="pixel-container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <PixelIcon size="sm" color="primary">🏢</PixelIcon>
                <div>
                  <h1 className="text-2xl font-bold pixel-text-gray-800">Partner Dashboard</h1>
                  <p className="pixel-text-gray-500">Welcome back, Training Partner!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <PixelButton variant="outline" color="primary">
                  📊 Generate Report
                </PixelButton>
                <PixelButton color="primary">
                  ⚙️ Settings
                </PixelButton>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pixel-container py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="pixel-bounce">
                <PixelIcon size="lg" color="primary">⏳</PixelIcon>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Overview */}
              <PixelSection>
                <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">📊 Performance Overview</h2>
                <PixelStats stats={statsData} />
              </PixelSection>

              {/* Quick Actions */}
              <PixelSection>
                <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">🚀 Quick Actions</h2>
                <PixelGrid cols={4}>
                  {quickActions.map((action, index) => (
                    <PixelCard key={index} className="text-center cursor-pointer hover:transform hover:scale-105 transition-transform">
                      <PixelIcon size="md" color={action.color}>
                        {action.icon}
                      </PixelIcon>
                      <h3 className="font-semibold mb-2 pixel-text-gray-800">{action.title}</h3>
                      <p className="pixel-text-gray-600 text-sm">{action.description}</p>
                    </PixelCard>
                  ))}
                </PixelGrid>
              </PixelSection>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <PixelSection>
                  <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">📈 Recent Activity</h2>
                  <PixelCard>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${
                            getActivityColor(activity.type) === 'primary' ? 'from-blue-500 to-blue-600' :
                            getActivityColor(activity.type) === 'success' ? 'from-green-500 to-green-600' :
                            getActivityColor(activity.type) === 'warning' ? 'from-yellow-500 to-yellow-600' :
                            'from-pink-500 to-pink-600'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold pixel-text-gray-800">{activity.title}</div>
                            {activity.studentName && (
                              <div className="pixel-text-gray-600 text-sm">{activity.studentName}</div>
                            )}
                            {activity.amount && (
                              <div className="pixel-text-gray-600 text-sm">₹{activity.amount}</div>
                            )}
                          </div>
                          <div className="pixel-text-gray-500 text-sm">{activity.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </PixelCard>
                </PixelSection>

                {/* Training Centers */}
                <PixelSection>
                  <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">🏢 Training Centers</h2>
                  <PixelCard>
                    <div className="space-y-4">
                      {centers.map((center, index) => (
                        <div key={center.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold pixel-text-gray-800">{center.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              center.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {center.status}
                            </span>
                          </div>
                          <p className="pixel-text-gray-600 text-sm mb-3">{center.address}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="pixel-text-gray-500">Students:</span>
                                <span className="font-semibold pixel-text-gray-800 ml-1">{center.students}</span>
                              </div>
                              <div className="text-sm">
                                <span className="pixel-text-gray-500">Revenue:</span>
                                <span className="font-semibold pixel-text-gray-800 ml-1">₹{(center.revenue / 1000).toFixed(0)}K</span>
                              </div>
                            </div>
                            <PixelButton variant="outline" size="sm" color="primary">
                              View Details
                            </PixelButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PixelCard>
                </PixelSection>
              </div>

              {/* Revenue Chart Placeholder */}
              <PixelSection>
                <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">📊 Revenue Analytics</h2>
                <PixelCard className="text-center py-12">
                  <PixelIcon size="lg" color="warning">📈</PixelIcon>
                  <h3 className="text-lg font-semibold mb-2 pixel-text-gray-800">Revenue Chart</h3>
                  <p className="pixel-text-gray-600 mb-4">Monthly revenue trends and analytics</p>
                  <PixelButton color="primary">View Full Analytics</PixelButton>
                </PixelCard>
              </PixelSection>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default PartnerDashboard