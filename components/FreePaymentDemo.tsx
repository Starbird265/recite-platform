import React, { useState } from 'react'
import { PixelCard, PixelButton } from './PixelComponents'
import { createEnquiry } from '../lib/supabase-queries'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

// Free payment alternatives without credit card requirements
const FreePaymentDemo: React.FC = () => {
  const { user } = useAuth()
  const [showDemo, setShowDemo] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('demo')
  const [isProcessing, setIsProcessing] = useState(false)

  // Simulate payment processing
  const simulatePayment = async () => {
    setIsProcessing(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Save payment intent to database
    if (user) {
      await createEnquiry({
        user_id: user.id,
        name: user.user_metadata?.name || 'User',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        message: `Payment demo completed for RS-CIT course. Amount: ₹2,500. Method: ${paymentMethod}`,
      })
    }
    
    setIsProcessing(false)
    toast.success('Payment demo completed! 🎉')
  }

  const freePaymentOptions = [
    {
      id: 'demo',
      name: 'Demo Payment',
      description: 'Simulated payment for testing',
      icon: '🎭',
      available: true,
      setup: 'No setup required'
    },
    {
      id: 'offline',
      name: 'Offline Payment',
      description: 'Bank transfer or cash at center',
      icon: '🏦',
      available: true,
      setup: 'Share bank details'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      description: 'Free for personal use',
      icon: '📱',
      available: true,
      setup: 'Free Paytm merchant account'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      description: 'Free QR code payments',
      icon: '📞',
      available: true,
      setup: 'Free PhonePe for Business'
    },
    {
      id: 'gpay',
      name: 'Google Pay',
      description: 'Free UPI payments',
      icon: 'G',
      available: true,
      setup: 'Free Google Pay for Business'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Payment Options */}
      <PixelCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          💳 Free Payment Options (No Credit Card Required)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freePaymentOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                paymentMethod === option.id
                  ? 'border-cyan-500 bg-cyan-900/20'
                  : 'border-gray-700 bg-gray-800'
              }`}
              onClick={() => setPaymentMethod(option.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{option.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{option.description}</p>
                  <div className="text-xs text-green-400">✅ {option.setup}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PixelCard>

      {/* Payment Demo */}
      <PixelCard className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-4">
            RS-CIT Course Payment Demo
          </h3>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Course Fee</span>
              <span className="text-2xl font-bold text-white">₹2,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-cyan-400 capitalize">{paymentMethod}</span>
            </div>
          </div>

          <PixelButton
            onClick={simulatePayment}
            disabled={isProcessing}
            className="w-full max-w-md"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `💳 Pay ₹2,500 via ${paymentMethod}`
            )}
          </PixelButton>
        </div>
      </PixelCard>

      {/* Free Alternatives Setup Guide */}
      <PixelCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          🆓 How to Set Up Free Payment Methods
        </h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-white">1. UPI QR Code (100% Free)</h4>
            <p className="text-gray-400 text-sm">
              Generate a UPI QR code using any UPI app (PhonePe, Google Pay, Paytm).
              No business verification needed for small amounts.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-white">2. Bank Transfer</h4>
            <p className="text-gray-400 text-sm">
              Share your bank account details. Students can transfer directly.
              Most banks offer free NEFT/RTGS for small amounts.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-white">3. Cash at Center</h4>
            <p className="text-gray-400 text-sm">
              Traditional payment method. Students pay at the learning center.
              No online processing fees.
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-semibold text-white">4. Paytm for Business (Free)</h4>
            <p className="text-gray-400 text-sm">
              Free signup with Aadhaar. Get payment gateway without credit card.
              Small transaction fees apply.
            </p>
          </div>
        </div>
      </PixelCard>

      {/* Payment Links Generator */}
      <PixelCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          🔗 Generate Payment Links
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">UPI Payment Link</h4>
            <div className="text-sm text-gray-400 mb-2">
              upi://pay?pa=your-upi-id@paytm&pn=RS-CIT&am=2500&cu=INR
            </div>
            <PixelButton size="sm" className="w-full">
              📱 Generate UPI Link
            </PixelButton>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">WhatsApp Payment</h4>
            <div className="text-sm text-gray-400 mb-2">
              Send payment request via WhatsApp
            </div>
            <PixelButton size="sm" className="w-full">
              📱 Share on WhatsApp
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}

export default FreePaymentDemo