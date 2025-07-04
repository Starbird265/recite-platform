// Free map alternatives that don't require credit cards

// 1. OpenStreetMap with Leaflet (100% Free)
export const initLeafletMap = () => {
  // No API key needed - completely free
  return {
    provider: 'OpenStreetMap',
    apiKey: 'not-required',
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    free: true
  }
}

// 2. Mapbox (Free tier: 50k requests/month)
export const getMapboxConfig = () => {
  return {
    provider: 'Mapbox',
    apiKey: 'YOUR_MAPBOX_TOKEN', // Free signup, no credit card
    styleUrl: 'mapbox://styles/mapbox/streets-v11',
    freeLimit: '50,000 requests/month',
    signupUrl: 'https://www.mapbox.com/signup/'
  }
}

// 3. Here Maps (Free tier: 250k requests/month)
export const getHereConfig = () => {
  return {
    provider: 'HERE',
    apiKey: 'YOUR_HERE_API_KEY', // Free signup, no credit card
    freeLimit: '250,000 requests/month',
    signupUrl: 'https://developer.here.com/sign-up'
  }
}

// 4. Geolocation API (Built into browsers - 100% free)
export const getCurrentLocationFree = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    )
  })
}

// 5. Geocoding without API (using Nominatim - OpenStreetMap)
export const geocodeAddressFree = async (address: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  )
  const data = await response.json()
  
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name
    }
  }
  
  throw new Error('Address not found')
}

// 6. Sample Indian locations for testing
export const getSampleLocations = () => {
  return [
    {
      id: '1',
      name: 'RS-CIT Center Delhi',
      address: 'Connaught Place, New Delhi',
      lat: 28.6304,
      lng: 77.2177,
      phone: '+91-11-12345678',
      email: 'delhi@rscit.com',
      rating: 4.5,
      fees: 2500,
      verified: true
    },
    {
      id: '2', 
      name: 'RS-CIT Center Mumbai',
      address: 'Andheri East, Mumbai',
      lat: 19.1136,
      lng: 72.8697,
      phone: '+91-22-87654321',
      email: 'mumbai@rscit.com',
      rating: 4.2,
      fees: 2800,
      verified: true
    },
    {
      id: '3',
      name: 'RS-CIT Center Bangalore',
      address: 'Koramangala, Bangalore',
      lat: 12.9279,
      lng: 77.6271,
      phone: '+91-80-11223344',
      email: 'bangalore@rscit.com', 
      rating: 4.7,
      fees: 2600,
      verified: true
    },
    {
      id: '4',
      name: 'RS-CIT Center Jaipur',
      address: 'Malviya Nagar, Jaipur',
      lat: 26.8854,
      lng: 75.8063,
      phone: '+91-141-55667788',
      email: 'jaipur@rscit.com',
      rating: 4.3,
      fees: 2200,
      verified: true
    }
  ]
}