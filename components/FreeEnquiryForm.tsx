import React, { useState } from 'react'
import { PixelCard, PixelButton } from './PixelComponents'
import { createEnquiry } from '../lib/supabase-queries'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

// Free enquiry form - no external service needed
const FreeEnquiryForm: React.FC = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredCenter: '',
    courseTiming: '',
    experience: '',
    goals: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields')
        return
      }

      // Create enquiry in Supabase
      const enquiryData = {
        user_id: user?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `
Course Enquiry Details:
- Preferred Center: ${formData.preferredCenter}
- Course Timing: ${formData.courseTiming}
- Experience Level: ${formData.experience}
- Goals: ${formData.goals}
- Message: ${formData.message}
        `.trim()
      }

      await createEnquiry(enquiryData)
      
      setShowThankYou(true)
      toast.success('Enquiry submitted successfully! 🎉')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredCenter: '',
        courseTiming: '',
        experience: '',
        goals: ''
      })

    } catch (error) {
      console.error('Error submitting enquiry:', error)
      toast.error('Failed to submit enquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showThankYou) {
    return (
      <PixelCard className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Thank You for Your Interest!
          </h2>
          <p className="text-gray-400 mb-6">
            Your enquiry has been submitted successfully. Our team will contact you within 24 hours to discuss your RS-CIT course options.
          </p>
          <div className="space-y-3 mb-6">
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
              <span>Get ready to start your journey!</span>
            </div>
          </div>
          <PixelButton onClick={() => setShowThankYou(false)}>
            Submit Another Enquiry
          </PixelButton>
        </div>
      </PixelCard>
    )
  }

  return (
    <PixelCard className="overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-500 to-blue-500">
        <h2 className="text-2xl font-bold text-white mb-2">Start Your RS-CIT Journey</h2>
        <p className="text-blue-100">
          Tell us about your goals and we&apos;ll help you find the perfect course and center.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Course Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Course Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Preferred Center Location
              </label>
              <select
                name="preferredCenter"
                value={formData.preferredCenter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select preferred location</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="bangalore">Bangalore</option>
                <option value="jaipur">Jaipur</option>
                <option value="pune">Pune</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="other">Other (specify in message)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Preferred Course Timing
              </label>
              <select
                name="courseTiming"
                value={formData.courseTiming}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select timing preference</option>
                <option value="morning">Morning (9 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (2 PM - 5 PM)</option>
                <option value="evening">Evening (6 PM - 9 PM)</option>
                <option value="weekend">Weekend Only</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Computer Experience Level
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select your experience level</option>
              <option value="beginner">Beginner (No prior experience)</option>
              <option value="basic">Basic (Can use smartphone/basic computer)</option>
              <option value="intermediate">Intermediate (Some computer knowledge)</option>
              <option value="advanced">Advanced (Comfortable with computers)</option>
            </select>
          </div>
        </div>

        {/* Goals and Message */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Tell Us More</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              What are your goals with RS-CIT?
            </label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              placeholder="e.g., Get a job, improve computer skills, start a business..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Additional Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              placeholder="Any specific questions or requirements?"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <PixelButton
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Enquiry'
            )}
          </PixelButton>
        </div>
      </form>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>🔒 Your information is secure</span>
            <span>⚡ Quick 2-minute form</span>
          </div>
          <span>📞 Call us: +91-9876543210</span>
        </div>
      </div>
    </PixelCard>
  )
}

export default FreeEnquiryForm