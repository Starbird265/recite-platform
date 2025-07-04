// Free YouTube integration without API key requirements

// 1. YouTube oEmbed API (No API key needed)
export const getYouTubeVideoInfo = async (videoId: string) => {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    const data = await response.json()
    
    return {
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
      width: data.width,
      height: data.height,
      html: data.html
    }
  } catch (error) {
    console.error('Error fetching YouTube video info:', error)
    return null
  }
}

// 2. Extract video ID from various YouTube URL formats
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// 3. Generate YouTube thumbnail URLs (no API needed)
export const getYouTubeThumbnails = (videoId: string) => {
  const baseUrl = `https://img.youtube.com/vi/${videoId}`
  
  return {
    default: `${baseUrl}/default.jpg`,      // 120x90
    medium: `${baseUrl}/mqdefault.jpg`,     // 320x180
    high: `${baseUrl}/hqdefault.jpg`,       // 480x360
    standard: `${baseUrl}/sddefault.jpg`,   // 640x480
    maxres: `${baseUrl}/maxresdefault.jpg`  // 1280x720
  }
}

// 4. YouTube embed parameters (no API key needed)
export const getYouTubeEmbedUrl = (videoId: string, options: {
  autoplay?: boolean
  controls?: boolean
  mute?: boolean
  loop?: boolean
  start?: number
  end?: number
  modestbranding?: boolean
  rel?: boolean
} = {}) => {
  const {
    autoplay = false,
    controls = true,
    mute = false,
    loop = false,
    start,
    end,
    modestbranding = true,
    rel = false
  } = options

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: controls ? '1' : '0',
    mute: mute ? '1' : '0',
    loop: loop ? '1' : '0',
    modestbranding: modestbranding ? '1' : '0',
    rel: rel ? '1' : '0'
  })

  if (start) params.set('start', start.toString())
  if (end) params.set('end', end.toString())
  if (loop) params.set('playlist', videoId)

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

// 5. Sample RS-CIT course videos (free educational content)
export const getSampleCourseVideos = () => {
  return [
    {
      id: '1',
      title: 'Introduction to Computer Fundamentals',
      description: 'Learn the basics of computer systems, hardware, and software components.',
      videoId: 'zOjov-2OZ0E', // Free computer basics video
      duration: '15:30',
      module: 'Computer Fundamentals',
      order: 1,
      thumbnail: getYouTubeThumbnails('zOjov-2OZ0E').high
    },
    {
      id: '2',
      title: 'Microsoft Word - Getting Started',
      description: 'Introduction to Microsoft Word interface and basic document creation.',
      videoId: 'TtgzADmVrjg', // Free Word tutorial
      duration: '18:45',
      module: 'MS Word',
      order: 2,
      thumbnail: getYouTubeThumbnails('TtgzADmVrjg').high
    },
    {
      id: '3',
      title: 'Excel Basics - Spreadsheets Made Easy',
      description: 'Learn to create and format spreadsheets in Microsoft Excel.',
      videoId: 'rwbho0CARy8', // Free Excel tutorial
      duration: '22:10',
      module: 'MS Excel',
      order: 3,
      thumbnail: getYouTubeThumbnails('rwbho0CARy8').high
    },
    {
      id: '4',
      title: 'Internet and Email Essentials',
      description: 'Master web browsing, email, and online safety.',
      videoId: 'h8K49dD52WA', // Free internet basics
      duration: '16:25',
      module: 'Internet & Email',
      order: 4,
      thumbnail: getYouTubeThumbnails('h8K49dD52WA').high
    },
    {
      id: '5',
      title: 'PowerPoint Presentations',
      description: 'Create engaging presentations with Microsoft PowerPoint.',
      videoId: 'IiN2iE-8hNY', // Free PowerPoint tutorial
      duration: '20:30',
      module: 'MS PowerPoint',
      order: 5,
      thumbnail: getYouTubeThumbnails('IiN2iE-8hNY').high
    }
  ]
}

// 6. Check if video is available (no API key needed)
export const checkYouTubeVideoAvailability = async (videoId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`)
    return response.ok
  } catch (error) {
    return false
  }
}

// 7. Get video duration estimate (rough calculation)
export const estimateVideoDuration = (videoId: string): string => {
  // This is a placeholder - in real implementation you'd use oEmbed or API
  // For now, return random realistic durations
  const durations = ['8:30', '12:15', '15:45', '18:20', '22:10', '25:35']
  const hash = videoId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return durations[hash % durations.length]
}

// 8. Generate YouTube search URL (no API needed)
export const generateYouTubeSearchUrl = (query: string, channel?: string) => {
  const searchParams = new URLSearchParams({
    search_query: query
  })
  
  if (channel) {
    searchParams.set('sp', 'EgIQAg%253D%253D') // Channel filter
  }
  
  return `https://www.youtube.com/results?${searchParams.toString()}`
}

// 9. YouTube playlist embed (no API needed)
export const getYouTubePlaylistEmbedUrl = (playlistId: string, options: {
  autoplay?: boolean
  loop?: boolean
  startIndex?: number
} = {}) => {
  const { autoplay = false, loop = false, startIndex = 0 } = options
  
  const params = new URLSearchParams({
    list: playlistId,
    autoplay: autoplay ? '1' : '0',
    loop: loop ? '1' : '0',
    index: startIndex.toString()
  })
  
  return `https://www.youtube.com/embed/videoseries?${params.toString()}`
}

// 10. Create a complete RS-CIT course playlist
export const createRSCITCoursePlaylist = () => {
  return {
    id: 'rs-cit-complete-course',
    title: 'RS-CIT Complete Course',
    description: 'Complete RS-CIT certification course with practical examples',
    videos: getSampleCourseVideos(),
    totalDuration: '1h 40m',
    modules: [
      'Computer Fundamentals',
      'MS Word',
      'MS Excel', 
      'MS PowerPoint',
      'Internet & Email'
    ]
  }
}