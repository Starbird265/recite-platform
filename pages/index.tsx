import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PixelCard, PixelButton, PixelTitle, PixelGrid } from '../components/PixelComponents'
import FreeMapComponent from '../components/FreeMapComponent'
import FreeEnquiryForm from '../components/FreeEnquiryForm'
import VideoPlayer from '../components/VideoPlayer'
import { getSampleCourseVideos, getYouTubeThumbnails } from '../utils/youtube-free'
import { getCurrentLocationFree } from '../utils/maps-alternatives'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const HomePage = () => {
  const { user } = useAuth()
  const [todaysLesson, setTodaysLesson] = useState(getSampleCourseVideos()[0])
  const [stats, setStats] = useState({
    totalStudents: 2847,
    activeCenters: 156,
    successRate: 94,
    averageScore: 87
  })
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    // Get user location for personalized experience
    getCurrentLocationFree().then(setUserLocation).catch(() => {})
    
    // Animate stats on load
    const timer = setTimeout(() => {
      setStats(prev => ({
        totalStudents: prev.totalStudents + Math.floor(Math.random() * 10),
        activeCenters: prev.activeCenters,
        successRate: prev.successRate,
        averageScore: prev.averageScore
      }))
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard'
    } else {
      setShowEnquiryForm(true)
    }
  }

  const handleWatchFreeLesson = () => {
    const element = document.getElementById('free-lesson')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Head>
        <title>RS-CIT Platform - Learn Computer Skills, Get Certified, Find Jobs</title>
        <meta name="description" content="Master computer skills with RS-CIT certification. Find nearby centers, watch free lessons, and boost your career prospects. 94% success rate!" />
        <meta name="keywords" content="RS-CIT, computer course, certification, job training, Excel, Word, PowerPoint" />
        <meta property="og:title" content="RS-CIT Platform - Computer Skills That Get You Jobs" />
        <meta property="og:description" content="Join 2,847+ students who learned computer skills and got certified. Find your nearest center and start today!" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Navigation */}
        <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎓</span>
                <span className="text-xl font-bold text-white">RS-CIT Platform</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#courses" className="text-gray-300 hover:text-white transition-colors">Courses</a>
                <a href="#centers" className="text-gray-300 hover:text-white transition-colors">Find Centers</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Success Stories</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              </div>

              <div className="flex items-center space-x-3">
                {user ? (
                  <Link href="/dashboard">
                    <PixelButton size="sm">Dashboard</PixelButton>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth">
                      <PixelButton variant="outline" size="sm">Login</PixelButton>
                    </Link>
                    <PixelButton onClick={handleGetStarted} size="sm">
                      Get Started
                    </PixelButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-green-900/30 border border-green-700 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-300 text-sm">🔥 Live enrollment open</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Master Computer Skills.
                  <span className="text-cyan-400"> Get Certified.</span>
                  <span className="text-green-400"> Find Jobs.</span>
                </h1>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Join 2,847+ students who learned MS Office, Internet, and essential computer skills. 
                  Get RS-CIT certified and boost your career prospects with 94% success rate.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <PixelButton onClick={handleGetStarted} className="text-lg px-8 py-3">
                    🚀 Start Free Trial
                  </PixelButton>
                  <PixelButton 
                    variant="outline" 
                    onClick={handleWatchFreeLesson}
                    className="text-lg px-8 py-3"
                  >
                    📺 Watch Free Lesson
                  </PixelButton>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span>4.8/5 rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🎯</span>
                    <span>94% success rate</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🏆</span>
                    <span>Government certified</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <PixelCard className="overflow-hidden">
                  <img
                    src={todaysLesson.thumbnail}
                    alt="RS-CIT Course Preview"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PixelButton onClick={handleWatchFreeLesson} className="text-lg">
                      ▶️ Watch Free Lesson
                    </PixelButton>
                  </div>
                </PixelCard>

                {/* Floating Stats */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 shadow-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Students Enrolled</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PixelGrid cols={4} className="gap-6">
              <PixelCard className="p-6 text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {stats.totalStudents.toLocaleString()}+
                </div>
                <div className="text-gray-300">Students Trained</div>
              </PixelCard>
              
              <PixelCard className="p-6 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {stats.activeCenters}+
                </div>
                <div className="text-gray-300">Active Centers</div>
              </PixelCard>
              
              <PixelCard className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {stats.successRate}%
                </div>
                <div className="text-gray-300">Success Rate</div>
              </PixelCard>
              
              <PixelCard className="p-6 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {stats.averageScore}%
                </div>
                <div className="text-gray-300">Average Score</div>
              </PixelCard>
            </PixelGrid>
          </div>
        </section>

        {/* Today's Free Lesson */}
        <section id="free-lesson" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎯 Today&apos;s Free Lesson
              </h2>
              <p className="text-xl text-gray-400">
                Get a taste of our premium content - no registration required!
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <VideoPlayer
                videoId={todaysLesson.videoId}
                title={todaysLesson.title}
                description={todaysLesson.description}
                onVideoEnd={() => {
                  toast.success('🎉 Lesson completed! Ready for the full course?')
                  setTimeout(() => setShowEnquiryForm(true), 2000)
                }}
              />
            </div>
          </div>
        </section>

        {/* Course Modules */}
        <section id="courses" className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎓 Complete RS-CIT Course
              </h2>
              <p className="text-xl text-gray-400">
                Master all essential computer skills with our comprehensive curriculum
              </p>
            </div>

            <PixelGrid cols={3} className="gap-6">
              <PixelCard className="p-6">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-bold text-white mb-3">Computer Fundamentals</h3>
                <p className="text-gray-400 mb-4">
                  Learn basic computer operations, hardware, software, and operating systems.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Computer basics & terminology</li>
                  <li>• Windows operation</li>
                  <li>• File management</li>
                  <li>• Hardware components</li>
                </ul>
              </PixelCard>

              <PixelCard className="p-6">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-3">MS Office Suite</h3>
                <p className="text-gray-400 mb-4">
                  Master Word, Excel, PowerPoint - the essential tools for any office job.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• MS Word - Documents & formatting</li>
                  <li>• MS Excel - Spreadsheets & formulas</li>
                  <li>• MS PowerPoint - Presentations</li>
                  <li>• Practical projects</li>
                </ul>
              </PixelCard>

              <PixelCard className="p-6">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-bold text-white mb-3">Internet & Email</h3>
                <p className="text-gray-400 mb-4">
                  Navigate the web safely and communicate professionally online.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Web browsing & search</li>
                  <li>• Email setup & management</li>
                  <li>• Online safety & security</li>
                  <li>• Digital payments</li>
                </ul>
              </PixelCard>
            </PixelGrid>
          </div>
        </section>

        {/* Find Centers */}
        <section id="centers" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                📍 Find Your Nearest Center
              </h2>
              <p className="text-xl text-gray-400">
                Learn at a center near you with experienced instructors and hands-on practice
              </p>
            </div>

            <FreeMapComponent />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                💰 Affordable Pricing
              </h2>
              <p className="text-xl text-gray-400">
                Quality education at prices that won&apos;t break the bank
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <PixelGrid cols={2} className="gap-8">
                <PixelCard className="p-8 relative">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Basic Course</h3>
                    <div className="text-4xl font-bold text-cyan-400 mb-2">₹2,500</div>
                    <div className="text-gray-400 mb-6">One-time payment</div>
                    
                    <ul className="text-left space-y-3 mb-8">
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Complete RS-CIT curriculum</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Hands-on practice sessions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Certificate upon completion</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Job placement assistance</span>
                      </li>
                    </ul>
                    
                    <PixelButton onClick={handleGetStarted} className="w-full">
                      Enroll Now
                    </PixelButton>
                  </div>
                </PixelCard>

                <PixelCard className="p-8 relative border-2 border-cyan-500">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">EMI Option</h3>
                    <div className="text-4xl font-bold text-green-400 mb-2">₹625</div>
                    <div className="text-gray-400 mb-6">Per month × 4 months</div>
                    
                    <ul className="text-left space-y-3 mb-8">
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Everything in Basic Course</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Flexible payment schedule</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Extended support period</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Free revision classes</span>
                      </li>
                    </ul>
                    
                    <PixelButton onClick={handleGetStarted} className="w-full">
                      Start with EMI
                    </PixelButton>
                  </div>
                </PixelCard>
              </PixelGrid>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-cyan-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students who&apos;ve already boosted their careers with RS-CIT certification
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PixelButton 
                onClick={handleGetStarted} 
                className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
              >
                🚀 Start Your Journey Today
              </PixelButton>
              <PixelButton 
                variant="outline" 
                onClick={() => setShowEnquiryForm(true)}
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600"
              >
                📞 Talk to Our Team
              </PixelButton>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">🎓</span>
                  <span className="text-xl font-bold text-white">RS-CIT Platform</span>
                </div>
                <p className="text-gray-400">
                  Empowering students with essential computer skills for a digital future.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#courses" className="hover:text-white">Courses</a></li>
                  <li><a href="#centers" className="hover:text-white">Find Centers</a></li>
                  <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                  <li><Link href="/auth" className="hover:text-white">Login</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>📞 +91-9876543210</li>
                  <li>📧 info@rscit-platform.com</li>
                  <li>💬 Live Chat Support</li>
                  <li>🕒 Mon-Fri 9AM-6PM</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <span className="text-2xl cursor-pointer hover:text-blue-400">📘</span>
                  <span className="text-2xl cursor-pointer hover:text-blue-400">🐦</span>
                  <span className="text-2xl cursor-pointer hover:text-red-400">📺</span>
                  <span className="text-2xl cursor-pointer hover:text-green-400">📱</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 RS-CIT Platform. All rights reserved. Made with ❤️ for students.</p>
            </div>
          </div>
        </footer>

        {/* Enquiry Form Modal */}
        {showEnquiryForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <button
                  onClick={() => setShowEnquiryForm(false)}
                  className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/20 rounded-full p-2"
                >
                  ✕
                </button>
                <FreeEnquiryForm />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default HomePage