import React, { useState, useEffect } from 'react'
import { loadRazorpayScript } from '../utils/third-party'
import { createRazorpayOrder, verifyRazorpayPayment } from '../utils/functions'
import { useAuth } from '../contexts/AuthContext'
import { PixelCard, PixelButton } from './PixelComponents'
import toast from 'react-hot-toast'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  currency?: string
  orderId?: string
  description?: string
  name?: string
  email?: string
  phone?: string
  onSuccess?: (paymentId: string) => void
  onError?: (error: any) => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'INR',
  orderId,
  description = 'RS-CIT Course Payment',
  name,
  email,
  phone,
  onSuccess,
  onError
}) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [selectedEMI, setSelectedEMI] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !razorpayLoaded) {
      loadRazorpay()
    }
  }, [isOpen])

  const loadRazorpay = async () => {
    try {
      await loadRazorpayScript()
      setRazorpayLoaded(true)
    } catch (error) {
      console.error('Failed to load Razorpay:', error)
      toast.error('Failed to load payment gateway')
    }
  }

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway not loaded. Please try again.')
      return
    }

    if (!user) {
      toast.error('Please log in to make a payment')
      return
    }

    setIsLoading(true)

    try {
      // Create order on server
      const orderResponse = await createRazorpayOrder(amount, currency)
      
      if (orderResponse.error) {
        throw new Error(orderResponse.error.message)
      }

      const { order_id, amount: orderAmount } = orderResponse.data

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency,
        name: 'RS-CIT Platform',
        description: description,
        order_id: order_id,
        prefill: {
          name: name || user.user_metadata?.name || user.email,
          email: email || user.email,
          contact: phone || user.user_metadata?.phone || ''
        },
        notes: {
          user_id: user.id,
          selected_emi: selectedEMI
        },
        theme: {
          color: '#0891b2'
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          }
        },
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyResponse.error) {
              throw new Error(verifyResponse.error.message)
            }

            toast.success('Payment successful! 🎉')
            onSuccess?.(response.razorpay_payment_id)
            onClose()
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError)
            toast.error('Payment verification failed. Please contact support.')
            onError?.(verifyError)
          } finally {
            setIsLoading(false)
          }
        },
        error: (error: any) => {
          console.error('Payment failed:', error)
          toast.error('Payment failed. Please try again.')
          onError?.(error)
          setIsLoading(false)
        }
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('Error initiating payment:', error)
      toast.error('Failed to initiate payment. Please try again.')
      onError?.(error)
      setIsLoading(false)
    }
  }

  const emiOptions = [
    { value: '3', label: '3 Months', amount: Math.ceil(amount / 3) },
    { value: '4', label: '4 Months', amount: Math.ceil(amount / 4) },
    { value: '6', label: '6 Months', amount: Math.ceil(amount / 6) }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <PixelCard className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Payment Details */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">{description}</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount</span>
                <span className="text-2xl font-bold text-white">
                  ₹{amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* EMI Options */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Payment Options</h4>
              
              <div className="space-y-2">
                {/* Full Payment */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment-option"
                    value="full"
                    checked={selectedEMI === null}
                    onChange={() => setSelectedEMI(null)}
                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">Full Payment</div>
                    <div className="text-gray-400 text-sm">
                      Pay ₹{amount.toLocaleString()} now
                    </div>
                  </div>
                </label>

                {/* EMI Options */}
                {emiOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment-option"
                      value={option.value}
                      checked={selectedEMI === option.value}
                      onChange={() => setSelectedEMI(option.value)}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{option.label} EMI</div>
                      <div className="text-gray-400 text-sm">
                        ₹{option.amount.toLocaleString()}/month
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Security */}
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-400">
                <span>🔒</span>
                <span className="text-sm">
                  Secured by Razorpay • SSL Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <PixelButton
            onClick={handlePayment}
            disabled={isLoading || !razorpayLoaded}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ₹${selectedEMI ? emiOptions.find(o => o.value === selectedEMI)?.amount.toLocaleString() : amount.toLocaleString()}`
            )}
          </PixelButton>

          {/* Accepted Payment Methods */}
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-400 mb-2">Accepted Payment Methods</div>
            <div className="flex justify-center space-x-4 text-2xl">
              <span title="Credit/Debit Cards">💳</span>
              <span title="Net Banking">🏦</span>
              <span title="UPI">📱</span>
              <span title="Wallets">💰</span>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}

export default PaymentModal

// Usage example component
export const PaymentExample: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId)
    // Handle successful payment (e.g., unlock course, update user status)
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    // Handle payment error
  }

  return (
    <div className="p-6">
      <PixelButton onClick={() => setShowPaymentModal(true)}>
        Buy RS-CIT Course
      </PixelButton>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={2500} // ₹2,500
        description="RS-CIT Complete Course"
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  )
}