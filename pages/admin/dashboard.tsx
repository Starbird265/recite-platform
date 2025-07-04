import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Users, 
  BookOpen, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

interface AdminStats {
  contentSummary: Array<{ content_type: string; status: string; count: number }>;
  userSummary: { total_users: number };
  referralSummary: Array<{ status: string; count: number }>;
}

interface RecentActivity {
  id: string;
  type: 'enquiry' | 'referral';
  user_email?: string;
  centre_name?: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    contentSummary: [],
    userSummary: { total_users: 0 },
    referralSummary: [],
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.user_metadata.role === 'admin') {
      fetchAdminData();
    } else if (user) {
      setLoading(false); // Not an admin, stop loading
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);

      // Fetch recent enquiries and referrals for activity feed
      const { data: enquiries, error: enquiriesError } = await supabase
        .from('enquiries')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('id, user_id, centre_id, created_at, status, centres(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (enquiriesError) console.error('Error fetching enquiries:', enquiriesError);
      if (referralsError) console.error('Error fetching referrals:', referralsError);

      const combinedActivity: RecentActivity[] = [];

      enquiries?.forEach(enq => {
        combinedActivity.push({
          id: enq.id,
          type: 'enquiry',
          user_email: enq.email,
          description: `New enquiry from ${enq.email}`,
          timestamp: enq.created_at,
        });
      });

      referrals?.forEach(ref => {
        combinedActivity.push({
          id: ref.id,
          type: 'referral',
          centre_name: ref.centres?.name || 'Unknown Centre',
          description: `New referral to ${ref.centres?.name || 'Unknown Centre'} (Status: ${ref.status})`,
          timestamp: ref.created_at,
        });
      });

      // Sort by timestamp and take top N
      setRecentActivity(combinedActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enquiry': return <Users className="h-4 w-4 text-blue-500" />;
      case 'referral': return <MapPin className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!user || user.user_metadata.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have administrative privileges to view this page.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600"></div>
      </div>
    );
  }

  // Helper to get count for a specific content type and status
  const getContentCount = (contentType: string, status: string) => {
    return stats.contentSummary.find(s => s.content_type === contentType && s.status === status)?.count || 0;
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard | RS-CIT Platform</title>
        <meta name="description" content="Manage the RS-CIT platform - users, courses, centers, and analytics" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <nav className="hidden md:flex space-x-6">
                  <Link href="/admin/dashboard" className="text-rs-blue-600 font-medium">
                    Dashboard
                  </Link>
                  <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
                    Users
                  </Link>
                  <Link href="/admin/courses" className="text-gray-600 hover:text-gray-900">
                    Courses
                  </Link>
                  <Link href="/admin/centers" className="text-gray-600 hover:text-gray-900">
                    Centers
                  </Link>
                  <Link href="/admin/payments" className="text-gray-600 hover:text-gray-900">
                    Payments
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Back to User Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.userSummary.total_users}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Approved Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{getContentCount('videos', 'approved')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{getContentCount('quizzes', 'pending')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Paid Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.referralSummary.find(s => s.status === 'paid')?.count || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats - Example of using contentSummary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Questions</p>
                  <p className="text-xl font-bold text-gray-900">{getContentCount('questions', 'pending')}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved Answers</p>
                  <p className="text-xl font-bold text-gray-900">{getContentCount('answers', 'approved')}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Enquiries</p>
                  <p className="text-xl font-bold text-gray-900">{stats.contentSummary.find(s => s.content_type === 'enquiries')?.count || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-xl font-bold text-gray-900">{stats.referralSummary.reduce((sum, s) => sum + s.count, 0)}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <button className="text-rs-blue-600 hover:text-rs-blue-700 text-sm">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          <span className="font-medium">{activity.user_email || activity.centre_name}</span> {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/admin/content-management/videos/create"
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rs-blue-500 hover:bg-rs-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Create Video</p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/content-management/quizzes/create"
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rs-blue-500 hover:bg-rs-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Create Quiz</p>
                    </div>
                  </Link>

                  <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <div className="text-center">
                      <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Export Data</p>
                    </div>
                  </button>

                  <Link
                    href="/analytics"
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Analytics</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}