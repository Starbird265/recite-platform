import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getQuestions, postQuestion } from '../../utils/api';
import DiscussionThread from '../../components/DiscussionThread';
import toast from 'react-hot-toast';

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

interface Question {
  id: string;
  user_id: string;
  module_id: string;
  text: string;
  created_at: string;
  answers: Answer[];
}

export default function DiscussPage() {
  const router = useRouter();
  const { module: moduleId } = router.query;
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestionsData = async () => {
    if (!moduleId) return;
    try {
      const data = await getQuestions(moduleId as string);
      setQuestions(data as Question[]);
    } catch (err) {
      setError('Failed to load discussion.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, [moduleId]);

  const handlePostQuestion = async (text: string) => {
    if (!user) {
      toast.error('Please log in to post a question.');
      return;
    }
    try {
      await postQuestion(moduleId as string, text);
      toast.success('Question posted successfully!');
      fetchQuestionsData(); // Refresh questions
    } catch (err) {
      console.error('Error posting question:', err);
      toast.error('Failed to post question.');
    }
  };

  const handlePostAnswer = async (questionId: string, text: string) => {
    if (!user) {
      toast.error('Please log in to post an answer.');
      return;
    }
    // This would typically involve another API call to post an answer
    // For now, I'll just log it.
    console.log(`Posting answer to ${questionId}: ${text}`);
    toast.success('Answer posted (mock)! This would be saved to DB.');
    // You'd likely refresh data here too
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to participate in discussions</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading discussion...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <Head>
        <title>Discussion: {moduleId} | RS-CIT Platform</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Discussion: {moduleId}</h1>
        <DiscussionThread
          questions={questions}
          onPostQuestion={handlePostQuestion}
          onPostAnswer={handlePostAnswer}
        />
      </div>
    </>
  );
}
