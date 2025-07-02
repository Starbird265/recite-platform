import { useState } from 'react'
import { BookOpen, Clock, MapPin, Users, Award, Star, ArrowRight, Check } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  })

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault()
    // Generate enquiry ID and proceed to signup
    const enquiryId = `ENQ${Date.now()}`
    localStorage.setItem('enquiryId', enquiryId)
    localStorage.setItem('enquiryData', JSON.stringify(enquiryForm))
    onGetStarted()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Master RS-CIT with AI-Powered Learning
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Join 10,000+ students who cleared RS-CIT with our 30-minute daily micro-lessons, 
              flexible EMIs, and trusted local center network across Rajasthan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="bg-white text-rs-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Start Learning Now <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-sm opacity-75">
                ✨ Free enquiry • No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RS-CIT Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-rs-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-rs-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">30-Min Daily Lessons</h3>
              <p className="text-gray-600">
                AI-curated micro-lessons that fit your schedule. Complete your daily target in just 30 minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-rs-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-rs-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">200+ Local Centers</h3>
              <p className="text-gray-600">
                Find and book your nearest ITGK center with one click. All centers are pre-verified and trusted.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible EMI Plans</h3>
              <p className="text-gray-600">
                Pay in 3, 4, or 6 installments. Starting from ₹783/month. No hidden charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-rs-blue-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Complete RS-CIT Package</h3>
                <div className="text-4xl font-bold text-rs-blue-600 mb-2">₹4,699</div>
                <p className="text-gray-600">Everything you need to clear RS-CIT</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold mb-4">What's Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>132 hours of expert instruction</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>AI-powered daily micro-lessons</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Adaptive quizzes & assessments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Official exam registration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>24×7 doubt resolution</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Flexible EMI Options:</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span>3 months</span>
                      <span className="font-semibold">₹1,566/month</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span>4 months</span>
                      <span className="font-semibold">₹1,175/month</span>
                    </div>
                    <div className="flex justify-between p-3 bg-rs-blue-50 rounded-lg border border-rs-blue-200">
                      <span>6 months</span>
                      <span className="font-semibold text-rs-blue-600">₹783/month</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={onGetStarted}
                  className="bg-rs-blue-600 hover:bg-rs-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Enquiry Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Get Your Free Enquiry ID</h2>
            <form onSubmit={handleEnquiry} className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({...enquiryForm, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({...enquiryForm, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({...enquiryForm, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <select
                    required
                    value={enquiryForm.city}
                    onChange={(e) => setEnquiryForm({...enquiryForm, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your city</option>
                    <option value="jaipur">Jaipur</option>
                    <option value="jodhpur">Jodhpur</option>
                    <option value="udaipur">Udaipur</option>
                    <option value="kota">Kota</option>
                    <option value="ajmer">Ajmer</option>
                    <option value="bharatpur">Bharatpur</option>
                    <option value="bikaner">Bikaner</option>
                    <option value="alwar">Alwar</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-rs-blue-600 hover:bg-rs-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Get Free Enquiry ID
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">RS-CIT Platform</h3>
              <p className="text-gray-300">
                Democratizing IT certification through AI-powered learning and trusted local centers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>About Us</li>
                <li>Courses</li>
                <li>Centers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Help Center</li>
                <li>Study Materials</li>
                <li>Practice Tests</li>
                <li>FAQs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="text-gray-300 space-y-2">
                <p>📧 support@rscit-platform.com</p>
                <p>📞 +91-XXXX-XXXXXX</p>
                <p>📍 Jaipur, Rajasthan</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 RS-CIT Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}