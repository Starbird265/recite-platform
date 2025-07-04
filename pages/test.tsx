import React from 'react'
import { PixelCard, PixelButton, PixelTitle } from '../components/PixelComponents'

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <PixelTitle className="text-center text-white mb-8">
          🎮 RS-CIT Platform Test Page
        </PixelTitle>
        
        <PixelCard className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            ✅ Basic Components Working
          </h2>
          <p className="text-gray-300 mb-4">
            If you can see this card and the button below, the basic pixel components are working correctly!
          </p>
          <PixelButton 
            variant="primary" 
            onClick={() => alert('Button clicked!')}
          >
            Test Button
          </PixelButton>
        </PixelCard>
        
        <PixelCard variant="gaming" className="mb-6">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">
            🎯 Gaming Card Variant
          </h2>
          <p className="text-gray-300">
            This is a gaming-styled pixel card component.
          </p>
        </PixelCard>
        
        <div className="text-center">
          <PixelButton 
            variant="success" 
            size="lg"
            onClick={() => window.location.href = '/pixel-landing'}
          >
            Go to Pixel Landing Page
          </PixelButton>
        </div>
      </div>
    </div>
  )
}

export default TestPage