import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  PixelCard, 
  PixelButton, 
  PixelTitle 
} from '../../../components/PixelComponents'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'

interface Question {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string
}

interface TestAttempt {
  id: string
  practice_test_id: string
  started_at: string
  time_taken_seconds: number | null
  status: string
  practice_test: {
    title: string
    duration_minutes: number
    total_questions: number
    passing_score: number
  }
}

interface Answer {
  questionId: string
  selectedAnswer: string | null
  timeSpent: number
}

const TakePracticeTest = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { attemptId } = router.query
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map())
  const [timeLeft, setTimeLeft] = useState(0) // in seconds
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const startTimeRef = useRef<Date>(new Date())
  const questionStartTimeRef = useRef<Date>(new Date())

  useEffect(() => {
    if (!user || !attemptId) return

    fetchAttemptData()
  }, [user, attemptId])

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const fetchAttemptData = async () => {
    try {
      // Fetch attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from('practice_test_attempts')
        .select(`
          *,
          practice_test:practice_tests(
            title,
            duration_minutes,
            total_questions,
            passing_score
          )
        `)
        .eq('id', attemptId)
        .eq('user_id', user?.id)
        .single()

      if (attemptError) throw attemptError

      if (attemptData.status === 'completed') {
        router.push(`/practice-tests/results/${attemptId}`)
        return
      }

      setAttempt(attemptData)

      // Calculate time left
      const startTime = new Date(attemptData.started_at)
      const now = new Date()
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const totalSeconds = attemptData.practice_test.duration_minutes * 60
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
      
      setTimeLeft(remainingSeconds)

      // Fetch questions for this test
      const { data: questionsData, error: questionsError } = await supabase
        .from('practice_test_questions')
        .select(`
          question_order,
          question:quizzes(
            id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            explanation
          )
        `)
        .eq('practice_test_id', attemptData.practice_test_id)
        .order('question_order')

      if (questionsError) throw questionsError

      const formattedQuestions = questionsData.map(q => ({
        id: q.question.id,
        question: q.question.question,
        option_a: q.question.option_a,
        option_b: q.question.option_b,
        option_c: q.question.option_c,
        option_d: q.question.option_d,
        correct_answer: q.question.correct_answer,
        explanation: q.question.explanation
      }))

      setQuestions(formattedQuestions)

      // Fetch existing responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('practice_test_responses')
        .select('*')
        .eq('attempt_id', attemptId)

      if (responsesError) throw responsesError

      const existingAnswers = new Map<string, Answer>()
      responsesData.forEach(response => {
        existingAnswers.set(response.question_id, {
          questionId: response.question_id,
          selectedAnswer: response.selected_answer,
          timeSpent: response.time_spent_seconds || 0
        })
      })

      setAnswers(existingAnswers)

    } catch (error) {
      console.error('Error fetching test data:', error)
      toast.error('Failed to load practice test')
      router.push('/practice-tests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const now = new Date()
    const timeSpent = Math.floor((now.getTime() - questionStartTimeRef.current.getTime()) / 1000)

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      timeSpent: timeSpent
    }

    setAnswers(prev => new Map(prev.set(currentQuestion.id, newAnswer)))

    // Save to database
    saveAnswer(newAnswer)
  }

  const saveAnswer = async (answer: Answer) => {
    try {
      const { error } = await supabase
        .from('practice_test_responses')
        .upsert({
          attempt_id: attemptId,
          question_id: answer.questionId,
          selected_answer: answer.selectedAnswer,
          time_spent_seconds: answer.timeSpent
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving answer:', error)
    }
  }

  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    questionStartTimeRef.current = new Date()
  }

  const handleAutoSubmit = () => {
    toast.info('Time\'s up! Submitting your test...')
    submitTest()
  }

  const submitTest = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Calculate final score
      let correctAnswers = 0
      const totalQuestions = questions.length

      questions.forEach(question => {
        const answer = answers.get(question.id)
        if (answer?.selectedAnswer === question.correct_answer) {
          correctAnswers++
        }
      })

      const score = (correctAnswers / totalQuestions) * 100
      const totalTimeSpent = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)

      // Update attempt with final results
      const { error } = await supabase
        .from('practice_test_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score: score,
          correct_answers: correctAnswers,
          wrong_answers: totalQuestions - correctAnswers - (totalQuestions - answers.size),
          unanswered: totalQuestions - answers.size,
          time_taken_seconds: totalTimeSpent,
          status: 'completed'
        })
        .eq('id', attemptId)

      if (error) throw error

      // Update all responses with correct/incorrect status
      for (const question of questions) {
        const answer = answers.get(question.id)
        if (answer) {
          await supabase
            .from('practice_test_responses')
            .update({
              is_correct: answer.selectedAnswer === question.correct_answer
            })
            .eq('attempt_id', attemptId)
            .eq('question_id', question.id)
        }
      }

      toast.success('Test submitted successfully!')
      router.push(`/practice-tests/results/${attemptId}`)

    } catch (error) {
      console.error('Error submitting test:', error)
      toast.error('Failed to submit test')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    const totalTime = attempt?.practice_test.duration_minutes * 60 || 0
    const percentage = (timeLeft / totalTime) * 100
    
    if (percentage > 50) return 'text-green-400'
    if (percentage > 25) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your practice test...</p>
        </div>
      </div>
    )
  }

  if (!attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Test not found or expired</p>
          <PixelButton onClick={() => router.push('/practice-tests')} className="mt-4">
            Back to Practice Tests
          </PixelButton>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers.get(currentQuestion.id)
  const answeredCount = answers.size
  const totalQuestions = questions.length

  return (
    <>
      <Head>
        <title>{attempt.practice_test.title} - RS-CIT Platform</title>
        <meta name="description" content="Practice test in progress" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Test Header */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <PixelTitle className="text-white text-lg">
                  {attempt.practice_test.title}
                </PixelTitle>
                <p className="text-gray-400 text-sm">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Answered</p>
                  <p className="text-white font-semibold">{answeredCount}/{totalQuestions}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400">Time Left</p>
                  <p className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
                
                <PixelButton
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={isSubmitting}
                >
                  Submit Test
                </PixelButton>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-4 gap-8">
            {/* Question Navigation */}
            <div className="col-span-1">
              <PixelCard className="p-4">
                <h3 className="text-white font-semibold mb-4">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const isAnswered = answers.has(questions[index].id)
                    const isCurrent = index === currentQuestionIndex
                    
                    return (
                      <button
                        key={index}
                        onClick={() => navigateToQuestion(index)}
                        className={`
                          w-10 h-10 rounded-lg text-sm font-medium border-2 transition-all
                          ${isCurrent 
                            ? 'bg-cyan-400 text-gray-900 border-cyan-400' 
                            : isAnswered 
                              ? 'bg-green-600 text-white border-green-600' 
                              : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              </PixelCard>
            </div>

            {/* Question Content */}
            <div className="col-span-3">
              <PixelCard className="p-6">
                <div className="mb-6">
                  <p className="text-white text-lg leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>

                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionText = currentQuestion[`option_${option.toLowerCase()}`]
                    const isSelected = currentAnswer?.selectedAnswer === option
                    
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`
                          w-full p-4 rounded-lg border-2 text-left transition-all
                          ${isSelected 
                            ? 'bg-cyan-600 border-cyan-400 text-white' 
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                          }
                        `}
                      >
                        <span className="font-semibold mr-3">{option}.</span>
                        {optionText}
                      </button>
                    )
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <PixelButton
                    variant="outline"
                    onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Previous
                  </PixelButton>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      Progress: {Math.round((answeredCount / totalQuestions) * 100)}%
                    </p>
                  </div>
                  
                  <PixelButton
                    onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next →
                  </PixelButton>
                </div>
              </PixelCard>
            </div>
          </div>
        </div>

        {/* Confirm Submit Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <PixelCard className="p-6 max-w-md mx-4">
              <h3 className="text-white text-lg font-semibold mb-4">
                Submit Practice Test?
              </h3>
              <div className="space-y-2 text-gray-400 text-sm mb-6">
                <p>• Answered: {answeredCount} of {totalQuestions} questions</p>
                <p>• Unanswered: {totalQuestions - answeredCount} questions</p>
                <p>• Time remaining: {formatTime(timeLeft)}</p>
              </div>
              <p className="text-gray-400 mb-6">
                Are you sure you want to submit? You won&apos;t be able to change your answers.
              </p>
              <div className="flex space-x-4">
                <PixelButton
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1"
                >
                  Continue Test
                </PixelButton>
                <PixelButton
                  onClick={submitTest}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </PixelButton>
              </div>
            </PixelCard>
          </div>
        )}
      </div>
    </>
  )
}

export default TakePracticeTest