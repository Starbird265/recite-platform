import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      center_id,
      plan
    } = req.body

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' })
    }

    // Update payment status in database
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)

    if (paymentError) {
      throw paymentError
    }

    // Create user enrollment record
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .insert([
        {
          user_id,
          center_id,
          emi_plan: plan,
          status: 'active',
          enrolled_at: new Date().toISOString(),
          exam_date: null, // Will be set when user registers for exam
        },
      ])

    if (enrollmentError) {
      throw enrollmentError
    }

    // Update user subscription
    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription_plan: 'premium',
        center_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id)

    if (userError) {
      throw userError
    }

    // Notify center about new enrollment (could be done via webhook/email)
    console.log('TODO: Implement notification to center for user:', user_id, 'and center:', center_id);

    res.status(200).json({ 
      message: 'Payment verified successfully',
      enrollment_status: 'active'
    })

  } catch (error: any) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}