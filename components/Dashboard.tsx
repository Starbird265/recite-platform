import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  MapPin, 
  Calendar,
  Play,
  CheckCircle,
  Circle,
  Star,
  Users,
  Target,
  TrendingUp,
  LogOut,
  Settings,
  Bell,
  Plus,
  GraduationCap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Course, Lesson } from '@/lib/supabase'

interface DashboardStats {
  lessonsCompleted: number
  totalLessons: number
  currentStreak: number
  totalPoints: number
  averageScore: number
  daysRemaining: number
}

interface TodayLesson {
  id: string
  title: string
  description: string
  duration_minutes: number
  video_url?: string
  completed: boolean
}

interface RecentCourse {
  id: string
  title: string
  description: string
  progress: number
  thumbnail_url?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earned_at?: string
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    lessonsCompleted: 0,
    totalLessons: 132,
    currentStreak: 0,
    totalPoints: 0,
    averageScore: 0,
    daysRemaining: 0
  })
  const [todayLesson, setTodayLesson] = useState<TodayLesson | null>(null)
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch user progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user?.id)
  
        // Fetch today's lesson
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .order('order')
          .limit(1)
  
        // Calculate stats
        const completedLessons = progressData?.filter(p => p.completed) || []
        const totalScore = completedLessons.reduce((sum, p) => sum + (p.score || 0), 0)
        
        setStats({
          lessonsCompleted: completedLessons.length,
          totalLessons: 132,
          currentStreak: 7, // This would be calculated based on consecutive days
          totalPoints: totalScore,
          averageScore: completedLessons.length > 0 ? Math.round(totalScore / completedLessons.length) : 0,
          daysRemaining: 90 // This would be calculated based on enrollment date
        })
  
        // Set today's lesson
        if (lessonData && lessonData[0]) {
          const isCompleted = progressData?.some(p => p.lesson_id === lessonData[0].id && p.completed) || false
          setTodayLesson({
            ...lessonData[0],
            completed: isCompleted
          })
        }
  
        // Set achievements (mock data for now)
        setAchievements([
          {
            id: '1',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: '🎯',
            earned: completedLessons.length > 0,
            earned_at: completedLessons.length > 0 ? new Date().toISOString() : undefined
          },
          {
            id: '2',
            title: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: '🔥',
            earned: false
          },
          {
            id: '3',
            title: 'Quiz Master',
            description: 'Score 90%+ on 5 quizzes',
            icon: '🏆',
            earned: false
          }
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user?.id)

      // Fetch today's lesson
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .order('order')
        .limit(1)

      // Calculate stats
      const completedLessons = progressData?.filter(p => p.completed) || []
      const totalScore = completedLessons.reduce((sum, p) => sum + (p.score || 0), 0)
      
      setStats({
        lessonsCompleted: completedLessons.length,
        totalLessons: 132,
        currentStreak: 7, // This would be calculated based on consecutive days
        totalPoints: totalScore,
        averageScore: completedLessons.length > 0 ? Math.round(totalScore / completedLessons.length) : 0,
        daysRemaining: 90 // This would be calculated based on enrollment date
      })

      // Set today's lesson
      if (lessonData && lessonData[0]) {
        const isCompleted = progressData?.some(p => p.lesson_id === lessonData[0].id && p.completed) || false
        setTodayLesson({
          ...lessonData[0],
          completed: isCompleted
        })
      }

      // Set achievements (mock data for now)
      setAchievements([
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          earned: completedLessons.length > 0,
          earned_at: completedLessons.length > 0 ? new Date().toISOString() : undefined
        },
        {
          id: '2',
          title: 'Week Warrior',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          earned: false
        },
        {
          id: '3',
          title: 'Quiz Master',
          description: 'Score 90%+ on 5 quizzes',
          icon: '🏆',
          earned: false
        }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startLesson = async () => {
    if (!todayLesson) return
    
    // Navigate to lesson page (implement routing)
    console.log('Starting lesson:', todayLesson.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">RS-CIT Platform</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-rs-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/courses" className="text-gray-600 hover:text-gray-900">
                  Courses
                </Link>
                <Link href="/centers" className="text-gray-600 hover:text-gray-900">
                  Centers
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/create-course"
                className="hidden md:flex items-center px-3 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
              <Link
                href="/create-lesson"
                className="hidden md:flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Lesson
              </Link>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <Link href="/profile" className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </Link>
              <button
                onClick={async () => await logout()}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.name || 'Student'}!
          </h2>
          <p className="text-gray-600">
            Ready to continue your RS-CIT journey? You&apos;re doing great!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-rs-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-rs-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.lessonsCompleted}/{stats.totalLessons}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Days to Exam</p>
                <p className="text-2xl font-bold text-gray-900">{stats.daysRemaining}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Lesson */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Lesson</h3>
                {todayLesson ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-medium text-gray-900">{todayLesson.title}</h4>
                      {todayLesson.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{todayLesson.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {todayLesson.duration_minutes} minutes
                      </div>
                      <button
                        onClick={startLesson}
                        disabled={todayLesson.completed}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                          todayLesson.completed
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-rs-blue-600 text-white hover:bg-rs-blue-700'
                        }`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {todayLesson.completed ? 'Completed' : 'Start Lesson'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No lesson scheduled for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(stats.lessonsCompleted / stats.totalLessons) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rs-blue-600">{stats.lessonsCompleted}</div>
                      <div className="text-sm text-gray-600">Lessons Done</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400">{stats.totalLessons - stats.lessonsCompleted}</div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`flex items-center p-3 rounded-lg ${
                        achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mr-3">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-700'}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Courses */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
                  <Link href="/courses" className="text-rs-blue-600 hover:text-rs-blue-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentCourses.length > 0 ? (
                    recentCourses.slice(0, 3).map((course) => (
                      <Link
                        key={course.id}
                        href={`/course/${course.id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="flex items-center">
                          <div className="bg-rs-blue-100 rounded p-2 mr-3">
                            <GraduationCap className="h-4 w-4 text-rs-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{course.title}</h4>
                            <div className="flex items-center mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-rs-blue-600 h-2 rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{course.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No courses enrolled</p>
                      <Link
                        href="/courses"
                        className="text-rs-blue-600 hover:text-rs-blue-700 text-sm"
                      >
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/centers" className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Find Exam Center</span>
                  </Link>
                  <Link href="/payment" className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Enroll Now</span>
                  </Link>
                  <Link href="/profile" className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                    <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                    <span>View Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}