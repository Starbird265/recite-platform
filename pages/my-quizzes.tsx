import { useEffect, useState } from 'react';
import { getMyQuizHistory } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

export default function MyQuizzesPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded

    const fetchQuizHistory = async () => {
      try {
        const data = await getMyQuizHistory();
        setResults(data);
      } catch (err) {
        setError('Failed to load quiz history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your quiz history</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading quiz history...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <Head>
        <title>My Quiz History | RS-CIT Platform</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Quiz History</h1>
        {results.length === 0 ? (
          <p className="text-center py-8">No quiz attempts found.</p>
        ) : (
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.quizzes?.title || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.score}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
