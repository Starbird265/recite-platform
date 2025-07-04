import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelGrid 
} from '../components/PixelComponents'

interface Partner {
  id: string
  name: string
  email: string
  phone: string
  company: string
  centers: number
  students: number
  revenue: number
  status: 'active' | 'pending' | 'inactive'
  joinedAt: string
  referralCode: string
}

interface Center {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  partnerId: string
  referralCode: string
  status: 'active' | 'inactive'
  createdAt: string
}

const PartnerAdmin = () => {
  const { user } = useAuth()
  const [partners, setPartners] = useState<Partner[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'partners' | 'centers' | 'analytics'>('partners')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      // Mock data for demo
      setPartners([
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+91 9876543210',
          company: 'Tech Learning Solutions',
          centers: 3,
          students: 245,
          revenue: 125000,
          status: 'active',
          joinedAt: '2024-01-15',
          referralCode: 'TLS001'
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 8765432109',
          company: 'Digital Skills Academy',
          centers: 2,
          students: 198,
          revenue: 98000,
          status: 'active',
          joinedAt: '2024-02-20',
          referralCode: 'DSA002'
        },
        {
          id: '3',
          name: 'Amit Singh',
          email: 'amit@example.com',
          phone: '+91 7654321098',
          company: 'Modern Training Center',
          centers: 1,
          students: 156,
          revenue: 76000,
          status: 'pending',
          joinedAt: '2024-03-10',
          referralCode: 'MTC003'
        }
      ])

      setCenters([
        {
          id: '1',
          name: 'Central Hub - Jaipur',
          address: 'MI Road, Jaipur, Rajasthan',
          lat: 26.9124,
          lng: 75.7873,
          partnerId: '1',
          referralCode: 'TLS001-JAI',
          status: 'active',
          createdAt: '2024-01-20'
        },
        {
          id: '2',
          name: 'Tech Center - Udaipur',
          address: 'City Palace Road, Udaipur, Rajasthan',
          lat: 24.5854,
          lng: 73.6855,
          partnerId: '2',
          referralCode: 'DSA002-UDA',
          status: 'active',
          createdAt: '2024-02-25'
        },
        {
          id: '3',
          name: 'Learning Hub - Jodhpur',
          address: 'Clock Tower, Jodhpur, Rajasthan',
          lat: 26.2389,
          lng: 73.0243,
          partnerId: '1',
          referralCode: 'TLS001-JOD',
          status: 'active',
          createdAt: '2024-03-01'
        }
      ])

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
      setLoading(false)
    }
  }

  const handleApprovePartner = async (partnerId: string) => {
    try {
      setPartners(prev => prev.map(p => 
        p.id === partnerId ? { ...p, status: 'active' as const } : p
      ))
      
      toast.success('Partner approved successfully!')
    } catch (error) {
      console.error('Error approving partner:', error)
      toast.error('Failed to approve partner')
    }
  }

  const handleRejectPartner = async (partnerId: string) => {
    try {
      setPartners(prev => prev.map(p => 
        p.id === partnerId ? { ...p, status: 'inactive' as const } : p
      ))
      
      toast.success('Partner rejected')
    } catch (error) {
      console.error('Error rejecting partner:', error)
      toast.error('Failed to reject partner')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'inactive': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'pending': return '⏳'
      case 'inactive': return '❌'
      default: return '❓'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCard className="text-center">
          <PixelIcon color="accent">🔒</PixelIcon>
          <h2 className="text-xl font-semibold mb-4">Admin Access Required</h2>
          <p className="pixel-text-gray-600 mb-6">Please log in with admin credentials.</p>
          <PixelButton>Admin Login</PixelButton>
        </PixelCard>
      </div>
    )
  }

  return (
    <div>
      <Head>
        <title>👥 Partner Management - RS-CIT Admin</title>
        <meta name="description" content="Manage training partners and centers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200">
          <div className="pixel-container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <PixelIcon size="sm" color="accent">👥</PixelIcon>
                <div>
                  <h1 className="text-2xl font-bold pixel-text-gray-800">Partner Management</h1>
                  <p className="pixel-text-gray-500">Manage training partners and centers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <PixelButton variant="outline">
                  📊 Export Data
                </PixelButton>
                <PixelButton variant="success">
                  ➕ Add Partner
                </PixelButton>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-gray-200">
          <div className="pixel-container">
            <div className="flex gap-8">
              {(['partners', 'centers', 'analytics'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'partners' && '👥'} 
                  {tab === 'centers' && '🏢'} 
                  {tab === 'analytics' && '📊'} 
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pixel-container py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="pixel-bounce">
                <PixelIcon size="lg" color="primary">⏳</PixelIcon>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Partners Tab */}
              {activeTab === 'partners' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold pixel-text-gray-800">Training Partners</h2>
                  </div>

                  <PixelGrid cols={1}>
                    {partners.map((partner) => (
                      <PixelCard key={partner.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {partner.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold pixel-text-gray-800">{partner.name}</h3>
                              <p className="pixel-text-gray-600">{partner.company}</p>
                              <p className="pixel-text-gray-500 text-sm">{partner.email} • {partner.phone}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="text-center">
                              <div className="font-semibold pixel-text-gray-800">{partner.centers}</div>
                              <div className="pixel-text-gray-500 text-sm">Centers</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold pixel-text-gray-800">{partner.students}</div>
                              <div className="pixel-text-gray-500 text-sm">Students</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold pixel-text-gray-800">₹{(partner.revenue / 1000).toFixed(0)}K</div>
                              <div className="pixel-text-gray-500 text-sm">Revenue</div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                                {getStatusIcon(partner.status)} {partner.status}
                              </span>
                              
                              {partner.status === 'pending' && (
                                <div className="flex gap-2">
                                  <PixelButton
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleApprovePartner(partner.id)}
                                  >
                                    ✅ Approve
                                  </PixelButton>
                                  <PixelButton
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleRejectPartner(partner.id)}
                                  >
                                    ❌ Reject
                                  </PixelButton>
                                </div>
                              )}
                              
                              <PixelButton size="sm" variant="primary">
                                View Details
                              </PixelButton>
                            </div>
                          </div>
                        </div>
                      </PixelCard>
                    ))}
                  </PixelGrid>
                </div>
              )}

              {/* Centers Tab */}
              {activeTab === 'centers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold pixel-text-gray-800">Training Centers</h2>
                  </div>

                  <PixelGrid cols={1}>
                    {centers.map((center) => (
                      <PixelCard key={center.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <PixelIcon size="md" color="primary">🏢</PixelIcon>
                            <div>
                              <h3 className="font-semibold pixel-text-gray-800">{center.name}</h3>
                              <p className="pixel-text-gray-600">{center.address}</p>
                              <p className="pixel-text-gray-500 text-sm">Code: {center.referralCode}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <PixelButton size="sm" variant="outline">
                              📍 View on Map
                            </PixelButton>
                            <PixelButton size="sm" variant="secondary">
                              📊 Analytics
                            </PixelButton>
                          </div>
                        </div>
                      </PixelCard>
                    ))}
                  </PixelGrid>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold pixel-text-gray-800">Partner Analytics</h2>
                  
                  <PixelGrid cols={4}>
                    <PixelCard className="text-center">
                      <PixelIcon size="md" color="primary">👥</PixelIcon>
                      <div className="text-2xl font-bold pixel-text-gray-800">3</div>
                      <div className="pixel-text-gray-500">Total Partners</div>
                    </PixelCard>
                    
                    <PixelCard className="text-center">
                      <PixelIcon size="md" color="success">🏢</PixelIcon>
                      <div className="text-2xl font-bold pixel-text-gray-800">6</div>
                      <div className="pixel-text-gray-500">Active Centers</div>
                    </PixelCard>
                    
                    <PixelCard className="text-center">
                      <PixelIcon size="md" color="warning">🎓</PixelIcon>
                      <div className="text-2xl font-bold pixel-text-gray-800">599</div>
                      <div className="pixel-text-gray-500">Total Students</div>
                    </PixelCard>
                    
                    <PixelCard className="text-center">
                      <PixelIcon size="md" color="accent">💰</PixelIcon>
                      <div className="text-2xl font-bold pixel-text-gray-800">₹299K</div>
                      <div className="pixel-text-gray-500">Total Revenue</div>
                    </PixelCard>
                  </PixelGrid>
                  
                  <PixelCard className="text-center py-12">
                    <PixelIcon size="lg" color="primary">📊</PixelIcon>
                    <h3 className="text-lg font-semibold mb-2 pixel-text-gray-800">Advanced Analytics</h3>
                    <p className="pixel-text-gray-600 mb-4">Detailed partner performance metrics and trends</p>
                    <PixelButton variant="primary">View Full Report</PixelButton>
                  </PixelCard>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PartnerAdmin