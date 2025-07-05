import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelTitle, 
  PixelStats, 
  PixelSection, 
  PixelGrid 
} from '../components/PixelComponents'

interface StudentProgress {
  totalLessons: number
  completedLessons: number
  currentStreak: number
  averageScore: number
  hoursStudied: number
  rank: number
  achievements: number
  nextLesson: string
  progressPercentage: number
}

interface RecentActivity {
  id: string
  type: 'lesson' | 'quiz' | 'achievement' | 'practice'
  title: string
  score?: number
  completedAt: string
  moduleId: string
}

interface UpcomingLesson {
  id: string
  title: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  moduleId: string
  isLocked: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const StudentDashboard = () => {
  const { user } = useAuth()
  const [progress, setProgress] = useState<StudentProgress>({
    totalLessons: 0,
    completedLessons: 0,
    currentStreak: 0,
    averageScore: 0,
    hoursStudied: 0,
    rank: 0,
    achievements: 0,
    nextLesson: '',
    progressPercentage: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [streakAnimation, setStreakAnimation] = useState(false)

  useEffect(() => {
    if (user) {
      fetchStudentData()
    }
  }, [user])

  const fetchStudentData = async () => {
    try {
      // Mock data for demo - replace with real Supabase queries
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProgress({
        totalLessons: 48,
        completedLessons: 32,
        currentStreak: 7,
        averageScore: 87.5,
        hoursStudied: 24.5,
        rank: 15,
        achievements: 12,
        nextLesson: 'Advanced Excel Functions',
        progressPercentage: 67
      })

      setRecentActivity([
        {
          id: '1',
          type: 'lesson',
          title: 'PowerPoint Animations',
          score: 92,
          completedAt: '2 hours ago',
          moduleId: 'powerpoint'
        },
        {
          id: '2',
          type: 'quiz',
          title: 'Word Processing Quiz',
          score: 88,
          completedAt: '1 day ago',
          moduleId: 'word'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Speed Typist',
          completedAt: '2 days ago',
          moduleId: 'typing'
        },
        {
          id: '4',
          type: 'practice',
          title: 'Excel Practice Session',
          score: 95,
          completedAt: '3 days ago',
          moduleId: 'excel'
        }
      ])

      setUpcomingLessons([
        {
          id: '1',
          title: 'Advanced Excel Functions',
          duration: '45 mins',
          difficulty: 'advanced',
          moduleId: 'excel',
          isLocked: false
        },
        {
          id: '2',
          title: 'Database Fundamentals',
          duration: '60 mins',
          difficulty: 'intermediate',
          moduleId: 'database',
          isLocked: false
        },
        {
          id: '3',
          title: 'Internet Security',
          duration: '30 mins',
          difficulty: 'beginner',
          moduleId: 'security',
          isLocked: true
        }
      ])

      setAchievements([
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          unlockedAt: '2024-01-15',
          rarity: 'common'
        },
        {
          id: '2',
          title: 'Speed Typist',
          description: 'Type 40+ WPM',
          icon: '⚡',
          unlockedAt: '2024-01-20',
          rarity: 'rare'
        },
        {
          id: '3',
          title: 'Excel Master',
          description: 'Complete all Excel lessons',
          icon: '📊',
          unlockedAt: '2024-02-01',
          rarity: 'epic'
        },
        {
          id: '4',
          title: 'Perfect Score',
          description: 'Score 100% on a quiz',
          icon: '🏆',
          unlockedAt: '2024-02-10',
          rarity: 'legendary'
        }
      ])

      setLoading(false)
      
      // Trigger streak animation
      setTimeout(() => setStreakAnimation(true), 500)
    } catch (error) {
      console.error('Error fetching student data:', error)
      toast.error('Failed to load dashboard data')
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚'
      case 'quiz': return '❓'
      case 'achievement': return '🏆'
      case 'practice': return '💪'
      default: return '📋'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'primary'
      case 'quiz': return 'warning'
      case 'achievement': return 'success'
      case 'practice': return 'accent'
      default: return 'primary'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'danger'
      default: return 'primary'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-yellow-600'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const progressStats = [
    { number: progress.completedLessons, label: 'Lessons Completed', color: 'primary' as const },
    { number: progress.currentStreak, label: 'Day Streak', color: 'warning' as const },
    { number: `${progress.averageScore}%`, label: 'Average Score', color: 'success' as const },
    { number: progress.rank, label: 'Class Rank', color: 'accent' as const },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCard className="text-center">
          <PixelIcon color="accent">🔒</PixelIcon>
          <h2 className="text-xl font-semibold mb-4">Please Log In</h2>
          <p className="pixel-text-gray-600 mb-6">Access your learning dashboard</p>
          <PixelButton>Login to Continue</PixelButton>
        </PixelCard>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>🎓 Student Dashboard - RS-CIT Learning</title>
        <meta name="description" content="Track your learning progress and achievements" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200">
          <div className="pixel-container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <PixelIcon size="sm" color="primary">🎓</PixelIcon>
                <div>
                  <h1 className="text-2xl font-bold pixel-text-gray-800">Learning Dashboard</h1>
                  <p className="pixel-text-gray-500">Welcome back, {user.email?.split('@')[0]}!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <PixelButton variant="outline">
                  📊 Progress Report
                </PixelButton>
                <PixelButton variant="primary">
                  🎯 Continue Learning
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
                <PixelIcon size="lg" color="primary">📚</PixelIcon>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Progress Overview */}
              <PixelSection>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold pixel-text-gray-800">📊 Your Progress</h2>
                  <div className="flex items-center gap-2">
                    <span className="pixel-text-gray-500">Overall Progress:</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                        style={{ width: `${progress.progressPercentage}%` }}
                      />
                    </div>
                    <span className="font-semibold pixel-text-gray-800">{progress.progressPercentage}%</span>
                  </div>
                </div>
                <PixelStats stats={progressStats} />
              </PixelSection>

              {/* Quick Actions */}
              <PixelSection>
                <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">🚀 Quick Actions</h2>
                <PixelGrid cols={4}>
                  <PixelCard className="text-center cursor-pointer hover:transform hover:scale-105 transition-transform">
                    <PixelIcon size="md" color="primary">📚</PixelIcon>
                    <h3 className="font-semibold mb-2 pixel-text-gray-800">Continue Learning</h3>
                    <p className="pixel-text-gray-600 text-sm">Resume your current lesson</p>
                  </PixelCard>
                  
                  <PixelCard className="text-center cursor-pointer hover:transform hover:scale-105 transition-transform">
                    <PixelIcon size="md" color="warning">❓</PixelIcon>
                    <h3 className="font-semibold mb-2 pixel-text-gray-800">Take Quiz</h3>
                    <p className="pixel-text-gray-600 text-sm">Test your knowledge</p>
                  </PixelCard>
                  
                  <PixelCard className="text-center cursor-pointer hover:transform hover:scale-105 transition-transform">
                    <PixelIcon size="md" color="success">💪</PixelIcon>
                    <h3 className="font-semibold mb-2 pixel-text-gray-800">Practice</h3>
                    <p className="pixel-text-gray-600 text-sm">Hands-on exercises</p>
                  </PixelCard>
                  
                  <PixelCard className="text-center cursor-pointer hover:transform hover:scale-105 transition-transform">
                    <PixelIcon size="md" color="accent">🏆</PixelIcon>
                    <h3 className="font-semibold mb-2 pixel-text-gray-800">Achievements</h3>
                    <p className="pixel-text-gray-600 text-sm">View your badges</p>
                  </PixelCard>
                </PixelGrid>
              </PixelSection>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Next Lesson */}
                <PixelSection>
                  <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">📖 Next Lesson</h2>
                  <PixelCard className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-4">
                        <PixelIcon size="md" color="primary">📊</PixelIcon>
                        <div>
                          <h3 className="font-semibold pixel-text-gray-800">{progress.nextLesson}</h3>
                          <p className="pixel-text-gray-600 text-sm">Excel Module • 45 minutes</p>
                        </div>
                      </div>
                      <p className="pixel-text-gray-600 mb-6">
                        Learn advanced Excel functions including VLOOKUP, HLOOKUP, and pivot tables 
                        to analyze data effectively.
                      </p>
                      <PixelButton variant="primary" className="w-full">
                        🎯 Start Learning
                      </PixelButton>
                    </div>
                  </PixelCard>
                </PixelSection>

                {/* Recent Activity */}
                <PixelSection>
                  <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">📈 Recent Activity</h2>
                  <PixelCard>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${
                            getActivityColor(activity.type) === 'primary' ? 'from-blue-500 to-blue-600' :
                            getActivityColor(activity.type) === 'warning' ? 'from-yellow-500 to-yellow-600' :
                            getActivityColor(activity.type) === 'success' ? 'from-green-500 to-green-600' :
                            'from-pink-500 to-pink-600'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold pixel-text-gray-800">{activity.title}</div>
                            {activity.score && (
                              <div className="pixel-text-gray-600 text-sm">Score: {activity.score}%</div>
                            )}
                          </div>
                          <div className="pixel-text-gray-500 text-sm">{activity.completedAt}</div>
                        </div>
                      ))}
                    </div>
                  </PixelCard>
                </PixelSection>
              </div>

              {/* Upcoming Lessons */}
              <PixelSection>
                <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">📅 Upcoming Lessons</h2>
                <PixelGrid cols={3}>
                  {upcomingLessons.map((lesson) => (
                    <PixelCard key={lesson.id} className="relative">
                      {lesson.isLocked && (
                        <div className="absolute top-4 right-4">
                          <PixelIcon size="sm" color="warning">🔒</PixelIcon>
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="font-semibold pixel-text-gray-800 mb-2">{lesson.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="pixel-text-gray-500 text-sm">⏱️ {lesson.duration}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getDifficultyColor(lesson.difficulty) === 'success' ? 'bg-green-100 text-green-700' :
                            getDifficultyColor(lesson.difficulty) === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {lesson.difficulty}
                          </span>
                        </div>
                      </div>
                      <PixelButton 
                        size="sm" 
                        variant={lesson.isLocked ? 'outline' : 'primary'}
                        className="w-full"
                      >
                        {lesson.isLocked ? '🔒 Locked' : '▶️ Start'}
                      </PixelButton>
                    </PixelCard>
                  ))}
                </PixelGrid>
              </PixelSection>

              {/* Achievements */}
              <PixelSection>
                <h2 className="text-xl font-semibold mb-6 pixel-text-gray-800">🏆 Latest Achievements</h2>
                <PixelGrid cols={4}>
                  {achievements.map((achievement) => (
                    <PixelCard key={achievement.id} className="text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl text-white mx-auto mb-4 bg-gradient-to-br ${getRarityColor(achievement.rarity)}`}>
                        {achievement.icon}
                      </div>
                      <h3 className="font-semibold pixel-text-gray-800 mb-1">{achievement.title}</h3>
                      <p className="pixel-text-gray-600 text-sm mb-2">{achievement.description}</p>
                      <p className="pixel-text-gray-500 text-xs">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </PixelCard>
                  ))}
                </PixelGrid>
              </PixelSection>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default StudentDashboard