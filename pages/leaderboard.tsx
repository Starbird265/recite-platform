import { useEffect, useState } from 'react';
import { getLeaderboard } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const data = await getLeaderboard();
        setLeaders(data);
      } catch (err) {
        setError('Failed to load leaderboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboardData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading leaderboard...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <Head>
        <title>Leaderboard | RS-CIT Platform</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        {leaders.length === 0 ? (
          <p className="text-center py-8">No leaders found yet.</p>
        ) : (
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaders.map((u, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(u.avg_score)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
