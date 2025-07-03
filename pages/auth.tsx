import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelSection 
} from '@/components/ui/PixelComponents'
import toast from 'react-hot-toast'

const AuthPage = () => {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    city: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        toast.success('✅ Login successful!')
        router.push('/')
      } else {
        // Register
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        if (data.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: formData.email,
                name: formData.name,
                phone: formData.phone || null,
                city: formData.city || null,
              }
            ])

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }
        }

        toast.success('🎉 Registration successful!')
        router.push('/')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      // Demo login with predefined credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@rscit.com',
        password: 'demo123456',
      })

      if (error) {
        // If demo user doesn't exist, create one
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'demo@rscit.com',
          password: 'demo123456',
        })

        if (signUpError) throw signUpError

        if (signUpData.user) {
          await supabase
            .from('users')
            .insert([
              {
                id: signUpData.user.id,
                email: 'demo@rscit.com',
                name: 'Demo User',
                phone: '+91 98765 43210',
                city: 'Jaipur',
              }
            ])
        }
      }

      toast.success('🎯 Demo login successful!')
      router.push('/')
    } catch (error: any) {
      console.error('Demo login error:', error)
      toast.error('Demo login failed. Please try manual login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>🔐 Sign In | RS-CIT Platform</title>
        <meta name="description" content="Sign in to your RS-CIT learning account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <PixelSection className="w-full max-w-md">
          <PixelCard>
            <div className="text-center mb-8">
              <PixelIcon size="lg" color="primary">🎨</PixelIcon>
              <h1 className="text-2xl font-bold pixel-text-gray-800 mt-4 mb-2">
                {isLogin ? 'Welcome Back!' : 'Join RS-CIT'}
              </h1>
              <p className="pixel-text-gray-600">
                {isLogin ? 'Sign in to continue your learning journey' : 'Create your account to get started'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your city"
                    />
                  </div>
                </>
              )}

              <PixelButton
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? '⏳ Processing...' : isLogin ? '🚀 Sign In' : '🎉 Create Account'}
              </PixelButton>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <PixelButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                🎯 Try Demo Login
              </PixelButton>
              <p className="text-xs pixel-text-gray-500 text-center mt-2">
                Use demo account to explore all features
              </p>
            </div>
          </PixelCard>
        </PixelSection>
      </div>
    </>
  )
}

export default AuthPage