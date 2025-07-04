import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getQuizQuestions, submitQuizResult } from '../../utils/api';
import QuizQuestion from '../../components/QuizQuestion';
import toast from 'react-hot-toast';

interface QuizQuestionData {
  id: string;
  question: string;
  choices: string[];
  correct_index: number;
}

export default function QuizPage() {
  const router = useRouter();
  const { module: quizId } = router.query;
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;
      try {
        const data = await getQuizQuestions(quizId as string);
        setQuestions(data as QuizQuestionData[]);
        // Initialize user answers
        const initialAnswers: Record<string, string | null> = {};
        data.forEach((q: QuizQuestionData) => (initialAnswers[q.id] = null));
        setUserAnswers(initialAnswers);
      } catch (err) {
        setError('Failed to load quiz.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [quizId]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.choices[q.correct_index]) {
        correctCount++;
      }
    });
    const calculatedScore = (correctCount / questions.length) * 100;
    setScore(calculatedScore);
    setShowResults(true);

    if (user) {
      try {
        await submitQuizResult(moduleId as string, calculatedScore);
        toast.success('Quiz results submitted!');
      } catch (err) {
        console.error('Error submitting quiz results:', err);
        toast.error('Failed to submit quiz results.');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to take quizzes</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Found</h2>
          <p className="text-gray-600">This quiz module does not have any questions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Quiz: {moduleId} | RS-CIT Platform</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Quiz: {moduleId}</h1>
        {questions.map((q) => (
          <QuizQuestion
            key={q.id}
            question={q}
            selectedAnswer={userAnswers[q.id]}
            onSelectAnswer={handleSelectAnswer}
            showAnswer={showResults}
          />
        ))}
        {!showResults && (
          <button
            onClick={handleSubmitQuiz}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg"
            disabled={Object.values(userAnswers).some(answer => answer === null) || Object.keys(userAnswers).length !== questions.length}
          >
            Submit Quiz
          </button>
        )}
        {showResults && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
            <h2 className="text-xl font-bold">Your Score: {score.toFixed(2)}%</h2>
            <p className="text-gray-700">You answered {score / 100 * questions.length} out of {questions.length} questions correctly.</p>
          </div>
        )}
      </div>
    </>
  );
}
