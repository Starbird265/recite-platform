import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  PixelCard, 
  PixelButton, 
  PixelTitle,
  PixelGrid,
  PixelStats
} from '../../../components/PixelComponents'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'

interface TestResult {
  id: string
  score: number
  correct_answers: number
  wrong_answers: number
  unanswered: number
  time_taken_seconds: number
  completed_at: string
  practice_test: {
    title: string
    total_questions: number
    passing_score: number
    duration_minutes: number
  }
}

interface QuestionResult {
  question_id: string
  selected_answer: string | null
  is_correct: boolean
  time_spent_seconds: number
  question: {
    question: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: string
    explanation: string
  }
}

const PracticeTestResults = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { attemptId } = router.query
  const [result, setResult] = useState<TestResult | null>(null)
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('wrong')

  useEffect(() => {
    if (!user || !attemptId) return

    fetchResults()
  }, [user, attemptId])

  const fetchResults = async () => {
    try {
      // Fetch test result
      const { data: resultData, error: resultError } = await supabase
        .from('practice_test_attempts')
        .select(`
          *,
          practice_test:practice_tests(
            title,
            total_questions,
            passing_score,
            duration_minutes
          )
        `)
        .eq('id', attemptId)
        .eq('user_id', user?.id)
        .single()

      if (resultError) throw resultError

      if (resultData.status !== 'completed') {
        router.push(`/practice-tests/take/${attemptId}`)
        return
      }

      setResult(resultData)

      // Fetch detailed question results
      const { data: questionsData, error: questionsError } = await supabase
        .from('practice_test_responses')
        .select(`
          *,
          question:quizzes(
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            explanation
          )
        `)
        .eq('attempt_id', attemptId)
        .order('created_at')

      if (questionsError) throw questionsError

      setQuestionResults(questionsData || [])

    } catch (error) {
      console.error('Error fetching results:', error)
      toast.error('Failed to load test results')
      router.push('/practice-tests')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'text-green-400'
    if (score >= passingScore * 0.8) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getFilteredQuestions = () => {
    switch (reviewFilter) {
      case 'correct':
        return questionResults.filter(q => q.is_correct)
      case 'wrong':
        return questionResults.filter(q => !q.is_correct && q.selected_answer)
      case 'unanswered':
        return questionResults.filter(q => !q.selected_answer)
      default:
        return questionResults
    }
  }

  const getAnswerStyle = (option: string, question: QuestionResult) => {
    const isSelected = question.selected_answer === option
    const isCorrect = question.question.correct_answer === option
    
    if (isSelected && isCorrect) {
      return 'bg-green-600 border-green-400 text-white' // Correct answer selected
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-600 border-red-400 text-white' // Wrong answer selected
    }
    if (!isSelected && isCorrect) {
      return 'bg-green-800 border-green-600 text-green-100' // Correct answer not selected
    }
    return 'bg-gray-700 border-gray-600 text-gray-300' // Other options
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Results not found</p>
          <PixelButton onClick={() => router.push('/practice-tests')} className="mt-4">
            Back to Practice Tests
          </PixelButton>
        </div>
      </div>
    )
  }

  const isPassed = result.score >= result.practice_test.passing_score
  const totalQuestions = result.practice_test.total_questions
  const efficiency = result.time_taken_seconds > 0 
    ? (result.correct_answers / (result.time_taken_seconds / 60)).toFixed(2) 
    : '0'

  return (
    <>
      <Head>
        <title>Test Results - {result.practice_test.title}</title>
        <meta name="description" content="Your practice test results" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <PixelTitle className="text-white text-xl">
                  🎯 Test Results
                </PixelTitle>
                <p className="text-gray-400">{result.practice_test.title}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/practice-tests">
                  <PixelButton variant="outline" size="sm">
                    Back to Tests
                  </PixelButton>
                </Link>
                <Link href="/dashboard">
                  <PixelButton variant="outline" size="sm">
                    Dashboard
                  </PixelButton>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Summary */}
          <div className="mb-8">
            <PixelCard className="p-8 text-center">
              <div className="mb-6">
                <div className={`text-6xl font-bold ${getScoreColor(result.score, result.practice_test.passing_score)}`}>
                  {result.score.toFixed(1)}%
                </div>
                <div className="mt-2">
                  <span className={`text-xl font-semibold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                    {isPassed ? '✅ PASSED' : '❌ FAILED'}
                  </span>
                </div>
                <p className="text-gray-400 mt-2">
                  Passing score: {result.practice_test.passing_score}%
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{result.correct_answers}</p>
                  <p className="text-sm text-gray-400">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{result.wrong_answers}</p>
                  <p className="text-sm text-gray-400">Wrong</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{result.unanswered}</p>
                  <p className="text-sm text-gray-400">Unanswered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{formatTime(result.time_taken_seconds)}</p>
                  <p className="text-sm text-gray-400">Time Taken</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <PixelButton
                  onClick={() => setShowReview(!showReview)}
                  variant="outline"
                >
                  {showReview ? 'Hide Review' : 'Review Answers'}
                </PixelButton>
                <PixelButton
                  onClick={() => router.push('/practice-tests')}
                >
                  Take Another Test
                </PixelButton>
              </div>
            </PixelCard>
          </div>

          {/* Performance Stats */}
          <PixelGrid cols={4} className="mb-8">
            <PixelStats
              title="Score"
              value={`${result.score.toFixed(1)}%`}
              subtitle={isPassed ? 'Passed' : 'Failed'}
              icon={() => <span className="text-2xl">📊</span>}
              iconColor={getScoreColor(result.score, result.practice_test.passing_score)}
            />
            <PixelStats
              title="Accuracy"
              value={`${((result.correct_answers / (totalQuestions - result.unanswered)) * 100 || 0).toFixed(1)}%`}
              subtitle="Of attempted questions"
              icon={() => <span className="text-2xl">🎯</span>}
              iconColor="text-cyan-400"
            />
            <PixelStats
              title="Time per Question"
              value={`${Math.round(result.time_taken_seconds / totalQuestions)}s`}
              subtitle="Average time spent"
              icon={() => <span className="text-2xl">⏱️</span>}
              iconColor="text-yellow-400"
            />
            <PixelStats
              title="Efficiency"
              value={efficiency}
              subtitle="Correct answers/minute"
              icon={() => <span className="text-2xl">⚡</span>}
              iconColor="text-green-400"
            />
          </PixelGrid>

          {/* Answer Review */}
          {showReview && (
            <PixelCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  📝 Answer Review
                </h3>
                
                <div className="flex space-x-2">
                  {[
                    { key: 'wrong', label: 'Wrong', count: result.wrong_answers },
                    { key: 'correct', label: 'Correct', count: result.correct_answers },
                    { key: 'unanswered', label: 'Unanswered', count: result.unanswered },
                    { key: 'all', label: 'All', count: totalQuestions }
                  ].map(filter => (
                    <PixelButton
                      key={filter.key}
                      variant={reviewFilter === filter.key ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setReviewFilter(filter.key as any)}
                    >
                      {filter.label} ({filter.count})
                    </PixelButton>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {getFilteredQuestions().map((questionResult, index) => (
                  <div key={questionResult.question_id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-white text-lg font-medium">
                        Question {index + 1}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {questionResult.is_correct ? (
                          <span className="text-green-400 text-sm">✅ Correct</span>
                        ) : questionResult.selected_answer ? (
                          <span className="text-red-400 text-sm">❌ Wrong</span>
                        ) : (
                          <span className="text-yellow-400 text-sm">⚠️ Unanswered</span>
                        )}
                        <span className="text-gray-400 text-sm">
                          {Math.round(questionResult.time_spent_seconds)}s
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">
                      {questionResult.question.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {['A', 'B', 'C', 'D'].map(option => (
                        <div
                          key={option}
                          className={`p-3 rounded-lg border-2 ${getAnswerStyle(option, questionResult)}`}
                        >
                          <span className="font-semibold mr-2">{option}.</span>
                          {questionResult.question[`option_${option.toLowerCase()}`]}
                        </div>
                      ))}
                    </div>

                    {questionResult.question.explanation && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">💡 Explanation:</p>
                        <p className="text-gray-300 text-sm">
                          {questionResult.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PixelCard>
          )}
        </main>
      </div>
    </>
  )
}

export default PracticeTestResults