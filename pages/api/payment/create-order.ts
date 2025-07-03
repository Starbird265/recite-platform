import type { NextApiRequest, NextApiResponse } from 'next'
import Razorpay from 'razorpay'
import { supabase } from '../../../lib/supabase'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { amount, currency, plan, center_id, user_id } = req.body

    // Validate input
    if (!amount || !currency || !plan || !center_id || !user_id) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id,
        center_id,
        plan,
        type: 'first_installment'
      }
    }

    const order = await razorpay.orders.create(options)

    // Store order in database
    const { error } = await supabase
      .from('payments')
      .insert([
        {
          user_id,
          amount: amount / 100, // Convert back to rupees for storage
          currency,
          status: 'pending',
          payment_method: 'razorpay',
          razorpay_order_id: order.id,
          emi_plan: plan,
          center_id,
          created_at: new Date().toISOString(),
        },
      ])

    if (error) {
      throw error
    }

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })

  } catch (error: any) {
    console.error('Error creating order:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}