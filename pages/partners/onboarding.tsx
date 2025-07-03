import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { MapPin, Phone, Mail, User, Building, CreditCard, CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CenterFormData {
  name: string
  owner_name: string
  owner_phone: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
  latitude?: number
  longitude?: number
  fees: number
  capacity: number
  established_year: string
  registration_number: string
  website?: string
  description: string
}

export default function PartnerOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CenterFormData>({
    name: '',
    owner_name: '',
    owner_phone: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    fees: 4699,
    capacity: 50,
    established_year: '',
    registration_number: '',
    website: '',
    description: ''
  })

  const [documents, setDocuments] = useState({
    registration_certificate: null as File | null,
    owner_id_proof: null as File | null,
    center_photos: [] as File[]
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files
    if (!files) return

    if (type === 'center_photos') {
      const newPhotos = Array.from(files)
      setDocuments(prev => ({
        ...prev,
        center_photos: [...prev.center_photos, ...newPhotos]
      }))
    } else {
      const file = files[0]
      setDocuments(prev => ({
        ...prev,
        [type]: file
      }))
    }
  }

  const validateStep = (stepNumber: number) => {
    setError('')
    
    switch (stepNumber) {
      case 1:
        if (!formData.name || !formData.owner_name || !formData.email || !formData.phone) {
          setError('Please fill in all required basic information fields')
          return false
        }
        break
      case 2:
        if (!formData.address || !formData.city || !formData.pincode) {
          setError('Please fill in all address information')
          return false
        }
        break
      case 3:
        if (!formData.registration_number || !formData.established_year) {
          setError('Please provide registration details')
          return false
        }
        if (!documents.registration_certificate || !documents.owner_id_proof) {
          setError('Please upload required documents')
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const submitApplication = async () => {
    if (!validateStep(step)) return

    setLoading(true)
    try {
      // In a real app, you would upload documents first
      // For demo, we'll just create the center record

      const { data, error } = await supabase
        .from('centers')
        .insert([{
          name: formData.name,
          owner_name: formData.owner_name,
          owner_phone: formData.owner_phone,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city.toLowerCase(),
          pincode: formData.pincode,
          latitude: formData.latitude,
          longitude: formData.longitude,
          fees: formData.fees,
          capacity: formData.capacity,
          established_year: parseInt(formData.established_year),
          registration_number: formData.registration_number,
          website: formData.website,
          description: formData.description,
          verified: false, // Requires admin approval
          rating: 0.0,
          referral_code: `${formData.city.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (error) throw error

      setSuccess(true)
      toast.success('Application submitted successfully!')
      
      // Send notification to admin
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send_to_all: false,
          user_ids: ['admin'], // In real app, get admin user IDs
          title: 'New Partner Application',
          message: `New center application from ${formData.name} in ${formData.city}`,
          type: 'info'
        })
      })

    } catch (error: any) {
      console.error('Error submitting application:', error)
      setError('Failed to submit application. Please try again.')
      toast.error('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow p-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in becoming an RS-CIT partner. Your application is under review and you will be contacted within 2-3 business days.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-rs-blue-600 text-white py-3 rounded-lg hover:bg-rs-blue-700"
            >
              Back to Home
            </button>
            <button
              onClick={() => router.push('/partners/dashboard')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
            >
              Partner Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Partner Onboarding | RS-CIT Platform</title>
        <meta name="description" content="Join the RS-CIT network as a training partner" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Become an RS-CIT Partner</h1>
              <p className="text-gray-600 mt-2">Join our network and help students achieve their digital literacy goals</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= stepNumber ? 'bg-rs-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="h-6 w-6" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-rs-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-3 text-sm text-gray-600 space-x-12">
              <span>Basic Info</span>
              <span>Location</span>
              <span>Documents</span>
              <span>Review</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Center Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="e.g., ABC Computer Center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        name="owner_name"
                        value={formData.owner_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter owner's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="center@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="10-digit phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Owner Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="owner_phone"
                        value={formData.owner_phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Owner's phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Center Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      placeholder="Describe your center, facilities, and experience..."
                    />
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={nextStep}
                      className="px-6 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Location Details */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complete Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter complete address with landmarks"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      >
                        <option value="">Select City</option>
                        <option value="jaipur">Jaipur</option>
                        <option value="jodhpur">Jodhpur</option>
                        <option value="udaipur">Udaipur</option>
                        <option value="kota">Kota</option>
                        <option value="ajmer">Ajmer</option>
                        <option value="bharatpur">Bharatpur</option>
                        <option value="bikaner">Bikaner</option>
                        <option value="alwar">Alwar</option>
                        <option value="sikar">Sikar</option>
                        <option value="pali">Pali</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="6-digit pincode"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Fees (₹)
                      </label>
                      <input
                        type="number"
                        name="fees"
                        value={formData.fees}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Course fees in rupees"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Maximum students per batch"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={prevStep}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextStep}
                      className="px-6 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents & Verification</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Established Year *
                      </label>
                      <input
                        type="number"
                        name="established_year"
                        value={formData.established_year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="e.g., 2020"
                        min="1990"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Business/Shop registration number"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Certificate * <span className="text-xs text-gray-500">(PDF/Image, Max 5MB)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'registration_certificate')}
                          className="hidden"
                          id="registration-upload"
                        />
                        <label
                          htmlFor="registration-upload"
                          className="cursor-pointer text-rs-blue-600 hover:text-rs-blue-700"
                        >
                          {documents.registration_certificate 
                            ? documents.registration_certificate.name 
                            : 'Upload Registration Certificate'
                          }
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Business license, Shop & Establishment license, or similar</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Owner ID Proof * <span className="text-xs text-gray-500">(Image, Max 2MB)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'owner_id_proof')}
                          className="hidden"
                          id="id-proof-upload"
                        />
                        <label
                          htmlFor="id-proof-upload"
                          className="cursor-pointer text-rs-blue-600 hover:text-rs-blue-700"
                        >
                          {documents.owner_id_proof 
                            ? documents.owner_id_proof.name 
                            : 'Upload Owner ID Proof'
                          }
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Aadhar Card, Passport, or Driving License</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Center Photos (Optional) <span className="text-xs text-gray-500">(Images, Max 2MB each)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileChange(e, 'center_photos')}
                          className="hidden"
                          id="photos-upload"
                        />
                        <label
                          htmlFor="photos-upload"
                          className="cursor-pointer text-rs-blue-600 hover:text-rs-blue-700"
                        >
                          Upload Center Photos ({documents.center_photos.length} selected)
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Photos of your center, computer lab, facilities</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={prevStep}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextStep}
                      className="px-6 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
                    >
                      Review Application
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Submit</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Center Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-600">Center Name:</span> <span className="font-medium">{formData.name}</span></div>
                        <div><span className="text-gray-600">Owner:</span> <span className="font-medium">{formData.owner_name}</span></div>
                        <div><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></div>
                        <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{formData.phone}</span></div>
                        <div><span className="text-gray-600">City:</span> <span className="font-medium capitalize">{formData.city}</span></div>
                        <div><span className="text-gray-600">Fees:</span> <span className="font-medium">₹{formData.fees}</span></div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-4">Partner Benefits</h3>
                      <ul className="text-blue-800 text-sm space-y-2">
                        <li>• ₹350 commission per student enrollment</li>
                        <li>• Completion bonus for students who finish the course</li>
                        <li>• Marketing support and promotional materials</li>
                        <li>• Access to our online learning platform</li>
                        <li>• Regular training and support sessions</li>
                        <li>• Performance-based incentives</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-4">Terms & Conditions</h3>
                      <div className="text-yellow-800 text-sm space-y-2">
                        <p>• All information provided must be accurate and verifiable</p>
                        <p>• Center must maintain quality standards as per RS-CIT guidelines</p>
                        <p>• Partnership agreement will be signed upon approval</p>
                        <p>• Commission payments will be processed monthly</p>
                        <p>• Either party can terminate the partnership with 30 days notice</p>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" required />
                          <span className="text-sm text-yellow-800">
                            I agree to the terms and conditions and confirm that all information provided is accurate
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={prevStep}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={submitApplication}
                      disabled={loading}
                      className="px-6 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}