import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Calendar, MapPin, Clock, User, Phone, Mail, CheckCircle, AlertCircle, Download, FileText, Camera, Upload } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ExamSlot {
  id: string
  date: string
  time: string
  center_id: string
  center_name: string
  center_address: string
  available_seats: number
  total_seats: number
  fees: number
}

interface UserEnrollment {
  id: string
  center_id: string
  status: string
  emi_plan: string
  enrolled_at: string
  exam_date?: string
  exam_time?: string
  exam_center?: string
}

export default function ExamRegistrationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null)
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [step, setStep] = useState(1) // 1: Check eligibility, 2: Select slot, 3: Confirm details, 4: Success
  const [error, setError] = useState('')
  const [registrationId, setRegistrationId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    category: '',
    address: '',
    id_proof_type: '',
    id_proof_number: ''
  })

  const [documents, setDocuments] = useState({
    photo: null as File | null,
    signature: null as File | null,
    id_proof: null as File | null
  })

  useEffect(() => {
    if (user) {
      checkEligibilityAndFetchData()
    }
  }, [user])

  const checkEligibilityAndFetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Check if user has active enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (enrollmentError || !enrollmentData) {
        setError('You need to enroll in a course before registering for the exam. Please visit the payment page to enroll.')
        return
      }

      setEnrollment(enrollmentData)

      // Check if already registered for exam
      if (enrollmentData.exam_date) {
        setStep(4) // Already registered
        setRegistrationId(`RSCIT${new Date().getFullYear()}${Math.random().toString().slice(2, 8)}`)
        return
      }

      // Fetch user profile data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userData) {
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          father_name: userData.father_name || '',
          mother_name: userData.mother_name || '',
          date_of_birth: userData.date_of_birth || '',
          gender: userData.gender || '',
          category: userData.category || '',
          address: userData.address || '',
          id_proof_type: '',
          id_proof_number: ''
        })
      }

      // Fetch available exam slots
      await fetchExamSlots(enrollmentData.center_id)

    } catch (error) {
      console.error('Error checking eligibility:', error)
      setError('Failed to check exam eligibility.')
    } finally {
      setLoading(false)
    }
  }

  const fetchExamSlots = async (centerId: string) => {
    try {
      // Get center details
      const { data: centerData } = await supabase
        .from('centers')
        .select('*')
        .eq('id', centerId)
        .single()

      // Mock exam slots for demonstration
      const mockSlots: ExamSlot[] = [
        {
          id: '1',
          date: '2024-03-15',
          time: '09:00 AM',
          center_id: centerId,
          center_name: centerData?.name || 'RS-CIT Center',
          center_address: centerData?.address || 'Main Market, Bharatpur',
          available_seats: 25,
          total_seats: 30,
          fees: 350
        },
        {
          id: '2',
          date: '2024-03-15',
          time: '02:00 PM',
          center_id: centerId,
          center_name: centerData?.name || 'RS-CIT Center',
          center_address: centerData?.address || 'Main Market, Bharatpur',
          available_seats: 18,
          total_seats: 30,
          fees: 350
        },
        {
          id: '3',
          date: '2024-03-22',
          time: '09:00 AM',
          center_id: centerId,
          center_name: centerData?.name || 'RS-CIT Center',
          center_address: centerData?.address || 'Main Market, Bharatpur',
          available_seats: 30,
          total_seats: 30,
          fees: 350
        },
        {
          id: '4',
          date: '2024-03-22',
          time: '02:00 PM',
          center_id: centerId,
          center_name: centerData?.name || 'RS-CIT Center',
          center_address: centerData?.address || 'Main Market, Bharatpur',
          available_seats: 22,
          total_seats: 30,
          fees: 350
        }
      ]

      setExamSlots(mockSlots)
    } catch (error) {
      console.error('Error fetching exam slots:', error)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      setDocuments({
        ...documents,
        [documentType]: file
      })
    }
  }

  const validateForm = () => {
    const required = ['name', 'phone', 'email', 'father_name', 'mother_name', 'date_of_birth', 'gender', 'category', 'address', 'id_proof_type', 'id_proof_number']
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`)
        return false
      }
    }

    // Validate documents
    if (!documents.photo) {
      setError('Please upload your photograph')
      return false
    }
    if (!documents.signature) {
      setError('Please upload your signature')
      return false
    }
    if (!documents.id_proof) {
      setError('Please upload your ID proof')
      return false
    }

    return true
  }

  const handleSubmitRegistration = async () => {
    if (!validateForm() || !selectedSlot) return

    setRegistering(true)
    try {
      const selectedSlotData = examSlots.find(slot => slot.id === selectedSlot)
      if (!selectedSlotData) throw new Error('Invalid slot selected')

      // Generate registration ID
      const newRegistrationId = `RSCIT${new Date().getFullYear()}${Math.random().toString().slice(2, 8)}`
      setRegistrationId(newRegistrationId)

      // Update enrollment with exam details
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({
          exam_date: selectedSlotData.date,
          exam_time: selectedSlotData.time,
          exam_center: selectedSlotData.center_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment?.id)

      if (enrollmentError) throw enrollmentError

      // In a real app, you would:
      // 1. Upload documents to storage
      // 2. Create exam registration record
      // 3. Process payment for exam fee
      // 4. Send confirmation email

      // Mock successful registration
      toast.success('Exam registration successful!')
      setStep(4) // Success step

      // Send notification
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: [user?.id],
          title: 'Exam Registration Successful',
          message: `You have successfully registered for RS-CIT exam on ${selectedSlotData.date} at ${selectedSlotData.time}. Registration ID: ${newRegistrationId}`,
          type: 'success'
        })
      })

    } catch (error: any) {
      console.error('Error registering for exam:', error)
      setError(error.message || 'Failed to register for exam')
      toast.error('Registration failed. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to register for exams</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-rs-blue-600 text-white rounded-lg hover:bg-rs-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rs-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam registration...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Exam Registration | RS-CIT Platform</title>
        <meta name="description" content="Register for RS-CIT certification exam" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">RS-CIT Exam Registration</h1>
                <p className="text-gray-600 mt-2">Register for your RS-CIT certification examination</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-red-700">{error}</p>
                  {error.includes('enroll') && (
                    <button
                      onClick={() => router.push('/payment')}
                      className="mt-2 text-red-600 hover:text-red-800 underline"
                    >
                      Go to Enrollment Page
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= stepNumber ? 'bg-rs-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="h-6 w-6" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step > stepNumber ? 'bg-rs-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-sm text-gray-600">
              <span>Eligibility</span>
              <span>Select Slot</span>
              <span>Upload Documents</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Step 1: Eligibility Check */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Eligibility Check</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Enrollment Verified</p>
                    <p className="text-green-700 text-sm">You are enrolled and eligible for exam registration</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600">Enrollment Date:</span>
                    <span className="ml-2 font-medium">{new Date(enrollment?.enrolled_at || '').toLocaleDateString()}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600">Payment Plan:</span>
                    <span className="ml-2 font-medium capitalize">{enrollment?.emi_plan?.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Exam fee: ₹350 (to be paid separately)</li>
                    <li>• Required documents: Photo, Signature, ID Proof</li>
                    <li>• Registration deadline: 15 days before exam</li>
                    <li>• Admit card will be available 7 days before exam</li>
                  </ul>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-rs-blue-600 text-white py-3 rounded-lg hover:bg-rs-blue-700 font-medium"
                >
                  Proceed to Slot Selection
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Slot Selection */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Exam Slot</h2>
              <div className="space-y-4">
                {examSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSlot === slot.id
                        ? 'border-rs-blue-500 bg-rs-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSlot(slot.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name="examSlot"
                          checked={selectedSlot === slot.id}
                          onChange={() => setSelectedSlot(slot.id)}
                          className="text-rs-blue-600 w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{new Date(slot.date).toLocaleDateString('en-IN', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{slot.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{slot.center_name}, {slot.center_address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg">₹{slot.fees}</div>
                        <div className={`text-sm ${
                          slot.available_seats < 5 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {slot.available_seats} seats left
                        </div>
                        <div className="text-xs text-gray-500">
                          {slot.available_seats}/{slot.total_seats} available
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedSlot}
                    className="flex-1 bg-rs-blue-600 text-white py-3 rounded-lg hover:bg-rs-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Documents
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Upload */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Details & Documents</h2>
              
              <form className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
                      <input
                        type="text"
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter father's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name *</label>
                      <input
                        type="text"
                        name="mother_name"
                        value={formData.mother_name}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter mother's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="general">General</option>
                        <option value="obc">OBC</option>
                        <option value="sc">SC</option>
                        <option value="st">ST</option>
                        <option value="ews">EWS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Type *</label>
                      <select
                        name="id_proof_type"
                        value={formData.id_proof_type}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      >
                        <option value="">Select ID Proof</option>
                        <option value="aadhar">Aadhar Card</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                        <option value="voter_id">Voter ID</option>
                        <option value="pan_card">PAN Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Number *</label>
                      <input
                        type="text"
                        name="id_proof_number"
                        value={formData.id_proof_number}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                        placeholder="Enter ID proof number"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rs-blue-500 focus:border-transparent"
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Document Upload</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photograph * <span className="text-xs text-gray-500">(Max 2MB)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'photo')}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer text-sm text-rs-blue-600 hover:text-rs-blue-700"
                        >
                          {documents.photo ? documents.photo.name : 'Upload Photo'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
                      </div>
                    </div>

                    {/* Signature Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Signature * <span className="text-xs text-gray-500">(Max 2MB)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'signature')}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label
                          htmlFor="signature-upload"
                          className="cursor-pointer text-sm text-rs-blue-600 hover:text-rs-blue-700"
                        >
                          {documents.signature ? documents.signature.name : 'Upload Signature'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
                      </div>
                    </div>

                    {/* ID Proof Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Proof * <span className="text-xs text-gray-500">(Max 2MB)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'id_proof')}
                          className="hidden"
                          id="id-proof-upload"
                        />
                        <label
                          htmlFor="id-proof-upload"
                          className="cursor-pointer text-sm text-rs-blue-600 hover:text-rs-blue-700"
                        >
                          {documents.id_proof ? documents.id_proof.name : 'Upload ID Proof'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• I certify that the information provided is true and correct.</p>
                    <p>• I understand that false information may lead to cancellation of registration.</p>
                    <p>• I agree to follow all examination guidelines and rules.</p>
                    <p>• Exam fee of ₹350 is non-refundable once paid.</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitRegistration}
                    disabled={registering}
                    className="flex-1 bg-rs-blue-600 text-white py-3 rounded-lg hover:bg-rs-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Registering...
                      </div>
                    ) : (
                      'Register for Exam'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">
                You have successfully registered for the RS-CIT examination. Your admit card will be available for download 7 days before the exam date.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Registration Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Registration ID:</span>
                    <span className="ml-2 font-medium">{registrationId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Exam Date:</span>
                    <span className="ml-2 font-medium">{enrollment?.exam_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Exam Time:</span>
                    <span className="ml-2 font-medium">{enrollment?.exam_time}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Exam Center:</span>
                    <span className="ml-2 font-medium">{enrollment?.exam_center}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
                <ul className="text-blue-800 text-sm space-y-1 text-left">
                  <li>• Keep your Registration ID safe for future reference</li>
                  <li>• Admit card will be available 7 days before exam</li>
                  <li>• Bring original ID proof on exam day</li>
                  <li>• Reach the center 30 minutes before exam time</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                >
                  Go to Dashboard
                </button>
                <button className="flex-1 bg-rs-blue-600 text-white py-3 rounded-lg hover:bg-rs-blue-700 flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}