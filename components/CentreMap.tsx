import React, { useEffect, useState, useRef } from 'react'
import { loadGoogleMapsScript } from '../utils/third-party'
import { getCenters } from '../lib/supabase-queries'
import { PixelCard, PixelButton } from './PixelComponents'

interface Centre {
  id: string
  name: string
  address: string
  phone: string
  email: string
  latitude: number
  longitude: number
  rating: number
  fees: number
  verified: boolean
}

interface CentreMapProps {
  selectedCentre?: Centre
  onCentreSelect?: (centre: Centre) => void
  className?: string
}

const CentreMap: React.FC<CentreMapProps> = ({
  selectedCentre,
  onCentreSelect,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    initializeMap()
  }, [])

  useEffect(() => {
    if (map && centres.length > 0) {
      addMarkersToMap()
    }
  }, [map, centres])

  const initializeMap = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        throw new Error('Google Maps API key not found')
      }

      await loadGoogleMapsScript(apiKey)
      await loadCentres()
      await getCurrentLocation()
      
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: userLocation || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
          styles: [
            {
              "featureType": "all",
              "elementType": "geometry.fill",
              "stylers": [{"color": "#1f2937"}]
            },
            {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#e5e7eb"}]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{"color": "#374151"}]
            }
          ]
        })

        setMap(mapInstance)
      }
    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Failed to load map. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const loadCentres = async () => {
    try {
      const centresData = await getCenters()
      setCentres(centresData || [])
    } catch (err) {
      console.error('Error loading centres:', err)
      setError('Failed to load centres')
    }
  }

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      } catch (err) {
        console.warn('Could not get user location:', err)
        // Use default location (Delhi)
        setUserLocation({ lat: 28.6139, lng: 77.2090 })
      }
    }
  }

  const addMarkersToMap = () => {
    if (!map) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: google.maps.Marker[] = []

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#1E40AF',
          strokeWeight: 2
        }
      })
      newMarkers.push(userMarker)
    }

    // Add centre markers
    centres.forEach(centre => {
      const marker = new google.maps.Marker({
        position: { lat: centre.latitude, lng: centre.longitude },
        map: map,
        title: centre.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: centre.verified ? '#10B981' : '#F59E0B',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #1f2937; font-family: Inter, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              ${centre.name}
            </h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">
              📍 ${centre.address}
            </p>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">
              📞 ${centre.phone}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
              💰 ₹${centre.fees.toLocaleString()} per course
            </p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; padding: 2px 8px; border-radius: 12px; 
                background: ${centre.verified ? '#D1FAE5' : '#FEF3C7'}; 
                color: ${centre.verified ? '#065F46' : '#92400E'};">
                ${centre.verified ? '✅ Verified' : '⏳ Pending'}
              </span>
              <span style="font-size: 12px; color: #6b7280;">
                ⭐ ${centre.rating.toFixed(1)}
              </span>
            </div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        onCentreSelect?.(centre)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        const position = marker.getPosition()
        if (position) bounds.extend(position)
      })
      map.fitBounds(bounds)
    }
  }

  const handleRecenterMap = () => {
    if (map && userLocation) {
      map.setCenter(userLocation)
      map.setZoom(12)
    }
  }

  if (loading) {
    return (
      <PixelCard className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading map...</p>
          </div>
        </div>
      </PixelCard>
    )
  }

  if (error) {
    return (
      <PixelCard className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-400 mb-4">❌ {error}</p>
            <PixelButton onClick={initializeMap} variant="outline">
              Try Again
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    )
  }

  return (
    <PixelCard className={`overflow-hidden ${className}`}>
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96"
          style={{ minHeight: '400px' }}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <PixelButton
            onClick={handleRecenterMap}
            size="sm"
            className="bg-white/90 text-gray-800 hover:bg-white"
          >
            📍 My Location
          </PixelButton>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm text-gray-800 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Verified Centre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Pending Centre</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centre Count */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">
            📍 Found {centres.length} centres nearby
          </span>
          <span className="text-gray-400 text-sm">
            Click markers for details
          </span>
        </div>
      </div>
    </PixelCard>
  )
}

export default CentreMap