import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookOpen, Clock, Play, CheckCircle, Circle, Users, Star, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase, Course, Lesson } from '@/lib/supabase'

interface CourseProgress {
  totalLessons: number
  completedLessons: number
  percentage: number
}

export default function CoursePage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<CourseProgress>({ totalLessons: 0, completedLessons: 0, percentage: 0 })
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchCourseData()
    }
  }, [id, user])

  const fetchCourseData = async () => {
    if (!id) return

    try {
      setLoading(true)

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Fetch course lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .eq('is_active', true)
        .order('order_number')

      if (lessonsError) throw lessonsError
      setLessons(lessonsData || [])

      // Fetch user progress if logged in
      if (user && lessonsData) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id)
          .eq('completed', true)
          .in('lesson_id', lessonsData.map(l => l.id))

        const completed = new Set(progressData?.map(p => p.lesson_id) || [])
        setCompletedLessons(completed)
        
        const progressPercentage = lessonsData.length > 0 
          ? Math.round((completed.size / lessonsData.length) * 100)
          : 0

        setProgress({
          totalLessons: lessonsData.length,
          completedLessons: completed.size,
          percentage: progressPercentage
        })
      }

    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupLessonsByModule = (lessons: Lesson[]) => {
    const grouped = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.module]) {
        acc[lesson.module] = []
      }
      acc[lesson.module].push(lesson)
      return acc
    }, {} as Record<string, Lesson[]>)
    return grouped
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Link
            href="/courses"
            className="bg-rs-blue-600 text-white px-6 py-2 rounded-lg hover:bg-rs-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  const groupedLessons = groupLessonsByModule(lessons)

  return (
    <>
      <Head>
        <title>{course.title} | RS-CIT Platform</title>
        <meta name="description" content={course.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-rs-blue-600 to-rs-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Link
              href="/courses"
              className="inline-flex items-center text-blue-200 hover:text-white mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Courses
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getDifficultyColor(course.difficulty)} text-gray-800`}>
                  {course.difficulty}
                </span>
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl opacity-90 mb-6">{course.description}</p>
                
                <div className="flex items-center space-x-6 text-blue-200">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {course.duration_hours} hours
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    {lessons.length} lessons
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {Math.floor(Math.random() * 500) + 100} enrolled
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400 fill-current" />
                    {(4.2 + Math.random() * 0.8).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Course Stats Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                {user ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Completed</span>
                        <span>{progress.completedLessons}/{progress.totalLessons}</span>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-full h-2">
                        <div 
                          className="bg-white h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-center mt-2 text-sm">
                        {progress.percentage}% Complete
                      </div>
                    </div>
                    {progress.completedLessons === 0 && (
                      <Link
                        href={lessons.length > 0 ? `/lesson/${lessons[0].id}` : '#'}
                        className="block w-full bg-white text-rs-blue-600 font-semibold py-3 px-4 rounded-lg text-center hover:bg-gray-100 transition-colors"
                      >
                        Start First Lesson
                      </Link>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Get Started</h3>
                    <p className="text-sm opacity-90 mb-4">
                      Sign up to track your progress and access all course features
                    </p>
                    <Link
                      href="/"
                      className="block w-full bg-white text-rs-blue-600 font-semibold py-3 px-4 rounded-lg text-center hover:bg-gray-100 transition-colors"
                    >
                      Sign Up Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              
              <div className="space-y-6">
                {Object.entries(groupedLessons).map(([module, moduleLessons]) => (
                  <div key={module} className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">{module}</h3>
                      <p className="text-sm text-gray-600">
                        {moduleLessons.length} lessons • {moduleLessons.reduce((acc, lesson) => acc + lesson.duration_minutes, 0)} minutes
                      </p>
                    </div>
                    
                    <div className="divide-y">
                      {moduleLessons.map((lesson, index) => {
                        const isCompleted = completedLessons.has(lesson.id)
                        const isAccessible = user && (index === 0 || completedLessons.has(moduleLessons[index - 1]?.id))
                        
                        return (
                          <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center flex-1">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-300 mr-3" />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                <p className="text-sm text-gray-600">{lesson.description}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {lesson.duration_minutes} min
                                </div>
                              </div>
                            </div>
                            
                            {user ? (
                              <Link
                                href={`/lesson/${lesson.id}`}
                                className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  isCompleted 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : isAccessible
                                    ? 'bg-rs-blue-100 text-rs-blue-700 hover:bg-rs-blue-200'
                                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                {isCompleted ? 'Review' : 'Start'}
                              </Link>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Sign up to access
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-medium">{course.duration_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lessons</span>
                    <span className="font-medium">{lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-medium">{Math.floor(Math.random() * 500) + 100}</span>
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">What You'll Learn</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Master fundamental computer concepts
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Learn essential MS Office applications
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Understand internet and networking basics
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Prepare for RS-CIT certification exam
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}