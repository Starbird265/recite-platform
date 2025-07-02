import { useState, useEffect } from 'react'
import Head from 'next/head'
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Clock, Save } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  name: string
  email: string
  phone: string
  city: string
  subscription_plan: string
  created_at: string
}

interface UserStats {
  totalLessons: number
  completedLessons: number
  totalHours: number
  achievements: number
  currentStreak: number
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    totalLessons: 0,
    completedLessons: 0,
    totalHours: 0,
    achievements: 0,
    currentStreak: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchStats()
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

      if (error) throw error
      
      setProfile(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        city: data.city || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
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

      setStats({
        totalLessons: progressData?.length || 0,
        completedLessons: completedLessons.length,
        totalHours: Math.round(totalHours / 60),
        achievements: achievementsData?.length || 0,
        currentStreak: 7 // This would be calculated based on consecutive days
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({
        ...profile,
        name: formData.name,
        phone: formData.phone,
        city: formData.city
      })
      setEditMode(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-rs-blue-100 rounded-full p-3 mr-4">
                    <User className="h-8 w-8 text-rs-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile?.name || 'User'}
                    </h1>
                    <p className="text-gray-600">RS-CIT Student</p>
                  </div>
                </div>
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
                      className="px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      {editMode ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="font-medium bg-transparent border-b border-gray-300 focus:border-rs-blue-500 outline-none"
                        />
                      ) : (
                        <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      {editMode ? (
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="font-medium bg-transparent border-b border-gray-300 focus:border-rs-blue-500 outline-none"
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
                        <p className="font-medium capitalize">{profile?.city || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      {editMode ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="font-medium bg-transparent border-b border-gray-300 focus:border-rs-blue-500 outline-none"
                        />
                      ) : (
                        <p className="font-medium">{profile?.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Subscription</p>
                      <p className="font-medium capitalize">{profile?.subscription_plan}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <BookOpen className="h-8 w-8 text-rs-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.completedLessons}</div>
              <p className="text-sm text-gray-600">Lessons Completed</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalHours}</div>
              <p className="text-sm text-gray-600">Hours Studied</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.achievements}</div>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Continue Learning</p>
                    <p className="text-sm text-gray-600">Go back to your dashboard</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => window.location.href = '/centers'}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Find Centers</p>
                    <p className="text-sm text-gray-600">Locate RS-CIT centers near you</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Sign Out</p>
                    <p className="text-sm">Sign out of your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}