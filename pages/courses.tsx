import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BookOpen, Clock, Star, Users, Play, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase, Course } from '@/lib/supabase'

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => 
    filter === 'all' || course.difficulty === filter
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
        <title>RS-CIT Courses | RS-CIT Platform</title>
        <meta name="description" content="Explore comprehensive RS-CIT courses designed for certification success" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">RS-CIT Courses</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Master RS-CIT with our comprehensive courses designed by experts and powered by AI
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow p-1 flex space-x-1">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                    filter === level
                      ? 'bg-rs-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {level === 'all' ? 'All Courses' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Course Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-rs-blue-500 to-rs-blue-700 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-white" />
                  )}
                </div>

                <div className="p-6">
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration_hours}h
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {Math.floor(Math.random() * 500) + 100} enrolled
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                      {(4.2 + Math.random() * 0.8).toFixed(1)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/course/${course.id}`}
                    className="block w-full bg-rs-blue-600 hover:bg-rs-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try changing your filter or check back later for new courses.</p>
            </div>
          )}

          {/* Call to Action */}
          {!user && (
            <div className="mt-16 bg-rs-blue-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of students who have successfully cleared RS-CIT with our platform
              </p>
              <Link
                href="/"
                className="inline-flex items-center bg-white text-rs-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}