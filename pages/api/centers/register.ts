import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

interface CenterRegistration {
  name: string
  address: string
  city: string
  phone: string
  email: string
  owner_name: string
  owner_phone: string
  latitude?: number
  longitude?: number
  fees: number
  capacity?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const {
      name,
      address,
      city,
      phone,
      email,
      owner_name,
      owner_phone,
      latitude,
      longitude,
      fees,
      capacity = 50
    }: CenterRegistration = req.body

    // Validate required fields
    if (!name || !address || !city || !phone || !email || !owner_name || !owner_phone || !fees) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'address', 'city', 'phone', 'email', 'owner_name', 'owner_phone', 'fees']
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate phone numbers
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(phone.replace(/\D/g, '').slice(-10))) {
      return res.status(400).json({ message: 'Invalid phone number format' })
    }

    // Check if center already exists
    const { data: existingCenter } = await supabase
      .from('centers')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single()

    if (existingCenter) {
      return res.status(409).json({ message: 'Center with this email or phone already exists' })
    }

    // Generate unique referral code
    const generateReferralCode = () => {
      const cityPrefix = city.substring(0, 3).toUpperCase()
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase()
      return `${cityPrefix}${randomSuffix}`
    }

    let referralCode = generateReferralCode()
    
    // Ensure referral code is unique
    let attempts = 0
    while (attempts < 5) {
      const { data: existingReferral } = await supabase
        .from('centers')
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      if (!existingReferral) break
      
      referralCode = generateReferralCode()
      attempts++
    }

    // Create center record
    const { data: newCenter, error } = await supabase
      .from('centers')
      .insert([
        {
          name,
          address,
          city: city.toLowerCase(),
          phone,
          email,
          owner_name,
          owner_phone,
          latitude,
          longitude,
          fees,
          capacity,
          referral_code: referralCode,
          verified: false, // Requires admin approval
          rating: 0.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Send welcome email (would integrate with email service)
    // await sendWelcomeEmail(email, name, referralCode)

    res.status(201).json({
      success: true,
      message: 'Center registered successfully! Awaiting admin approval.',
      center: {
        id: newCenter.id,
        name: newCenter.name,
        referral_code: newCenter.referral_code,
        city: newCenter.city,
        status: 'pending_approval'
      }
    })

  } catch (error: any) {
    console.error('Error registering center:', error)
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ message: 'Center with this information already exists' })
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to register center',
      error: error.message 
    })
  }
}

// Helper function to send welcome email (would be implemented with email service)
async function sendWelcomeEmail(email: string, centerName: string, referralCode: string) {
  // This would integrate with services like SendGrid, Mailgun, etc.
  console.log(`Welcome email sent to ${email} for center ${centerName} with referral code ${referralCode}`)
  
  // Email template would include:
  // - Welcome message
  // - Referral code
  // - Next steps for approval
  // - Contact information
  // - Platform features overview
}