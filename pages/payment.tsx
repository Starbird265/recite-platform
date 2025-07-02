import { useState, useEffect } from 'react'
import Head from 'next/head'
import { CreditCard, Calendar, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'

interface PaymentPlan {
  id: string
  name: string
  months: number
  monthlyAmount: number
  totalAmount: number
  savings?: number
  popular?: boolean
}

interface SelectedCenter {
  id: string
  name: string
  address: string
  fees: number
}

export default function PaymentPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string>('6_months')
  const [selectedCenter, setSelectedCenter] = useState<SelectedCenter | null>(null)
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const paymentPlans: PaymentPlan[] = [
    {
      id: '3_months',
      name: '3 Month Plan',
      months: 3,
      monthlyAmount: 1566,
      totalAmount: 4698,
    },
    {
      id: '4_months',
      name: '4 Month Plan',
      months: 4,
      monthlyAmount: 1175,
      totalAmount: 4700,
    },
    {
      id: '6_months',
      name: '6 Month Plan',
      months: 6,
      monthlyAmount: 783,
      totalAmount: 4698,
      popular: true,
      savings: 2,
    }
  ]

  useEffect(() => {
    // Get selected center from localStorage
    const centerData = localStorage.getItem('selectedCenter')
    if (centerData) {
      setSelectedCenter(JSON.parse(centerData))
    }
  }, [])

  const selectedPlanDetails = paymentPlans.find(plan => plan.id === selectedPlan)

  const handlePayment = async () => {
    if (!selectedCenter || !selectedPlanDetails) return

    setProcessingPayment(true)
    
    try {
      // Create order on backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPlanDetails.monthlyAmount * 100, // Convert to paise
          currency: 'INR',
          plan: selectedPlan,
          center_id: selectedCenter.id,
          user_id: user?.id,
        }),
      })

      const { orderId, amount } = await response.json()

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'RS-CIT Platform',
        description: `${selectedPlanDetails.name} - First Installment`,
        order_id: orderId,
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user?.id,
              center_id: selectedCenter.id,
              plan: selectedPlan,
            }),
          })

          if (verifyResponse.ok) {
            // Payment successful, redirect to dashboard
            window.location.href = '/dashboard?payment=success'
          } else {
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user?.user_metadata?.name || '',
          email: user?.email || '',
          contact: user?.user_metadata?.phone || '',
        },
        theme: {
          color: '#2563eb',
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (!selectedCenter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Center Selected</h2>
          <p className="text-gray-600 mb-4">Please select a center first to proceed with payment.</p>
          <button
            onClick={() => window.location.href = '/centers'}
            className="bg-rs-blue-600 text-white px-6 py-2 rounded-lg hover:bg-rs-blue-700"
          >
            Select Center
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Payment & EMI Plans | RS-CIT Platform</title>
        <meta name="description" content="Choose your flexible EMI plan for RS-CIT certification" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Payment Plan</h1>
            <p className="text-gray-600">Flexible EMI options to make RS-CIT certification affordable</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Plans */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Select EMI Plan</h2>
                  
                  <div className="space-y-4">
                    {paymentPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? 'border-rs-blue-500 bg-rs-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-4 bg-rs-orange-500 text-white text-xs px-2 py-1 rounded">
                            Most Popular
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-gray-600">Pay in {plan.months} installments</p>
                            {plan.savings && (
                              <p className="text-green-600 text-sm">Save ₹{plan.savings}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-rs-blue-600">
                              ₹{plan.monthlyAmount}/month
                            </div>
                            <div className="text-sm text-gray-500">
                              Total: ₹{plan.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            First payment: ₹{plan.monthlyAmount} today, then ₹{plan.monthlyAmount} monthly
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-green-800">Secure Payment</h3>
                    <p className="text-green-700 text-sm">
                      Your payment is secured by Razorpay with bank-level encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow sticky top-6">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <h3 className="font-medium">Selected Center</h3>
                      <p className="text-sm text-gray-600">{selectedCenter.name}</p>
                      <p className="text-xs text-gray-500">{selectedCenter.address}</p>
                    </div>
                    
                    <div className="border-t pt-3">
                      <h3 className="font-medium">Payment Plan</h3>
                      <p className="text-sm text-gray-600">{selectedPlanDetails?.name}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span>Exam Fees</span>
                      <span>₹4,200</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Premium Content</span>
                      <span>₹499</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>₹{selectedPlanDetails?.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Payment Schedule:</div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Today</span>
                        <span className="font-medium">₹{selectedPlanDetails?.monthlyAmount}</span>
                      </div>
                      {selectedPlanDetails && Array.from({ length: selectedPlanDetails.months - 1 }).map((_, i) => (
                        <div key={i} className="flex justify-between text-gray-500">
                          <span>Month {i + 2}</span>
                          <span>₹{selectedPlanDetails.monthlyAmount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={processingPayment}
                    className="w-full bg-rs-blue-600 hover:bg-rs-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay ₹{selectedPlanDetails?.monthlyAmount} Now
                      </>
                    )}
                  </button>

                  <div className="text-xs text-gray-500 text-center mt-3">
                    By proceeding, you agree to our Terms of Service and Privacy Policy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}