import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '../contexts/AuthContext'
import { PixelCard, PixelButton, PixelTitle, PixelGrid } from '../components/PixelComponents'
import VideoPlayer from '../components/VideoPlayer'
import CentreMap from '../components/CentreMap'
import TypeformEmbed from '../components/TypeformEmbed'
import PaymentModal from '../components/PaymentModal'
import { checkServiceAvailability } from '../utils/third-party'
import { checkFunctionsHealth } from '../utils/functions'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const IntegrationTestPage = () => {
  const { user } = useAuth()
  const [serviceStatus, setServiceStatus] = useState({
    googleMaps: false,
    razorpay: false,
    youtube: true,
    typeform: true,
    supabase: false,
    edgeFunctions: false
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    runIntegrationTests()
  }, [])

  const runIntegrationTests = async () => {
    const results: string[] = []
    
    // Test service availability
    const services = checkServiceAvailability()
    setServiceStatus(prev => ({ ...prev, ...services }))
    
    // Test Supabase connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (!error) {
        setServiceStatus(prev => ({ ...prev, supabase: true }))
        results.push('✅ Supabase connection successful')
      } else {
        results.push('❌ Supabase connection failed: ' + error.message)
      }
    } catch (error) {
      results.push('❌ Supabase connection error: ' + error)
    }

    // Test Edge Functions
    try {
      const functionsHealth = await checkFunctionsHealth()
      if (functionsHealth.available) {
        setServiceStatus(prev => ({ ...prev, edgeFunctions: true }))
        results.push('✅ Edge Functions are available')
      } else {
        results.push('❌ Edge Functions not available')
      }
    } catch (error) {
      results.push('❌ Edge Functions test failed: ' + error)
    }

    // Test Authentication
    if (user) {
      results.push('✅ User authentication working')
    } else {
      results.push('⚠️ User not authenticated')
    }

    setTestResults(results)
  }

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Test payment successful!')
    setTestResults(prev => [...prev, `✅ Payment test successful: ${paymentId}`])
  }

  const handlePaymentError = (error: any) => {
    toast.error('Test payment failed')
    setTestResults(prev => [...prev, `❌ Payment test failed: ${error.message}`])
  }

  const handleVideoProgress = (progress: number) => {
    console.log('Video progress:', progress)
  }

  const handleVideoEnd = () => {
    toast.success('Video completed!')
    setTestResults(prev => [...prev, '✅ Video player working'])
  }

  const handleFormSubmit = (data: any) => {
    toast.success('Form submitted successfully!')
    setTestResults(prev => [...prev, '✅ Typeform integration working'])
  }

  const handleCentreSelect = (centre: any) => {
    toast.success(`Centre selected: ${centre.name}`)
    setTestResults(prev => [...prev, '✅ Google Maps integration working'])
  }

  return (
    <>
      <Head>
        <title>Integration Test - RS-CIT Platform</title>
        <meta name="description" content="Test all integrations and services" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <PixelTitle className="text-white">
                🔧 Integration Test Dashboard
              </PixelTitle>
              <PixelButton onClick={runIntegrationTests} size="sm">
                🔄 Run Tests
              </PixelButton>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Service Status Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Service Status</h2>
            <PixelGrid cols={3} className="gap-4">
              {Object.entries(serviceStatus).map(([service, status]) => (
                <PixelCard key={service} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white capitalize">{service}</span>
                    <span className={`text-2xl ${status ? 'text-green-400' : 'text-red-400'}`}>
                      {status ? '✅' : '❌'}
                    </span>
                  </div>
                </PixelCard>
              ))}
            </PixelGrid>
          </div>

          {/* Test Results */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Test Results</h2>
            <PixelCard className="p-4">
              <div className="space-y-2">
                {testResults.length > 0 ? (
                  testResults.map((result, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      {result}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No tests run yet</div>
                )}
              </div>
            </PixelCard>
          </div>

          {/* Integration Tests */}
          <div className="space-y-8">
            
            {/* YouTube Video Test */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📺 YouTube Video Integration</h3>
              <VideoPlayer
                videoId="dQw4w9WgXcQ" // Rick Roll for testing
                title="Sample Video"
                description="Test video player integration"
                onVideoProgress={handleVideoProgress}
                onVideoEnd={handleVideoEnd}
                className="max-w-2xl"
              />
            </div>

            {/* Google Maps Test */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">🗺️ Google Maps Integration</h3>
              <CentreMap
                onCentreSelect={handleCentreSelect}
                className="max-w-4xl"
              />
            </div>

            {/* Typeform Test */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📝 Typeform Integration</h3>
              <div className="max-w-2xl">
                <TypeformEmbed
                  formId="test-form"
                  height="400px"
                  title="Test Form"
                  description="This is a test form integration"
                  onSubmit={handleFormSubmit}
                />
              </div>
            </div>

            {/* Payment Test */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">💳 Razorpay Integration</h3>
              <PixelCard className="p-6 max-w-md">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Test Payment
                  </h4>
                  <p className="text-gray-400 mb-4">
                    Click to test payment integration
                  </p>
                  <PixelButton onClick={() => setShowPaymentModal(true)}>
                    Test Payment (₹1)
                  </PixelButton>
                </div>
              </PixelCard>
            </div>

            {/* Authentication Test */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">🔐 Authentication Status</h3>
              <PixelCard className="p-6 max-w-md">
                {user ? (
                  <div className="text-center">
                    <div className="text-green-400 text-4xl mb-2">✅</div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Authenticated
                    </h4>
                    <p className="text-gray-400">
                      Logged in as: {user.email}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-red-400 text-4xl mb-2">❌</div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Not Authenticated
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Please log in to test authenticated features
                    </p>
                    <PixelButton onClick={() => window.location.href = '/auth'}>
                      Go to Login
                    </PixelButton>
                  </div>
                )}
              </PixelCard>
            </div>

          </div>
        </main>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={1}
          description="Test Payment"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </>
  )
}

export default IntegrationTestPage