// Third-party service utilities for RS-CIT Platform

// YouTube Integration
export const getYouTubeEmbedUrl = (videoId: string, autoplay: boolean = false) => {
  const params = new URLSearchParams({
    rel: '0', // Don't show related videos
    modestbranding: '1', // Minimal YouTube branding
    controls: '1', // Show player controls
    fs: '1', // Allow fullscreen
    cc_load_policy: '1', // Show closed captions
    iv_load_policy: '3', // Hide video annotations
    autoplay: autoplay ? '1' : '0'
  })
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high') => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  }
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

// Validate YouTube URL and extract video ID
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

// Google Maps Integration
export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve()
      return
    }
    
    // Check if script is already loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkLoaded)
          resolve()
        }
      }, 100)
      return
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    
    document.head.appendChild(script)
  })
}

// Typeform Integration
export const getTypeformEmbedUrl = (formId: string, options: {
  hideHeaders?: boolean
  hideFooter?: boolean
  opacity?: number
} = {}) => {
  const params = new URLSearchParams()
  
  if (options.hideHeaders) params.append('embed-type', 'widget')
  if (options.hideFooter) params.append('embed-hide-footer', 'true')
  if (options.opacity) params.append('embed-opacity', options.opacity.toString())
  
  const queryString = params.toString()
  return `https://form.typeform.com/to/${formId}${queryString ? `?${queryString}` : ''}`
}

// Razorpay Integration
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    
    document.head.appendChild(script)
  })
}

// WhatsApp Integration
export const openWhatsAppChat = (phoneNumber: string, message: string = '') => {
  const encodedMessage = encodeURIComponent(message)
  const url = `https://wa.me/${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`
  window.open(url, '_blank')
}

// Email Integration
export const openEmailClient = (email: string, subject: string = '', body: string = '') => {
  const params = new URLSearchParams()
  if (subject) params.append('subject', subject)
  if (body) params.append('body', body)
  
  const url = `mailto:${email}${params.toString() ? `?${params.toString()}` : ''}`
  window.open(url)
}

// Phone Integration
export const openPhoneDialer = (phoneNumber: string) => {
  window.open(`tel:${phoneNumber}`)
}

// Social Media Integration
export const shareOnSocial = (platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp', options: {
  url?: string
  text?: string
  hashtags?: string[]
}) => {
  const currentUrl = options.url || window.location.href
  const text = options.text || 'Check this out!'
  const hashtags = options.hashtags?.join(',') || ''
  
  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}&hashtags=${hashtags}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${currentUrl}`)}`
  }
  
  window.open(urls[platform], '_blank', 'width=600,height=400')
}

// Utils for checking if services are available
export const checkServiceAvailability = () => {
  return {
    googleMaps: !!(window.google && window.google.maps),
    razorpay: !!window.Razorpay,
    youtube: true, // YouTube embed doesn't require a script
    typeform: true // Typeform embed doesn't require a script
  }
}

// Export all utilities
export const ThirdPartyUtils = {
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  extractYouTubeVideoId,
  loadGoogleMapsScript,
  getTypeformEmbedUrl,
  loadRazorpayScript,
  openWhatsAppChat,
  openEmailClient,
  openPhoneDialer,
  shareOnSocial,
  checkServiceAvailability
}

// Type definitions for external services
declare global {
  interface Window {
    google: any
    Razorpay: any
  }
}