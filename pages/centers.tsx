import { useState, useEffect } from 'react'
import Head from 'next/head'
import { MapPin, Phone, Mail, Star, Filter, List, Map } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Center {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  latitude: number
  longitude: number
  rating: number
  fees: number
  capacity: number
  verified: boolean
}

export default function CentersPage() {
  const { user } = useAuth()
  const [centers, setCenters] = useState<Center[]>([])
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [filters, setFilters] = useState({
    city: '',
    maxFees: 5000,
    minRating: 0
  })
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null)

  useEffect(() => {
    fetchCenters()
  }, [])

  useEffect(() => {
    const applyFilters = () => {
      let filtered = centers
  
      if (filters.city) {
        filtered = filtered.filter(center => 
          center.city.toLowerCase().includes(filters.city.toLowerCase())
        )
      }
  
      filtered = filtered.filter(center => 
        center.fees <= filters.maxFees && center.rating >= filters.minRating
      )
  
      setFilteredCenters(filtered)
    }

    applyFilters()
  }, [centers, filters])

  const fetchCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false })

      if (error) throw error
      setCenters(data || [])
    } catch (error) {
      console.error('Error fetching centers:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = centers

    if (filters.city) {
      filtered = filtered.filter(center => 
        center.city.toLowerCase().includes(filters.city.toLowerCase())
      )
    }

    filtered = filtered.filter(center => 
      center.fees <= filters.maxFees && center.rating >= filters.minRating
    )

    setFilteredCenters(filtered)
  }

  const handleCenterSelect = (center: Center) => {
    setSelectedCenter(center)
    // Store selection for payment flow
    localStorage.setItem('selectedCenter', JSON.stringify(center))
  }

  const rajasthanCities = [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bharatpur', 
    'Bikaner', 'Alwar', 'Sikar', 'Pali', 'Tonk', 'Kishangarh'
  ]

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
        <title>Find RS-CIT Centers | RS-CIT Platform</title>
        <meta name="description" content="Find verified RS-CIT centers near you across Rajasthan" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Find RS-CIT Centers</h1>
                <p className="text-gray-600 mt-2">Choose from {filteredCenters.length} verified centers across Rajasthan</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-rs-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-rs-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <Map className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <div className="flex items-center mb-4">
                  <Filter className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold">Filters</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters({...filters, city: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500"
                    >
                      <option value="">All Cities</option>
                      {rajasthanCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Fees: ₹{filters.maxFees}
                    </label>
                    <input
                      type="range"
                      min="3000"
                      max="6000"
                      step="100"
                      value={filters.maxFees}
                      onChange={(e) => setFilters({...filters, maxFees: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500"
                    >
                      <option value="0">Any Rating</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Centers List */}
            <div className="lg:col-span-3">
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {filteredCenters.map((center) => (
                    <div key={center.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{center.name}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{center.address}, {center.city}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {center.phone}
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {center.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center mb-2">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{center.rating}</span>
                            </div>
                            <div className="text-lg font-bold text-rs-blue-600">
                              ₹{center.fees.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Capacity: {center.capacity} students
                          </div>
                          <button
                            onClick={() => handleCenterSelect(center)}
                            className="bg-rs-blue-600 hover:bg-rs-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Select Center
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredCenters.length === 0 && (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No centers found</h3>
                      <p className="text-gray-600">Try adjusting your filters to see more options.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow h-96">
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Map className="h-16 w-16 mx-auto mb-4" />
                      <p>Map view will be implemented with Mapbox integration</p>
                      <p className="text-sm mt-2">Showing {filteredCenters.length} centers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Center Modal */}
        {selectedCenter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Confirm Center Selection</h3>
                <div className="mb-4">
                  <h4 className="font-semibold">{selectedCenter.name}</h4>
                  <p className="text-gray-600">{selectedCenter.address}</p>
                  <p className="text-rs-blue-600 font-bold">₹{selectedCenter.fees.toLocaleString()}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedCenter(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to payment page
                      window.location.href = '/payment'
                    }}
                    className="flex-1 px-4 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}