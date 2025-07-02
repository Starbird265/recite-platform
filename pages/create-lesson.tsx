import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase, Course } from '@/lib/supabase'

interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export default function CreateLessonPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    content: '',
    video_url: '',
    audio_url: '',
    duration_minutes: 30,
    order_number: 1,
    module: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  })

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: ''
    }
  ])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchCourses()
  }, [user])

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
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.course_id) {
      newErrors.course_id = 'Please select a course'
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Lesson title is required'
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Lesson content is required'
    }
    
    if (!formData.module.trim()) {
      newErrors.module = 'Module name is required'
    }
    
    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duration must be greater than 0'
    }
    
    // Validate quiz questions
    quizQuestions.forEach((question, index) => {
      if (question.question.trim()) {
        if (question.options.some(option => !option.trim())) {
          newErrors[`quiz_${index}`] = 'All options must be filled for each question'
        }
        if (!question.explanation.trim()) {
          newErrors[`explanation_${index}`] = 'Explanation is required for each question'
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Create lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert([
          {
            ...formData,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (lessonError) throw lessonError

      // Create quiz questions if any
      const validQuestions = quizQuestions.filter(q => q.question.trim())
      if (validQuestions.length > 0) {
        const { error: quizError } = await supabase
          .from('quiz')
          .insert(
            validQuestions.map(question => ({
              lesson_id: lessonData.id,
              question: question.question,
              options: question.options,
              correct_answer: question.correct_answer,
              explanation: question.explanation,
              created_at: new Date().toISOString(),
            }))
          )

        if (quizError) throw quizError
      }

      // Redirect to the lesson page
      router.push(`/lesson/${lessonData.id}`)
    } catch (error: any) {
      console.error('Error creating lesson:', error)
      setErrors({ submit: error.message || 'Failed to create lesson' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['duration_minutes', 'order_number'].includes(name) ? parseInt(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleQuizChange = (index: number, field: keyof QuizQuestion | string, value: string | number) => {
    setQuizQuestions(prev => {
      const updated = [...prev]
      if (field.startsWith('option_')) {
        const optionIndex = parseInt(field.split('_')[1])
        updated[index].options[optionIndex] = value as string
      } else {
        ;(updated[index] as any)[field] = value
      }
      return updated
    })
  }

  const addQuizQuestion = () => {
    setQuizQuestions(prev => [...prev, {
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: ''
    }])
  }

  const removeQuizQuestion = (index: number) => {
    if (quizQuestions.length > 1) {
      setQuizQuestions(prev => prev.filter((_, i) => i !== index))
    }
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Create New Lesson | RS-CIT Platform</title>
        <meta name="description" content="Create a new lesson with content and quiz questions" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Lesson</h1>
              <div></div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Lesson Information</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    id="course_id"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent ${
                      errors.course_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                  {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter lesson title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                    placeholder="Brief description of the lesson"
                  />
                </div>

                <div>
                  <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-2">
                    Module *
                  </label>
                  <input
                    type="text"
                    id="module"
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent ${
                      errors.module ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Computer Fundamentals"
                  />
                  {errors.module && <p className="text-red-500 text-sm mt-1">{errors.module}</p>}
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    id="duration_minutes"
                    name="duration_minutes"
                    min="1"
                    max="180"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent ${
                      errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                </div>

                <div>
                  <label htmlFor="order_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Order
                  </label>
                  <input
                    type="number"
                    id="order_number"
                    name="order_number"
                    min="1"
                    value={formData.order_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="video_url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div>
                  <label htmlFor="audio_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Audio URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="audio_url"
                    name="audio_url"
                    value={formData.audio_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  value={formData.content}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the lesson content in HTML format..."
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                <p className="text-gray-500 text-sm mt-2">
                  You can use HTML tags for formatting (h2, p, ul, li, strong, em, etc.)
                </p>
              </div>
            </div>

            {/* Quiz Questions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Quiz Questions (Optional)</h2>
                <button
                  type="button"
                  onClick={addQuizQuestion}
                  className="flex items-center px-3 py-2 text-sm bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {quizQuestions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuizQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                          placeholder="Enter your question"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center">
                              <input
                                type="radio"
                                name={`correct_${index}`}
                                checked={question.correct_answer === optionIndex}
                                onChange={() => handleQuizChange(index, 'correct_answer', optionIndex)}
                                className="mr-2"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleQuizChange(index, `option_${optionIndex}`, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                          Select the radio button next to the correct answer
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explanation
                        </label>
                        <textarea
                          rows={3}
                          value={question.explanation}
                          onChange={(e) => handleQuizChange(index, 'explanation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                          placeholder="Explain why this is the correct answer"
                        />
                      </div>
                    </div>

                    {(errors[`quiz_${index}`] || errors[`explanation_${index}`]) && (
                      <div className="mt-2 text-red-500 text-sm">
                        {errors[`quiz_${index}`] || errors[`explanation_${index}`]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Lesson
                  </>
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  )
}