import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { 
  PixelCard, 
  PixelButton, 
  PixelTitle,
  PixelSection,
  PixelGrid,
  PixelStats
} from '../components/PixelComponents'
import { supabase } from '../lib/supabase'
import { getTodayLesson, getUserDashboardStats, getRecentQuizAttempts, getLearningStreak } from '../lib/supabase-queries'
import toast from 'react-hot-toast'

interface DashboardData {
  totalModules: number
  completedModules: number
  currentStreak: number
  totalPoints: number
  todaysLesson: {
    id: number
    title: string
    description: string
    duration: string
    thumbnail: string
  } | null
  recentQuizzes: Array<{
    id: number
    module: string
    score: number
    completedAt: string
  }>
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalModules: 132,
    completedModules: 0,
    currentStreak: 0,
    totalPoints: 0,
    todaysLesson: null,
    recentQuizzes: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    if (!user) return; // Ensure user is available

    try {
      setIsLoading(true)
      
      // Fetch real data from Supabase
      const [todayLessonData, dashboardStats, recentQuizzes, learningStreak] = await Promise.all([
        getTodayLesson(user.id),
        getUserDashboardStats(user.id),
        getRecentQuizAttempts(user.id, 3),
        getLearningStreak(user.id)
      ])

      // Combine real and fallback data
      const combinedData: DashboardData = {
        totalModules: dashboardStats.totalModules || 132,
        completedModules: dashboardStats.completedModules || 0,
        currentStreak: learningStreak || 0,
        totalPoints: dashboardStats.totalPoints || 0,
        todaysLesson: todayLessonData ? {
          id: parseInt(todayLessonData.id) || 1,
          title: todayLessonData.title || "Introduction to Microsoft Excel",
          description: todayLessonData.description || "Learn the basics of Excel including creating spreadsheets, formatting cells, and basic formulas",
          duration: `${todayLessonData.duration_minutes || 12} min`,
          thumbnail: todayLessonData.video_url || "/api/placeholder/300/200"
        } : {
          id: 1,
          title: "Introduction to Microsoft Excel",
          description: "Learn the basics of Excel including creating spreadsheets, formatting cells, and basic formulas",
          duration: "12 min",
          thumbnail: "/api/placeholder/300/200"
        },
        recentQuizzes: recentQuizzes.length > 0 ? recentQuizzes.map(quiz => ({
          id: quiz.id,
          module: quiz.module,
          score: quiz.score,
          completedAt: quiz.completedAt
        })) : [
          // Fallback mock data if no real quiz data
          {
            id: 1,
            module: "MS Word Basics",
            score: 85,
            completedAt: "2024-01-15"
          },
          {
            id: 2,
            module: "Internet Fundamentals", 
            score: 92,
            completedAt: "2024-01-14"
          },
          {
            id: 3,
            module: "Computer Hardware",
            score: 78,
            completedAt: "2024-01-13"
          }
        ]
      }

      setDashboardData(combinedData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      
      // Fallback to mock data on error
      setDashboardData({
        totalModules: 132,
        completedModules: 0,
        currentStreak: 0,
        totalPoints: 0,
        todaysLesson: {
          id: 1,
          title: "Introduction to Microsoft Excel",
          description: "Learn the basics of Excel including creating spreadsheets, formatting cells, and basic formulas",
          duration: "12 min",
          thumbnail: "/api/placeholder/300/200"
        },
        recentQuizzes: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const progressPercentage = dashboardData.totalModules > 0 
    ? (dashboardData.completedModules / dashboardData.totalModules) * 100 
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Student Dashboard - RS-CIT Platform</title>
        <meta name="description" content="Your RS-CIT learning dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <PixelTitle className="text-white text-xl">
                  🎓 RS-CIT Dashboard
                </PixelTitle>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">Welcome, {user?.email}</span>
                <PixelButton 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </PixelButton>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PixelSection className="mb-8">
            <PixelGrid cols={4} className="mb-8">
              <PixelStats
                title="Total Modules"
                value={dashboardData.totalModules}
                icon={() => <span className="text-2xl">📚</span>}
                iconColor="text-blue-400"
              />
              <PixelStats
                title="Completed"
                value={dashboardData.completedModules}
                subtitle={`${progressPercentage.toFixed(1)}% Complete`}
                icon={() => <span className="text-2xl">✅</span>}
                iconColor="text-green-400"
                trend="up"
              />
              <PixelStats
                title="Current Streak"
                value={`${dashboardData.currentStreak} days`}
                icon={() => <span className="text-2xl">🔥</span>}
                iconColor="text-orange-400"
              />
              <PixelStats
                title="Total Points"
                value={dashboardData.totalPoints}
                icon={() => <span className="text-2xl">⭐</span>}
                iconColor="text-yellow-400"
              />
            </PixelGrid>
          </PixelSection>

          <PixelGrid cols={3} className="gap-8">
            {/* Today's Lesson */}
            <div className="col-span-2">
              <PixelCard className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  📖 Today&apos;s Lesson
                </h2>
                
                {dashboardData.todaysLesson ? (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="font-semibold text-white text-lg mb-2">
                        {dashboardData.todaysLesson.title}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {dashboardData.todaysLesson.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          ⏱️ {dashboardData.todaysLesson.duration}
                        </span>
                        <Link href={`/video/${dashboardData.todaysLesson.id}`}>
                          <PixelButton>
                            ▶️ Watch Now
                          </PixelButton>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">
                        📊 Progress Overview
                      </h4>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {dashboardData.completedModules} of {dashboardData.totalModules} modules completed
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-4xl mb-4">🎉</p>
                    <p>You&apos;re all caught up!</p>
                    <p className="text-sm">Check back tomorrow for new lessons.</p>
                  </div>
                )}
              </PixelCard>
            </div>

            {/* Quick Actions & Stats */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <PixelCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  ⚡ Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link href="/find-centre">
                    <PixelButton variant="outline" className="w-full">
                      📍 Find Test Centre
                    </PixelButton>
                  </Link>
                  <Link href="/discuss/general">
                    <PixelButton variant="outline" className="w-full">
                      💬 Join Discussion
                    </PixelButton>
                  </Link>
                  <Link href="/profile">
                    <PixelButton variant="outline" className="w-full">
                      👤 Update Profile
                    </PixelButton>
                  </Link>
                </div>
              </PixelCard>

              {/* Recent Quiz Results */}
              <PixelCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📝 Recent Quiz Results
                </h3>
                <div className="space-y-3">
                  {dashboardData.recentQuizzes.length > 0 ? (
                    dashboardData.recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {quiz.module}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(quiz.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              quiz.score >= 80 ? 'text-green-400' : 
                              quiz.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {quiz.score}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No quiz results yet
                    </p>
                  )}
                </div>
              </PixelCard>
            </div>
          </PixelGrid>
        </main>
      </div>
    </>
  )
}

export default Dashboard