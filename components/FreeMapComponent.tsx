import React, { useEffect, useRef, useState } from 'react'
import { PixelCard, PixelButton } from './PixelComponents'
import { getCurrentLocationFree, geocodeAddressFree, getSampleLocations } from '../utils/maps-alternatives'

// No external dependencies needed - using vanilla JS
const FreeMapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [centers, setCenters] = useState(getSampleLocations())
  const [selectedCenter, setSelectedCenter] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeMap()
    getUserLocation()
  }, [])

  const initializeMap = () => {
    if (!mapRef.current) return

    // Create a simple map interface without external libraries
    mapRef.current.innerHTML = `
      <div class="relative w-full h-96 bg-gray-800 rounded-lg overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900 to-green-900"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-white text-center">
            <div class="text-4xl mb-4">🗺️</div>
            <h3 class="text-xl font-bold mb-2">Interactive Map</h3>
            <p class="text-gray-300">Centers marked below</p>
          </div>
        </div>
        <div class="absolute bottom-4 left-4 right-4">
          <div class="grid grid-cols-2 gap-2">
            ${centers.map(center => `
              <div class="bg-white/90 backdrop-blur-sm rounded p-2 cursor-pointer hover:bg-white transition-colors" 
                   onclick="selectCenter('${center.id}')">
                <div class="text-xs font-medium text-gray-800">${center.name}</div>
                <div class="text-xs text-gray-600">${center.address}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `

    // Add click handlers
    ;(window as any).selectCenter = (id: string) => {
      const center = centers.find(c => c.id === id)
      if (center) {
        setSelectedCenter(center)
      }
    }
  }

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocationFree()
      setUserLocation(location)
    } catch (error) {
      console.log('Location not available:', error)
    }
  }

  const searchLocation = async () => {
    if (!searchAddress.trim()) return
    
    setLoading(true)
    try {
      const result = await geocodeAddressFree(searchAddress)
      console.log('Found location:', result)
      // You can add the location to your centers or show it on map
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const sortedCenters = userLocation 
    ? centers.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
        return distA - distB
      })
    : centers

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <PixelCard className="p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search location (e.g., Delhi, Mumbai)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
          />
          <PixelButton onClick={searchLocation} disabled={loading}>
            {loading ? '🔍...' : '🔍 Search'}
          </PixelButton>
        </div>
      </PixelCard>

      {/* Map */}
      <PixelCard className="overflow-hidden">
        <div ref={mapRef} />
      </PixelCard>

      {/* Centers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCenters.map((center) => {
          const distance = userLocation 
            ? calculateDistance(userLocation.lat, userLocation.lng, center.lat, center.lng)
            : null

          return (
            <PixelCard key={center.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{center.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  center.verified ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {center.verified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>{center.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>{center.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>₹{center.fees.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>⭐</span>
                    <span>{center.rating}/5</span>
                  </div>
                  {distance && (
                    <span className="text-cyan-400">
                      📏 {distance.toFixed(1)} km away
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <PixelButton 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedCenter(center)}
                >
                  View Details
                </PixelButton>
              </div>
            </PixelCard>
          )
        })}
      </div>

      {/* Selected Center Details */}
      {selectedCenter && (
        <PixelCard className="p-6 bg-gradient-to-r from-cyan-900 to-blue-900">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">{selectedCenter.name}</h2>
            <button
              onClick={() => setSelectedCenter(null)}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-white font-medium">Address</div>
                  <div className="text-gray-300">{selectedCenter.address}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📞</span>
                <div>
                  <div className="text-white font-medium">Phone</div>
                  <div className="text-gray-300">{selectedCenter.phone}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-white font-medium">Course Fee</div>
                  <div className="text-gray-300">₹{selectedCenter.fees.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-white font-medium">Rating</div>
                  <div className="text-gray-300">{selectedCenter.rating}/5</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <PixelButton className="flex-1">
              📞 Call Now
            </PixelButton>
            <PixelButton variant="outline" className="flex-1">
              📧 Send Email
            </PixelButton>
          </div>
        </PixelCard>
      )}
    </div>
  )
}

export default FreeMapComponent