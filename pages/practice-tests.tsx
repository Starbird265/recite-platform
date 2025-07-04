import { useState, useEffect } from 'react';
import { createPracticeTest, submitPracticeTest } from '../utils/api';
import QuizQuestion from '../components/QuizQuestion';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

export default function PracticeTestsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [testId, setTestId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded

    const fetchTest = async () => {
      try {
        setLoading(true);
        const { testId: newTestId, questions: fetchedQuestions } = await createPracticeTest();
        setTestId(newTestId);
        setQuestions(fetchedQuestions);
        // Initialize user answers
        const initialAnswers: Record<string, string | null> = {};
        fetchedQuestions.forEach((q: any) => (initialAnswers[q.id] = null));
        setUserAnswers(initialAnswers);
      } catch (err) {
        setError('Failed to load practice test.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [user]);

  const handleAnswer = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const onSubmit = async () => {
    if (!testId) return;

    const answersToSubmit = questions.map(q => ({
      quiz_id: q.id,
      answer: userAnswers[q.id],
      is_correct: userAnswers[q.id] === q.correct_answer
    }));

    try {
      await submitPracticeTest(testId, answersToSubmit);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit practice test.');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to take practice tests</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading practice test...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (questions.length === 0) return <div className="text-center py-8">No questions found for practice test.</div>;

  return (
    <>
      <Head>
        <title>Practice Test | RS-CIT Platform</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Practice Test</h1>
        {questions.map((q, i) => (
          <QuizQuestion
            key={q.id}
            question={q}
            selectedAnswer={userAnswers[q.id]}
            onSelectAnswer={handleAnswer}
            showAnswer={submitted}
          />
        ))}
        {!submitted && (
          <button onClick={onSubmit} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
            Submit Test
          </button>
        )}
        {submitted && <p className="text-green-600 mt-2">Test submitted! Your score will be saved.</p>}
      </div>
    </>
  );
}
