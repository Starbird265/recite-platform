import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password, name, phone, city } = req.body

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return res.status(400).json({ message: authError.message })
    }

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            phone: phone || null,
            city: city || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't return error here as auth was successful
      }
    }

    res.status(200).json({ 
      message: 'Registration successful',
      user: authData.user,
      session: authData.session
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}