import React, { useState, useEffect } from 'react'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/third-party'
import { PixelCard, PixelButton } from './PixelComponents'

interface VideoPlayerProps {
  videoId: string
  title: string
  description?: string
  onVideoEnd?: () => void
  onVideoProgress?: (progress: number) => void
  autoplay?: boolean
  className?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  description,
  onVideoEnd,
  onVideoProgress,
  autoplay = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [showPlayer, setShowPlayer] = useState(autoplay)
  const [progress, setProgress] = useState(0)

  const embedUrl = getYouTubeEmbedUrl(videoId, autoplay)
  const thumbnailUrl = getYouTubeThumbnail(videoId, 'high')

  const handlePlay = () => {
    setIsPlaying(true)
    setShowPlayer(true)
  }

  useEffect(() => {
    // Track video progress (simplified - in real app you'd use YouTube API)
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1
          onVideoProgress?.(newProgress)
          
          // Simulate video end after 10 minutes (600 seconds)
          if (newProgress >= 600) {
            onVideoEnd?.()
            setIsPlaying(false)
            clearInterval(interval)
          }
          
          return newProgress
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, onVideoProgress, onVideoEnd])

  return (
    <PixelCard className={`overflow-hidden ${className}`}>
      <div className="relative">
        {showPlayer ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full cursor-pointer" onClick={handlePlay}>
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-gray-400 text-sm mb-4">{description}</p>
        )}
        
        {/* Progress Bar */}
        {isPlaying && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress / 600) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {!showPlayer && (
            <PixelButton onClick={handlePlay} className="flex-1">
              ▶️ Play Video
            </PixelButton>
          )}
          <PixelButton variant="outline" size="sm">
            📝 Take Notes
          </PixelButton>
          <PixelButton variant="outline" size="sm">
            🔄 Rewatch
          </PixelButton>
        </div>
      </div>
    </PixelCard>
  )
}

export default VideoPlayer