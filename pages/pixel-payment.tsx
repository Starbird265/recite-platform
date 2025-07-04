import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { 
  PixelCard, 
  PixelButton, 
  PixelIcon, 
  PixelSection, 
  PixelGrid 
} from '../components/PixelComponents'

interface PaymentPlan {
  id: string
  name: string
  totalAmount: number
  months: number
  monthlyAmount: number
  processingFee: number
  savings: number
  features: string[]
  popular: boolean
  color: 'primary' | 'success' | 'warning' | 'danger'
  icon: string
}

interface PaymentMethod {
  id: string
  name: string
  type: 'upi' | 'card' | 'netbanking' | 'wallet'
  icon: string
  processingFee: number
  instantPayment: boolean
}

const PixelPayment = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'plans' | 'method' | 'details' | 'processing'>('plans')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'fast',
      name: 'Fast Track',
      totalAmount: 4698,
      months: 3,
      monthlyAmount: 1566,
      processingFee: 150,
      savings: 0,
      features: [
        'Complete RS-CIT Course',
        'Interactive Video Lessons',
        'Practice Lab Access',
        'Mock Tests & Quizzes',
        'Official Certification',
        'Expert Support'
      ],
      popular: false,
      color: 'danger',
      icon: '⚡'
    },
    {
      id: 'balanced',
      name: 'Balanced Plan',
      totalAmount: 4700,
      months: 4,
      monthlyAmount: 1175,
      processingFee: 120,
      savings: 298,
      features: [
        'Complete RS-CIT Course',
        'Interactive Video Lessons',
        'Practice Lab Access',
        'Mock Tests & Quizzes',
        'Official Certification',
        'Expert Support',
        'Extra Practice Time',
        'Doubt Clearing Sessions'
      ],
      popular: true,
      color: 'primary',
      icon: '⚖️'
    },
    {
      id: 'flexible',
      name: 'Flexible Plan',
      totalAmount: 4698,
      months: 6,
      monthlyAmount: 783,
      processingFee: 100,
      savings: 500,
      features: [
        'Complete RS-CIT Course',
        'Interactive Video Lessons',
        'Practice Lab Access',
        'Mock Tests & Quizzes',
        'Official Certification',
        'Expert Support',
        'Extended Access (12 months)',
        'Personalized Learning Path',
        'Career Guidance'
      ],
      popular: false,
      color: 'success',
      icon: '🛡️'
    }
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      type: 'upi',
      icon: '📱',
      processingFee: 0,
      instantPayment: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: '💳',
      processingFee: 25,
      instantPayment: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      type: 'netbanking',
      icon: '🏦',
      processingFee: 15,
      instantPayment: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      type: 'wallet',
      icon: '💰',
      processingFee: 10,
      instantPayment: true
    }
  ]

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.user_metadata?.name || ''
      }))
    }
  }, [user])

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan)
    setPaymentStep('method')
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setPaymentStep('details')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return

    setLoading(true)
    setPaymentStep('processing')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Payment successful! Welcome to RS-CIT! 🎉')
      router.push('/student-dashboard')
    } catch (error) {
      console.error('Payment failed:', error)
      toast.error('Payment failed. Please try again.')
      setPaymentStep('details')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedPlan || !selectedMethod) return 0
    return selectedPlan.monthlyAmount + selectedMethod.processingFee
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCard className="text-center">
          <PixelIcon color="accent">🔒</PixelIcon>
          <h2 className="text-xl font-semibold mb-4">Please Log In</h2>
          <p className="pixel-text-gray-600 mb-6">Login to proceed with payment</p>
          <PixelButton onClick={() => router.push('/auth')}>
            Login to Continue
          </PixelButton>
        </PixelCard>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>💳 Secure Payment - RS-CIT Course</title>
        <meta name="description" content="Choose your payment plan and complete enrollment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200">
          <div className="pixel-container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <PixelIcon size="sm" color="success">💳</PixelIcon>
                <div>
                  <h1 className="text-2xl font-bold pixel-text-gray-800">Secure Payment</h1>
                  <p className="pixel-text-gray-500">Complete your RS-CIT course enrollment</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <PixelIcon size="sm" color="success">🔒</PixelIcon>
                  <span className="text-sm pixel-text-gray-600">256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="pixel-container">
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-8">
                <div className={`flex items-center gap-2 ${paymentStep === 'plans' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    paymentStep === 'plans' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="font-medium">Choose Plan</span>
                </div>
                
                <div className={`w-8 h-px ${paymentStep !== 'plans' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                
                <div className={`flex items-center gap-2 ${paymentStep === 'method' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    paymentStep === 'method' ? 'bg-blue-600 text-white' : 
                    ['details', 'processing'].includes(paymentStep) ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="font-medium">Payment Method</span>
                </div>
                
                <div className={`w-8 h-px ${['details', 'processing'].includes(paymentStep) ? 'bg-blue-600' : 'bg-gray-300'}`} />
                
                <div className={`flex items-center gap-2 ${['details', 'processing'].includes(paymentStep) ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    ['details', 'processing'].includes(paymentStep) ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    3
                  </div>
                  <span className="font-medium">Complete Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="pixel-container py-8">
          {/* Step 1: Choose Plan */}
          {paymentStep === 'plans' && (
            <PixelSection>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold pixel-text-gray-800 mb-4">Choose Your Learning Plan</h2>
                <p className="pixel-text-gray-600">Select the plan that best fits your schedule and budget</p>
              </div>
              
              <PixelGrid cols={3}>
                {paymentPlans.map((plan) => (
                  <PixelCard 
                    key={plan.id} 
                    className={`text-center cursor-pointer transition-transform relative ${
                      plan.popular ? 'transform scale-105 border-4 border-blue-500' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        ⭐ Most Popular
                      </div>
                    )}
                    
                    <PixelIcon size="md" color={plan.color}>
                      {plan.icon}
                    </PixelIcon>
                    
                    <h3 className="text-xl font-semibold mb-2 pixel-text-gray-800">{plan.name}</h3>
                    
                    <div className="text-3xl font-bold text-blue-600 mb-1">₹{plan.monthlyAmount}</div>
                    <p className="pixel-text-gray-500 mb-2">per month × {plan.months} months</p>
                    
                    {plan.savings > 0 && (
                      <div className="text-green-600 font-semibold text-sm mb-4">
                        💰 Save ₹{plan.savings}
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span className="pixel-text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <PixelButton color={plan.color} className="w-full">
                      Select Plan
                    </PixelButton>
                  </PixelCard>
                ))}
              </PixelGrid>
            </PixelSection>
          )}

          {/* Step 2: Payment Method */}
          {paymentStep === 'method' && selectedPlan && (
            <div className="max-w-4xl mx-auto">
              <PixelSection>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold pixel-text-gray-800 mb-4">Choose Payment Method</h2>
                  <p className="pixel-text-gray-600">Select how you want to pay for your course</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 pixel-text-gray-800">Payment Options</h3>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <PixelCard 
                          key={method.id}
                          className={`cursor-pointer transition-all ${
                            selectedMethod?.id === method.id ? 'border-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => handleMethodSelect(method)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{method.icon}</div>
                              <div>
                                <div className="font-semibold pixel-text-gray-800">{method.name}</div>
                                <div className="text-sm pixel-text-gray-600">
                                  {method.instantPayment ? '⚡ Instant' : '⏱️ 2-3 days'}
                                  {method.processingFee > 0 && ` • +₹${method.processingFee} fee`}
                                </div>
                              </div>
                            </div>
                            {selectedMethod?.id === method.id && (
                              <div className="text-blue-600 text-xl">✓</div>
                            )}
                          </div>
                        </PixelCard>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 pixel-text-gray-800">Order Summary</h3>
                    <PixelCard>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <PixelIcon size="sm" color={selectedPlan.color}>
                            {selectedPlan.icon}
                          </PixelIcon>
                          <div>
                            <div className="font-semibold pixel-text-gray-800">{selectedPlan.name}</div>
                            <div className="text-sm pixel-text-gray-600">
                              {selectedPlan.months} month plan
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between mb-2">
                            <span className="pixel-text-gray-600">Monthly Amount</span>
                            <span className="font-semibold">₹{selectedPlan.monthlyAmount}</span>
                          </div>
                          {selectedMethod && selectedMethod.processingFee > 0 && (
                            <div className="flex justify-between mb-2">
                              <span className="pixel-text-gray-600">Processing Fee</span>
                              <span className="font-semibold">₹{selectedMethod.processingFee}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total Amount</span>
                            <span className="text-blue-600">₹{calculateTotal()}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm pixel-text-gray-500 text-center">
                          🔒 Your payment is secured with 256-bit SSL encryption
                        </div>
                      </div>
                    </PixelCard>
                  </div>
                </div>
              </PixelSection>
            </div>
          )}

          {/* Step 3: Payment Details */}
          {paymentStep === 'details' && selectedPlan && selectedMethod && (
            <div className="max-w-4xl mx-auto">
              <PixelSection>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold pixel-text-gray-800 mb-4">Complete Payment</h2>
                  <p className="pixel-text-gray-600">Enter your details to complete the payment</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 pixel-text-gray-800">Personal Information</h3>
                    <PixelCard>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </PixelCard>
                    
                    {/* Payment Method Specific Fields */}
                    {selectedMethod.type === 'upi' && (
                      <PixelCard className="mt-6">
                        <h4 className="font-semibold mb-4 pixel-text-gray-800">UPI Details</h4>
                        <div>
                          <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                            UPI ID *
                          </label>
                          <input
                            type="text"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleInputChange}
                            placeholder="yourname@paytm"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </PixelCard>
                    )}
                    
                    {selectedMethod.type === 'card' && (
                      <PixelCard className="mt-6">
                        <h4 className="font-semibold mb-4 pixel-text-gray-800">Card Details</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                              Card Number *
                            </label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                                Expiry Date *
                              </label>
                              <input
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium pixel-text-gray-700 mb-2">
                                CVV *
                              </label>
                              <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                placeholder="123"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </PixelCard>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 pixel-text-gray-800">Payment Summary</h3>
                    <PixelCard>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <PixelIcon size="sm" color={selectedPlan.color}>
                            {selectedPlan.icon}
                          </PixelIcon>
                          <div>
                            <div className="font-semibold pixel-text-gray-800">{selectedPlan.name}</div>
                            <div className="text-sm pixel-text-gray-600">
                              {selectedPlan.months} month plan
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between mb-2">
                            <span className="pixel-text-gray-600">Monthly Amount</span>
                            <span className="font-semibold">₹{selectedPlan.monthlyAmount}</span>
                          </div>
                          {selectedMethod.processingFee > 0 && (
                            <div className="flex justify-between mb-2">
                              <span className="pixel-text-gray-600">Processing Fee</span>
                              <span className="font-semibold">₹{selectedMethod.processingFee}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total Amount</span>
                            <span className="text-blue-600">₹{calculateTotal()}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm pixel-text-gray-500">
                          <div>✓ Secure 256-bit SSL encryption</div>
                          <div>✓ 30-day money-back guarantee</div>
                          <div>✓ Instant course access</div>
                          <div>✓ 24/7 customer support</div>
                        </div>
                      </div>
                    </PixelCard>
                    
                    <PixelButton
                      color="success"
                      className="w-full mt-6"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading ? '⏳ Processing...' : `🔒 Pay ₹${calculateTotal()}`}
                    </PixelButton>
                  </div>
                </div>
              </PixelSection>
            </div>
          )}

          {/* Step 4: Processing */}
          {paymentStep === 'processing' && (
            <div className="max-w-md mx-auto">
              <PixelCard className="text-center">
                <div className="pixel-bounce mb-6">
                  <PixelIcon size="lg" color="success">💳</PixelIcon>
                </div>
                <h2 className="text-2xl font-bold pixel-text-gray-800 mb-4">Processing Payment</h2>
                <p className="pixel-text-gray-600 mb-6">
                  Please wait while we process your payment securely...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: '100%' }}
                  />
                </div>
              </PixelCard>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default PixelPayment