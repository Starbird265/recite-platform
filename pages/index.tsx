import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelTitle, 
  PixelGrid,
  PixelSection
} from '@/components/ui/PixelComponents'
import toast from 'react-hot-toast'

const HomePage = () => {
  const { user } = useAuth()
  const [currentExample, setCurrentExample] = useState(0)

  // Demo pixel art examples
  const examples = [
    {
      title: "🎨 Modern Pixel Art",
      description: "Clean, professional design with smooth animations",
      demo: "✨ Beautiful Cards"
    },
    {
      title: "🚀 Interactive Components", 
      description: "Responsive buttons, icons, and layouts",
      demo: "📱 Mobile-First"
    },
    {
      title: "🌈 Rich Color Palette",
      description: "Carefully selected colors for accessibility",
      demo: "🎯 User-Friendly"
    }
  ]

  const pages = [
    {
      title: '🎨 Pixel Test',
      description: 'Basic pixel art design showcase with modern colors and animations',
      href: '/pixel-test',
      color: 'from-blue-500 to-blue-600',
      icon: '🎯',
      status: 'Ready'
    },
    {
      title: '🏠 Pixel Landing',
      description: 'Complete landing page with React components and interactive features',
      href: '/pixel-landing',
      color: 'from-purple-500 to-purple-600',
      icon: '🚀',
      status: 'Ready'
    },
    {
      title: '🎓 Student Dashboard',
      description: 'Student learning dashboard with progress tracking and achievements',
      href: '/student-dashboard',
      color: 'from-green-500 to-green-600',
      icon: '📚',
      status: 'Ready'
    },
    {
      title: '🏢 Partner Dashboard',
      description: 'Partner performance dashboard with revenue and analytics',
      href: '/partner-dashboard',
      color: 'from-orange-500 to-orange-600',
      icon: '📊',
      status: 'Ready'
    },
    {
      title: '👥 Partner Admin',
      description: 'Admin panel for managing partners and training centers',
      href: '/partner-admin',
      color: 'from-red-500 to-red-600',
      icon: '⚙️',
      status: 'Ready'
    },
    {
      title: '💳 Pixel Payment',
      description: 'Secure payment system with EMI options and multiple methods',
      href: '/pixel-payment',
      color: 'from-pink-500 to-pink-600',
      icon: '💰',
      status: 'Ready'
    },
    {
      title: '📊 Pixel Analytics',
      description: 'Comprehensive analytics dashboard with interactive charts',
      href: '/pixel-analytics',
      color: 'from-indigo-500 to-indigo-600',
      icon: '📈',
      status: 'Ready'
    }
  ]

  // Cycle through examples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleTestToast = () => {
    toast.success('🎉 Pixel art design system working perfectly!', {
      duration: 3000,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: '2px solid #ffffff40',
        backdropFilter: 'blur(16px)'
      }
    })
  }

  return (
    <>
      <Head>
        <title>🎨 RS-CIT Platform - Pixel Art Design System</title>
        <meta name="description" content="Modern pixel art design system for RS-CIT learning platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <PixelSection className="relative overflow-hidden">
          <div className="pixel-container py-16">
            <div className="text-center relative z-10">
              {/* Bouncing Icon */}
              <div className="pixel-bounce mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-2xl">
                  🎨
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold pixel-text-gray-800 mb-6">
                RS-CIT <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pixel Art</span> Platform
              </h1>
              
              <p className="text-xl pixel-text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience our modern pixel art design system with clean colors, smooth animations, 
                and professional components for the RS-CIT learning platform.
              </p>
              
              {/* Interactive Demo */}
              <div className="mb-8">
                <PixelCard className="max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{examples[currentExample].icon || '✨'}</div>
                    <h3 className="font-semibold pixel-text-gray-800 mb-2">
                      {examples[currentExample].title}
                    </h3>
                    <p className="pixel-text-gray-600 text-sm mb-4">
                      {examples[currentExample].description}
                    </p>
                    <div className="pixel-button-sm pixel-button-primary">
                      {examples[currentExample].demo}
                    </div>
                  </div>
                </PixelCard>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <PixelButton 
                  onClick={handleTestToast}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  🚀 Test Components
                </PixelButton>
                <PixelButton 
                  variant="outline" 
                  color="primary"
                  onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                >
                  📖 Explore Pages
                </PixelButton>
              </div>

              {/* Stats */}
              <PixelGrid cols={4} className="mb-16">
                <PixelCard className="text-center">
                  <div className="text-3xl font-bold pixel-text-gray-800 mb-2">7</div>
                  <div className="text-sm pixel-text-gray-500">Demo Pages</div>
                </PixelCard>
                <PixelCard className="text-center">
                  <div className="text-3xl font-bold pixel-text-gray-800 mb-2">50+</div>
                  <div className="text-sm pixel-text-gray-500">Components</div>
                </PixelCard>
                <PixelCard className="text-center">
                  <div className="text-3xl font-bold pixel-text-gray-800 mb-2">100%</div>
                  <div className="text-sm pixel-text-gray-500">Responsive</div>
                </PixelCard>
                <PixelCard className="text-center">
                  <div className="text-3xl font-bold pixel-text-gray-800 mb-2">✨</div>
                  <div className="text-sm pixel-text-gray-500">Modern</div>
                </PixelCard>
              </PixelGrid>
            </div>
          </div>
        </PixelSection>

        {/* Pages Grid */}
        <PixelSection>
          <div className="pixel-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold pixel-text-gray-800 mb-4">
                🎯 Explore Our Pages
              </h2>
              <p className="pixel-text-gray-600 text-lg max-w-2xl mx-auto">
                Each page showcases different aspects of our pixel art design system
              </p>
            </div>
            
            <PixelGrid cols={3}>
              {pages.map((page, index) => (
                <Link
                  key={index}
                  href={page.href}
                  className="group block transform transition-all duration-300 hover:scale-105"
                >
                  <PixelCard className="h-full cursor-pointer relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {page.status}
                    </div>
                    
                    <div className={`w-16 h-16 bg-gradient-to-br ${page.color} rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                      {page.icon}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 pixel-text-gray-800 text-center">
                      {page.title}
                    </h3>
                    
                    <p className="pixel-text-gray-600 text-center text-sm leading-relaxed mb-4">
                      {page.description}
                    </p>
                    
                    <div className="text-center">
                      <span className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                        Visit Page
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </PixelCard>
                </Link>
              ))}
            </PixelGrid>
          </div>
        </PixelSection>

        {/* Features Section */}
        <PixelSection className="bg-white">
          <div className="pixel-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold pixel-text-gray-800 mb-4">
                🎨 Design System Features
              </h2>
              <p className="pixel-text-gray-600 text-lg max-w-2xl mx-auto">
                Our pixel art design system combines modern aesthetics with practical functionality
              </p>
            </div>
            
            <PixelGrid cols={4}>
              <div className="text-center">
                <PixelIcon size="lg" color="primary">🎯</PixelIcon>
                <h3 className="font-semibold pixel-text-gray-800 mb-2 mt-4">Clean Design</h3>
                <p className="pixel-text-gray-600 text-sm">Modern pixel art with professional aesthetics</p>
              </div>
              
              <div className="text-center">
                <PixelIcon size="lg" color="success">📱</PixelIcon>
                <h3 className="font-semibold pixel-text-gray-800 mb-2 mt-4">Responsive</h3>
                <p className="pixel-text-gray-600 text-sm">Works perfectly on all device sizes</p>
              </div>
              
              <div className="text-center">
                <PixelIcon size="lg" color="warning">⚡</PixelIcon>
                <h3 className="font-semibold pixel-text-gray-800 mb-2 mt-4">Fast</h3>
                <p className="pixel-text-gray-600 text-sm">Optimized performance and smooth animations</p>
              </div>
              
              <div className="text-center">
                <PixelIcon size="lg" color="accent">🛡️</PixelIcon>
                <h3 className="font-semibold pixel-text-gray-800 mb-2 mt-4">Secure</h3>
                <p className="pixel-text-gray-600 text-sm">Built with security and accessibility in mind</p>
              </div>
            </PixelGrid>
          </div>
        </PixelSection>

        {/* Technology Stack */}
        <PixelSection>
          <div className="pixel-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold pixel-text-gray-800 mb-4">
                🛠️ Technology Stack
              </h2>
              <p className="pixel-text-gray-600 text-lg max-w-2xl mx-auto">
                Built with modern tools and technologies for optimal performance
              </p>
            </div>
            
            <PixelCard className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚛️</div>
                  <div className="font-semibold pixel-text-gray-800">React</div>
                  <div className="text-sm pixel-text-gray-600">Next.js 14</div>
                </div>
                
                <div className="group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎨</div>
                  <div className="font-semibold pixel-text-gray-800">Tailwind</div>
                  <div className="text-sm pixel-text-gray-600">CSS Framework</div>
                </div>
                
                <div className="group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗄️</div>
                  <div className="font-semibold pixel-text-gray-800">Supabase</div>
                  <div className="text-sm pixel-text-gray-600">Database & Auth</div>
                </div>
                
                <div className="group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                  <div className="font-semibold pixel-text-gray-800">TypeScript</div>
                  <div className="text-sm pixel-text-gray-600">Type Safety</div>
                </div>
              </div>
            </PixelCard>
          </div>
        </PixelSection>

        {/* User Authentication Section */}
        {user ? (
          <PixelSection className="bg-green-50">
            <div className="pixel-container text-center">
              <PixelCard className="max-w-md mx-auto">
                <PixelIcon size="lg" color="success">👋</PixelIcon>
                <h3 className="text-xl font-semibold pixel-text-gray-800 mb-2 mt-4">
                  Welcome back, {user.email}!
                </h3>
                <p className="pixel-text-gray-600 mb-4">
                  You're logged in and ready to explore all features
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/student-dashboard">
                    <PixelButton color="success">
                      🎓 Student Dashboard
                    </PixelButton>
                  </Link>
                  <Link href="/partner-dashboard">
                    <PixelButton variant="outline" color="success">
                      🏢 Partner Dashboard
                    </PixelButton>
                  </Link>
                </div>
              </PixelCard>
            </div>
          </PixelSection>
        ) : (
          <PixelSection className="bg-blue-50">
            <div className="pixel-container text-center">
              <PixelCard className="max-w-md mx-auto">
                <PixelIcon size="lg" color="primary">🔐</PixelIcon>
                <h3 className="text-xl font-semibold pixel-text-gray-800 mb-2 mt-4">
                  Sign In to Get Started
                </h3>
                <p className="pixel-text-gray-600 mb-4">
                  Access all features including dashboards, payments, and analytics
                </p>
                <Link href="/auth">
                  <PixelButton color="primary">
                    🚀 Sign In / Sign Up
                  </PixelButton>
                </Link>
              </PixelCard>
            </div>
          </PixelSection>
        )}

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
          <div className="pixel-container py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                  🎨
                </div>
                <span className="font-bold text-xl">RS-CIT Pixel Platform</span>
              </div>
              <p className="text-gray-400 mb-6 text-lg">
                Modern pixel art design system for educational platforms
              </p>
              <div className="flex justify-center gap-8 text-gray-400 mb-6">
                <span className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Secure</span>
                </span>
                <span className="flex items-center gap-2">
                  <span>🏆</span>
                  <span>Government Certified</span>
                </span>
                <span className="flex items-center gap-2">
                  <span>❤️</span>
                  <span>Made in India</span>
                </span>
              </div>
              <div className="border-t border-gray-700 pt-6">
                <p className="text-gray-500 text-sm">
                  © 2024 RS-CIT Platform. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default HomePage