import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthContext';

type QuestionType = {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
};

type QuizProps = { quizId: string; onComplete?: () => void };

const Quiz = ({ quizId, onComplete }: QuizProps) => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) {
        setError('No quiz ID provided.');
        setLoading(false);
        return;
      }
      try {
        // Fetch quiz details to get associated lesson_id
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('lesson_id')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;
        setLessonId(quizData?.lesson_id || null);

        // Fetch questions for the quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('id, question_text, options, correct_answer_index, explanation')
          .eq('quiz_id', quizId)
          .order('id', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch quiz data.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswerIndex(index);
    setShowFeedback(true);
    if (index === questions[currentQuestionIndex].correct_answer_index) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = async () => {
    setSelectedAnswerIndex(null);
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      // Record quiz progress
      if (user && lessonId) {
        try {
          const { error: progressError } = await supabase.from('user_progress').insert({
            user_id: user.id,
            lesson_id: lessonId,
            completed_at: new Date().toISOString(),
            quiz_score: score,
            quiz_total_questions: questions.length,
          });
          if (progressError) throw progressError;
        } catch (err: any) {
          console.error('Failed to record quiz progress:', err.message);
          setError(err.message || 'Failed to record quiz progress.');
        }
      }
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>Error: {error}</div>;
  if (questions.length === 0) return <div>No questions found for this quiz.</div>;

  const currentQuestion = questions[currentQuestionIndex];

  if (quizCompleted) {
    return (
      <div className="container mt-4">
        <div className="card">
          <div className="card-header"><h2>Quiz Completed!</h2></div>
          <div className="card-body">
            <p>You scored {score} out of {questions.length}.</p>
            <Link href="/" className="btn btn-primary">Back to Dashboard</Link>
            {/* Optionally add a retry button or review answers */}
            {onComplete && (
              <button className="btn btn-secondary ms-2" onClick={onComplete}>Continue</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Quiz</h2></div>
        <div className="card-body">
          <h5>Question {currentQuestionIndex + 1} of {questions.length}</h5>
          <p className="lead">{currentQuestion.question_text}</p>
          <div className="list-group">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`list-group-item list-group-item-action ${showFeedback ? (index === currentQuestion.correct_answer_index ? 'list-group-item-success' : (selectedAnswerIndex === index ? 'list-group-item-danger' : '')) : ''}`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className="mt-3">
              {selectedAnswerIndex === currentQuestion.correct_answer_index ? (
                <p className="text-success">Correct!</p>
              ) : (
                <p className="text-danger">Incorrect. The correct answer was: {currentQuestion.options[currentQuestion.correct_answer_index]}</p>
              )}
              {currentQuestion.explanation && <p className="text-muted">Explanation: {currentQuestion.explanation}</p>}
              <button className="btn btn-primary mt-2" onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
