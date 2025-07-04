import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelSection, 
  PixelStats,
  PixelGrid 
} from '../components/PixelComponents'
import {
  PixelAnalyticsDashboard,
  PixelProgressChart,
  PixelRevenueChart,
  PixelDonutChart,
  PixelMap,
  PixelMobileChart
} from '../components/PixelCharts'

const PixelAnalytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'students' | 'centers'>('overview')
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isMobile, setIsMobile] = useState(false)

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 485000,
      totalStudents: 1247,
      activeCenters: 8,
      conversionRate: 85.2,
      growth: {
        revenue: 12.5,
        students: 8.3,
        centers: 25.0,
        conversion: -2.1
      }
    },
    revenueData: [
      { month: 'Jan', revenue: 45000, students: 180 },
      { month: 'Feb', revenue: 52000, students: 210 },
      { month: 'Mar', revenue: 48000, students: 195 },
      { month: 'Apr', revenue: 65000, students: 260 },
      { month: 'May', revenue: 72000, students: 285 },
      { month: 'Jun', revenue: 78500, students: 315 }
    ],
    progressData: [
      { label: 'Course Completion', value: 87, color: '#10b981' },
      { label: 'Quiz Performance', value: 92, color: '#3b82f6' },
      { label: 'Practical Skills', value: 85, color: '#8b5cf6' },
      { label: 'Certification Rate', value: 94, color: '#f59e0b' }
    ],
    distributionData: [
      { label: 'Beginner', value: 45, color: '#10b981' },
      { label: 'Intermediate', value: 35, color: '#3b82f6' },
      { label: 'Advanced', value: 20, color: '#8b5cf6' }
    ],
    centerPerformance: [
      { label: 'Jaipur Central', value: 245, color: '#10b981' },
      { label: 'Udaipur Tech', value: 198, color: '#3b82f6' },
      { label: 'Jodhpur Hub', value: 156, color: '#8b5cf6' },
      { label: 'Kota Center', value: 132, color: '#f59e0b' },
      { label: 'Ajmer Branch', value: 98, color: '#ec4899' }
    ],
    centers: [
      {
        id: '1',
        name: 'Jaipur Central Hub',
        address: 'MI Road, Jaipur',
        lat: 26.9124,
        lng: 75.7873,
        students: 245,
        revenue: 125000
      },
      {
        id: '2',
        name: 'Udaipur Tech Center',
        address: 'City Palace Road, Udaipur',
        lat: 24.5854,
        lng: 73.6855,
        students: 198,
        revenue: 98000
      },
      {
        id: '3',
        name: 'Jodhpur Learning Hub',
        address: 'Clock Tower, Jodhpur',
        lat: 26.2389,
        lng: 73.0243,
        students: 156,
        revenue: 76000
      }
    ]
  })

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    if (user) {
      fetchAnalyticsData()
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [user, timeFilter])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  const stats = [
    { 
      number: `₹${(analyticsData.overview.totalRevenue / 1000).toFixed(0)}K`, 
      label: 'Total Revenue', 
      color: 'success' as const,
      growth: analyticsData.overview.growth.revenue
    },
    { 
      number: analyticsData.overview.totalStudents, 
      label: 'Total Students', 
      color: 'primary' as const,
      growth: analyticsData.overview.growth.students
    },
    { 
      number: analyticsData.overview.activeCenters, 
      label: 'Active Centers', 
      color: 'warning' as const,
      growth: analyticsData.overview.growth.centers
    },
    { 
      number: `${analyticsData.overview.conversionRate}%`, 
      label: 'Conversion Rate', 
      color: 'accent' as const,
      growth: analyticsData.overview.growth.conversion
    },
  ]

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '📈'
    if (growth < 0) return '📉'
    return '➡️'
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCard className="text-center">
          <PixelIcon color="accent">🔒</PixelIcon>
          <h2 className="text-xl font-semibold mb-4">Access Restricted</h2>
          <p className="pixel-text-gray-600 mb-6">Please log in to view analytics dashboard.</p>
          <PixelButton>Login to Continue</PixelButton>
        </PixelCard>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>📊 Analytics Dashboard - RS-CIT Platform</title>
        <meta name="description" content="Comprehensive analytics and insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200">
          <div className="pixel-container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <PixelIcon size="sm" color="primary">📊</PixelIcon>
                <div>
                  <h1 className="text-2xl font-bold pixel-text-gray-800">Analytics Dashboard</h1>
                  <p className="pixel-text-gray-500">Comprehensive insights and performance metrics</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg pixel-text-gray-700"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 3 Months</option>
                  <option value="1y">Last Year</option>
                </select>
                <PixelButton variant="outline" color="primary">
                  📄 Export Report
                </PixelButton>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-gray-200">
          <div className="pixel-container">
            <div className="flex gap-8 overflow-x-auto">
              {(['overview', 'revenue', 'students', 'centers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'overview' && '📋'} 
                  {tab === 'revenue' && '💰'} 
                  {tab === 'students' && '🎓'} 
                  {tab === 'centers' && '🏢'} 
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pixel-container py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="pixel-bounce">
                <PixelIcon size="lg" color="primary">📊</PixelIcon>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Stats Overview with Growth */}
                  <PixelSection>
                    <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">📈 Performance Overview</h2>
                    <PixelGrid cols={4}>
                      {stats.map((stat, index) => (
                        <PixelCard key={index} className="text-center">
                          <div className="text-3xl font-bold pixel-text-gray-800 mb-2">
                            {stat.number}
                          </div>
                          <div className="text-sm pixel-text-gray-500 mb-2">
                            {stat.label}
                          </div>
                          <div className={`text-sm font-medium flex items-center justify-center gap-1 ${getGrowthColor(stat.growth)}`}>
                            <span>{getGrowthIcon(stat.growth)}</span>
                            <span>{Math.abs(stat.growth)}%</span>
                          </div>
                        </PixelCard>
                      ))}
                    </PixelGrid>
                  </PixelSection>

                  {/* Quick Charts */}
                  {isMobile ? (
                    <PixelSection>
                      <PixelMobileChart 
                        data={analyticsData.progressData}
                        title="Key Metrics"
                      />
                    </PixelSection>
                  ) : (
                    <PixelAnalyticsDashboard data={analyticsData} />
                  )}
                </>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div className="space-y-8">
                  <PixelSection>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <PixelRevenueChart 
                        data={analyticsData.revenueData}
                        title="Monthly Revenue Trend"
                      />
                      <PixelCard>
                        <h3 className="text-lg font-semibold mb-6 pixel-text-gray-800">Revenue Breakdown</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="pixel-text-gray-700">Course Fees</span>
                            <span className="font-semibold">₹380,000 (78%)</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="pixel-text-gray-700">Certification</span>
                            <span className="font-semibold">₹75,000 (15%)</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="pixel-text-gray-700">Additional Services</span>
                            <span className="font-semibold">₹30,000 (7%)</span>
                          </div>
                        </div>
                      </PixelCard>
                    </div>
                  </PixelSection>
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-8">
                  <PixelSection>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <PixelDonutChart 
                        data={analyticsData.distributionData}
                        title="Student Skill Levels"
                        centerValue="1,247"
                        centerLabel="Total Students"
                      />
                      <PixelProgressChart 
                        data={analyticsData.progressData}
                        title="Learning Progress Metrics"
                      />
                    </div>
                  </PixelSection>

                  <PixelSection>
                    <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">🎓 Student Performance</h2>
                    <PixelGrid cols={3}>
                      <PixelCard className="text-center">
                        <PixelIcon size="md" color="success">✅</PixelIcon>
                        <div className="text-2xl font-bold pixel-text-gray-800 mb-2">1,089</div>
                        <div className="text-sm pixel-text-gray-500">Completed Courses</div>
                      </PixelCard>
                      
                      <PixelCard className="text-center">
                        <PixelIcon size="md" color="warning">⏱️</PixelIcon>
                        <div className="text-2xl font-bold pixel-text-gray-800 mb-2">158</div>
                        <div className="text-sm pixel-text-gray-500">In Progress</div>
                      </PixelCard>
                      
                      <PixelCard className="text-center">
                        <PixelIcon size="md" color="accent">🏆</PixelIcon>
                        <div className="text-2xl font-bold pixel-text-gray-800 mb-2">94%</div>
                        <div className="text-sm pixel-text-gray-500">Pass Rate</div>
                      </PixelCard>
                    </PixelGrid>
                  </PixelSection>
                </div>
              )}

              {/* Centers Tab */}
              {activeTab === 'centers' && (
                <div className="space-y-8">
                  <PixelSection>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <PixelMap 
                        centers={analyticsData.centers}
                        onCenterClick={(id) => console.log('Center clicked:', id)}
                      />
                      {isMobile ? (
                        <PixelMobileChart 
                          data={analyticsData.centerPerformance}
                          title="Center Performance"
                        />
                      ) : (
                        <PixelCard>
                          <h3 className="text-lg font-semibold mb-6 pixel-text-gray-800">Center Performance</h3>
                          <div className="space-y-4">
                            {analyticsData.centerPerformance.map((center, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="pixel-text-gray-700">{center.label}</span>
                                  <span className="font-semibold">{center.value} students</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full transition-all duration-1000"
                                    style={{ 
                                      width: `${(center.value / 245) * 100}%`,
                                      backgroundColor: center.color
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </PixelCard>
                      )}
                    </div>
                  </PixelSection>

                  <PixelSection>
                    <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">🏢 Center Details</h2>
                    <PixelGrid cols={1}>
                      {analyticsData.centers.map((center) => (
                        <PixelCard key={center.id}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <PixelIcon size="md" color="primary">🏢</PixelIcon>
                              <div>
                                <h3 className="font-semibold pixel-text-gray-800">{center.name}</h3>
                                <p className="pixel-text-gray-600 text-sm">{center.address}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-8">
                              <div className="text-center">
                                <div className="font-semibold pixel-text-gray-800">{center.students}</div>
                                <div className="text-sm pixel-text-gray-500">Students</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold pixel-text-gray-800">₹{(center.revenue / 1000).toFixed(0)}K</div>
                                <div className="text-sm pixel-text-gray-500">Revenue</div>
                              </div>
                              <PixelButton size="sm" variant="outline" color="primary">
                                View Details
                              </PixelButton>
                            </div>
                          </div>
                        </PixelCard>
                      ))}
                    </PixelGrid>
                  </PixelSection>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default PixelAnalytics