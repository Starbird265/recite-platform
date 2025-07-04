import React, { useState, useEffect } from 'react'
import { getTypeformEmbedUrl } from '../utils/third-party'
import { PixelCard, PixelButton } from './PixelComponents'

interface TypeformEmbedProps {
  formId: string
  height?: string
  title?: string
  description?: string
  hideHeaders?: boolean
  hideFooter?: boolean
  opacity?: number
  className?: string
  onSubmit?: (data: any) => void
}

const TypeformEmbed: React.FC<TypeformEmbedProps> = ({
  formId,
  height = '600px',
  title = 'Get in Touch',
  description = 'Tell us about your learning needs and we\'ll help you find the perfect course.',
  hideHeaders = false,
  hideFooter = false,
  opacity = 100,
  className = '',
  onSubmit
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const embedUrl = getTypeformEmbedUrl(formId, {
    hideHeaders,
    hideFooter,
    opacity: opacity / 100
  })

  useEffect(() => {
    // Listen for Typeform submission events
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://form.typeform.com') return

      if (event.data.type === 'form_submit') {
        setIsSubmitted(true)
        onSubmit?.(event.data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSubmit])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setError('Failed to load the form. Please try again.')
    setIsLoading(false)
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Force iframe reload by changing the src
    const iframe = document.getElementById('typeform-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = embedUrl
    }
  }

  if (isSubmitted) {
    return (
      <PixelCard className={`p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Thank You!
          </h3>
          <p className="text-gray-400 mb-6">
            Your enquiry has been submitted successfully. We&apos;ll get back to you within 24 hours.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span>📧</span>
              <span>Check your email for confirmation</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span>📱</span>
              <span>We&apos;ll call you within 24 hours</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span>🎓</span>
              <span>Get ready to start your RS-CIT journey!</span>
            </div>
          </div>
        </div>
      </PixelCard>
    )
  }

  return (
    <PixelCard className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-500 to-blue-500">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-blue-100">{description}</p>
      </div>

      {/* Form Content */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading form...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-red-400 mb-4">❌ {error}</p>
              <PixelButton onClick={handleRetry} variant="outline">
                Try Again
              </PixelButton>
            </div>
          </div>
        )}

        <iframe
          id="typeform-iframe"
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className="w-full"
          title={title}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>🔒 Your information is secure</span>
          <span>⚡ Quick 2-minute form</span>
        </div>
      </div>
    </PixelCard>
  )
}

export default TypeformEmbed

// Usage example component
export const EnquiryForm: React.FC = () => {
  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data)
    // You can send this data to your webhook or analytics
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TypeformEmbed
        formId="your-typeform-id" // Replace with your actual Typeform ID
        height="700px"
        title="Start Your RS-CIT Journey"
        description="Tell us about your goals and we'll help you find the perfect course and center."
        hideHeaders={true}
        hideFooter={false}
        opacity={100}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}