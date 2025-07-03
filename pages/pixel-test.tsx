import React, { useState, useEffect } from 'react'
import Head from 'next/head'

const PixelTest = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Simple counter animation
    const timer = setInterval(() => {
      setCount(c => c < 247 ? c + 1 : 247)
    }, 20)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <Head>
        <title>🎨 Pixel Art RS-CIT Platform</title>
        <meta name="description" content="Clean pixel art style learning platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="pixel-container py-16">
          <div className="text-center">
            {/* Bouncing Icon */}
            <div className="pixel-bounce mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-4xl mx-auto mb-4">
                💻
              </div>
            </div>
            
            <h1 className="pixel-title mb-6">
              Level Up Your Digital Skills
            </h1>
            
            <p className="pixel-subtitle mb-8">
              Master computer fundamentals with our modern, interactive learning platform. 
              Get RS-CIT certified with flexible EMI options and expert guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="pixel-button">
                🚀 Start Learning - ₹783/month
              </button>
              <button className="pixel-button pixel-button-outline">
                📍 Find Centers Near You
              </button>
            </div>

            {/* Stats Grid */}
            <div className="pixel-grid pixel-grid-4 mb-16">
              <div className="pixel-card text-center" style={{'--stat-color': '#6366f1'} as React.CSSProperties}>
                <div className="stat-number">{count}</div>
                <div className="stat-label">Active Learners</div>
              </div>
              <div className="pixel-card text-center" style={{'--stat-color': '#10b981'} as React.CSSProperties}>
                <div className="stat-number">15+</div>
                <div className="stat-label">Training Centers</div>
              </div>
              <div className="pixel-card text-center" style={{'--stat-color': '#f59e0b'} as React.CSSProperties}>
                <div className="stat-number">94%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="pixel-card text-center" style={{'--stat-color': '#ec4899'} as React.CSSProperties}>
                <div className="stat-number">87%</div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="pixel-container">
            <h2 className="pixel-heading mb-12">Why Choose Our Platform?</h2>
            
            <div className="pixel-grid pixel-grid-2">
              <div className="pixel-card text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto">
                  🎯
                </div>
                <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">
                  Interactive Learning
                </h3>
                <p className="pixel-text-gray-600 leading-relaxed">
                  Engaging lessons with quizzes, videos, and hands-on practice sessions 
                  that make learning computer skills fun and effective.
                </p>
              </div>
              
              <div className="pixel-card text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto">
                  🧠
                </div>
                <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">
                  AI-Powered Content
                </h3>
                <p className="pixel-text-gray-600 leading-relaxed">
                  Smart learning paths that adapt to your pace and style, with personalized 
                  recommendations to help you master concepts faster.
                </p>
              </div>
              
              <div className="pixel-card text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto">
                  ⏰
                </div>
                <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">
                  Flexible Schedule
                </h3>
                <p className="pixel-text-gray-600 leading-relaxed">
                  Learn at your own pace with 30-minute micro-lessons that fit perfectly 
                  into your busy schedule and lifestyle.
                </p>
              </div>
              
              <div className="pixel-card text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto">
                  🏆
                </div>
                <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">
                  Official Certification
                </h3>
                <p className="pixel-text-gray-600 leading-relaxed">
                  Get government-recognized RS-CIT certification that opens doors to 
                  better job opportunities and career advancement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="pixel-container">
            <h2 className="pixel-heading mb-12">Choose Your Learning Plan</h2>
            
            <div className="pixel-grid pixel-grid-3">
              <div className="pixel-card text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto">
                  ⚡
                </div>
                <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">Fast Track</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">₹1,566</div>
                <p className="pixel-text-gray-500 mb-6">per month × 3 months</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">All course materials</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Interactive quizzes</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Center practice sessions</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Official certification</span>
                  </div>
                </div>
                <button className="pixel-button w-full">Choose Plan</button>
              </div>
              
              <div className="pixel-card text-center relative transform scale-105 border-4 border-blue-500">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  ⭐ Most Popular
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto">
                  ⚖️
                </div>
                <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">Balanced</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">₹1,175</div>
                <p className="pixel-text-gray-500 mb-6">per month × 4 months</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">All course materials</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Interactive quizzes</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Center practice sessions</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Official certification</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Extra practice time</span>
                  </div>
                </div>
                <button className="pixel-button w-full">Choose Plan</button>
              </div>
              
              <div className="pixel-card text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-2xl text-white mb-4 mx-auto">
                  🛡️
                </div>
                <h3 className="text-xl font-semibold mb-4 pixel-text-gray-800">Flexible</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">₹783</div>
                <p className="pixel-text-gray-500 mb-6">per month × 6 months</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">All course materials</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Interactive quizzes</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Center practice sessions</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Official certification</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="pixel-text-gray-600">Lowest monthly payment</span>
                  </div>
                </div>
                <button className="pixel-button w-full">Choose Plan</button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="pixel-container">
            <div className="max-w-2xl mx-auto">
              <div className="pixel-card text-center">
                <div className="pixel-bounce mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl flex items-center justify-center text-4xl text-white mx-auto">
                    🎓
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-4 pixel-text-gray-800">
                  Ready to Start Your Journey?
                </h2>
                
                <p className="pixel-text-gray-600 mb-8 text-lg">
                  Join thousands of students who have already transformed their careers with RS-CIT certification.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <button className="pixel-button">
                    🚀 Get Started Today
                  </button>
                  <button className="pixel-button pixel-button-outline">
                    📞 Talk to Our Team
                  </button>
                </div>
                
                <div className="flex justify-center gap-8 text-sm pixel-text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🏆</span>
                    <span>Govt. Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>❤️</span>
                    <span>Made in India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default PixelTest