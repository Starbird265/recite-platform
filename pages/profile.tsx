import { useState, useEffect } from 'react'
import Head from 'next/head'
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Clock, Save, Bell, Settings, Shield, CreditCard, Edit, Camera } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  city: string
  subscription_plan: string
  created_at: string
  updated_at: string
  avatar_url?: string
  date_of_birth?: string
  gender?: string
  address?: string
}

interface UserStats {
  totalLessons: number
  completedLessons: number
  totalHours: number
  achievements: number
  currentStreak: number
  averageScore: number
  rank: number
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    totalLessons: 0,
    completedLessons: 0,
    totalHours: 0,
    achievements: 0,
    currentStreak: 0,
    averageScore: 0,
    rank: 0
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    date_of_birth: '',
    gender: '',
    address: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchStats()
      fetchNotifications()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      const profileData = data || {
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: '',
        city: '',
        subscription_plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setProfile(profileData)
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        city: profileData.city || '',
        date_of_birth: profileData.date_of_birth || '',
        gender: profileData.gender || '',
        address: profileData.address || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      // Get user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*, lessons(duration_minutes)')
        .eq('user_id', user.id)

      // Get achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)

      const completedLessons = progressData?.filter(p => p.completed) || []
      const totalHours = completedLessons.reduce((acc, p) => {
        return acc + (p.lessons?.duration_minutes || 0)
      }, 0)

      const averageScore = completedLessons.length > 0 
        ? Math.round(completedLessons.reduce((acc, p) => acc + (p.score || 0), 0) / completedLessons.length)
        : 0

      setStats({
        totalLessons: progressData?.length || 0,
        completedLessons: completedLessons.length,
        totalHours: Math.round(totalHours / 60),
        achievements: achievementsData?.length || 0,
        currentStreak: 7, // This would be calculated based on consecutive days
        averageScore,
        rank: Math.floor(Math.random() * 1000) + 1 // Mock rank
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: formData.name,
          email: profile.email,
          phone: formData.phone,
          city: formData.city,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setProfile({
        ...profile,
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address
      })
      setEditMode(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Award className="h-5 w-5 text-green-500" />
      case 'warning': return <Bell className="h-5 w-5 text-yellow-500" />
      case 'error': return <Shield className="h-5 w-5 text-red-500" />
      default: return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view your profile</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Profile | RS-CIT Platform</title>
        <meta name="description" content="Manage your RS-CIT learning profile and track progress" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="relative">
                  <div className="bg-rs-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                    <User className="h-12 w-12 text-rs-blue-600" />
                  </div>
                  <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-white rounded-full p-2 shadow-md">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {profile?.name || 'User'}
                </h2>
                <p className="text-gray-600 mb-4">RS-CIT Student</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{stats.currentStreak}</p>
                    <p className="text-gray-600">Day Streak</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">#{stats.rank}</p>
                    <p className="text-gray-600">Rank</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 space-y-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Lessons Completed</p>
                      <p className="text-xl font-bold text-gray-900">{stats.completedLessons}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Hours Studied</p>
                      <p className="text-xl font-bold text-gray-900">{stats.totalHours}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-xl font-bold text-gray-900">{stats.averageScore}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'profile', label: 'Profile', icon: User },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'billing', label: 'Billing', icon: CreditCard }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-rs-blue-500 text-rs-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                        <div className="flex space-x-3">
                          {editMode ? (
                            <>
                              <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700 disabled:opacity-50"
                              >
                                {saving ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Save
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditMode(true)}
                              className="flex items-center px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          {editMode ? (
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">{profile?.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <p className="text-gray-900 py-2">{profile?.email}</p>
                          <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          {editMode ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">{profile?.phone || 'Not provided'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          {editMode ? (
                            <select
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                            >
                              <option value="">Select city</option>
                              <option value="jaipur">Jaipur</option>
                              <option value="jodhpur">Jodhpur</option>
                              <option value="udaipur">Udaipur</option>
                              <option value="kota">Kota</option>
                              <option value="ajmer">Ajmer</option>
                              <option value="bharatpur">Bharatpur</option>
                              <option value="bikaner">Bikaner</option>
                              <option value="alwar">Alwar</option>
                            </select>
                          ) : (
                            <p className="text-gray-900 py-2 capitalize">{profile?.city || 'Not provided'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                          {editMode ? (
                            <input
                              type="date"
                              name="date_of_birth"
                              value={formData.date_of_birth}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">
                              {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          {editMode ? (
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <p className="text-gray-900 py-2 capitalize">{profile?.gender || 'Not provided'}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          {editMode ? (
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">{profile?.address || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h3>
                      <div className="space-y-4">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 rounded-lg border ${
                                notification.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-rs-blue-200'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900">{notification.title}</p>
                                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <button
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    className="text-rs-blue-600 hover:text-rs-blue-700 text-sm"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Update your password to keep your account secure
                          </p>
                          <button className="px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700">
                            Change Password
                          </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Add an extra layer of security to your account
                          </p>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Tab */}
                  {activeTab === 'billing' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing Information</h3>
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
                          <p className="font-medium text-gray-900 capitalize">
                            {profile?.subscription_plan?.replace('_', ' ') || 'Free'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Payment History</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            View your payment history and download invoices
                          </p>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            View History
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}