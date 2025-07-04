import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { 
  PixelCard, 
  PixelButton, 
  PixelInput,
  PixelTitle,
  PixelSection
} from '../components/PixelComponents'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthPage = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const { signInWithOtp, verifyOtp } = useAuth()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      await signInWithOtp(email)

      setIsOtpSent(true)
      setResendTimer(60) // 60 second countdown
      toast.success('OTP sent to your email!')
    } catch (error: any) {
      console.error('OTP send error:', error)
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    setIsLoading(true)
    try {
      await verifyOtp(email, otp)

      toast.success('Successfully logged in!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('OTP verification error:', error)
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    
    setIsLoading(true)
    try {
      await signInWithOtp(email)

      setResendTimer(60)
      toast.success('OTP resent to your email!')
    } catch (error: any) {
      console.error('OTP resend error:', error)
      toast.error(error.message || 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign In - RS-CIT Platform</title>
        <meta name="description" content="Sign in to access your RS-CIT learning dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <PixelSection className="text-center mb-8">
            <PixelTitle className="text-white mb-2">
              🎓 RS-CIT Platform
            </PixelTitle>
            <p className="text-gray-400">
              {isOtpSent ? 'Enter the OTP sent to your email' : 'Sign in to continue learning'}
            </p>
          </PixelSection>

          <PixelCard className="p-6">
            {!isOtpSent ? (
              // Email Input Form
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <PixelInput
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dark
                    className="w-full"
                    required
                  />
                </div>

                <PixelButton 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </PixelButton>
              </form>
            ) : (
              // OTP Verification Form
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter OTP
                  </label>
                  <PixelInput
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    dark
                    className="w-full text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    OTP sent to: {email}
                  </p>
                </div>

                <PixelButton 
                  type="submit" 
                  className="w-full mb-3" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </PixelButton>

                <div className="flex justify-between items-center">
                  <PixelButton 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsOtpSent(false)}
                    disabled={isLoading}
                  >
                    Change Email
                  </PixelButton>

                  <PixelButton 
                    variant="outline" 
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendTimer > 0}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </PixelButton>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-cyan-400 hover:text-cyan-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-cyan-400 hover:text-cyan-300">
                  Privacy Policy
                </a>
              </p>
            </div>
          </PixelCard>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Need help?{' '}
              <a href="mailto:support@rscit.tech" className="text-cyan-400 hover:text-cyan-300">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthPage