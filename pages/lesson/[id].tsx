import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Play, Pause, Volume2, FileText, CheckCircle, Circle, ArrowRight, ArrowLeft, Clock } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  video_url?: string
  audio_url?: string
  duration_minutes: number
  order: number
  module: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

interface UserProgress {
  completed: boolean
  score?: number
  time_spent_minutes: number
}

export default function LessonPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [progress, setProgress] = useState<UserProgress>({ completed: false, time_spent_minutes: 0 })
  const [loading, setLoading] = useState(true)
  const [currentMode, setCurrentMode] = useState<'content' | 'quiz'>('content')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    if (id) {
      fetchLessonData()
      setStartTime(Date.now())
    }
  }, [id])

  const fetchLessonData = async () => {
    if (!id || !user) return

    try {
      setLoading(true)

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)

      // Fetch quiz questions
      const { data: quizData } = await supabase
        .from('quiz')
        .select('*')
        .eq('lesson_id', id)
        .order('id')

      setQuiz(quizData || [])

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', id)
        .single()

      if (progressData) {
        setProgress(progressData)
      }

    } catch (error) {
      console.error('Error fetching lesson data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeSwitch = (mode: 'content' | 'quiz') => {
    setCurrentMode(mode)
    if (mode === 'quiz') {
      setCurrentQuestionIndex(0)
      setUserAnswers(new Array(quiz.length).fill(-1))
      setShowResults(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Submit quiz
      submitQuiz()
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuiz = async () => {
    if (!lesson || !user) return

    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === quiz[index].correct_answer
    ).length

    const score = Math.round((correctAnswers / quiz.length) * 100)
    const timeSpent = Math.round((Date.now() - startTime) / 60000) // Convert to minutes

    try {
      // Update user progress
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          score,
          time_spent_minutes: timeSpent,
          completed_at: new Date().toISOString(),
        })

      if (error) throw error

      setProgress({ completed: true, score, time_spent_minutes: timeSpent })
      setShowResults(true)

    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-rs-blue-600 text-white px-6 py-2 rounded-lg hover:bg-rs-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{lesson.title} | RS-CIT Platform</title>
        <meta name="description" content={lesson.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                  {lesson.difficulty}
                </span>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {lesson.duration_minutes} min
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Lesson Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            <p className="text-gray-600 text-lg">{lesson.description}</p>
            <div className="mt-4 text-sm text-gray-500">
              Module: {lesson.module} • Lesson {lesson.order}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
            <button
              onClick={() => handleModeSwitch('content')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'content'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4 mr-2 inline" />
              Content
            </button>
            <button
              onClick={() => handleModeSwitch('quiz')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'quiz'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={quiz.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2 inline" />
              Quiz ({quiz.length} questions)
            </button>
          </div>

          {/* Content Mode */}
          {currentMode === 'content' && (
            <div className="space-y-8">
              {/* Video/Audio Player */}
              {(lesson.video_url || lesson.audio_url) && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Media Content</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center bg-rs-blue-600 text-white px-4 py-2 rounded-lg hover:bg-rs-blue-700"
                      >
                        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                      <Volume2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {lesson.video_url ? (
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={lesson.video_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : lesson.audio_url ? (
                    <audio
                      controls
                      className="w-full"
                      src={lesson.audio_url}
                    >
                      Your browser does not support the audio tag.
                    </audio>
                  ) : null}
                </div>
              )}

              {/* Text Content */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Lesson Content</h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>

              {/* Progress Indicator */}
              {progress.completed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-green-800">Lesson Completed!</h3>
                      <p className="text-green-700 text-sm">
                        Score: {progress.score}% • Time spent: {progress.time_spent_minutes} minutes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz Mode */}
          {currentMode === 'quiz' && quiz.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              {!showResults ? (
                <div className="p-6">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
                      <span>{Math.round(((currentQuestionIndex + 1) / quiz.length) * 100)}% Complete</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {quiz[currentQuestionIndex].question}
                    </h3>
                    <div className="space-y-3">
                      {quiz[currentQuestionIndex].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                            userAnswers[currentQuestionIndex] === index
                              ? 'border-rs-blue-500 bg-rs-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                              userAnswers[currentQuestionIndex] === index
                                ? 'border-rs-blue-500 bg-rs-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {userAnswers[currentQuestionIndex] === index && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={userAnswers[currentQuestionIndex] === -1}
                      className="flex items-center px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentQuestionIndex === quiz.length - 1 ? 'Submit Quiz' : 'Next'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Quiz Results */
                <div className="p-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                    <p className="text-gray-600">You scored {progress.score}% on this quiz</p>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-4 mb-6">
                    {quiz.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{question.question}</h4>
                          {userAnswers[index] === question.correct_answer ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Your answer: {question.options[userAnswers[index]]}
                        </div>
                        {userAnswers[index] !== question.correct_answer && (
                          <div className="text-sm text-green-600 mb-2">
                            Correct answer: {question.options[question.correct_answer]}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {question.explanation}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-rs-blue-600 text-white py-3 rounded-lg hover:bg-rs-blue-700 font-medium"
                  >
                    Continue Learning
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}