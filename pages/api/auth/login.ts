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
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    res.status(200).json({ 
      message: 'Login successful',
      user: data.user,
      session: data.session
    })

  } catch (error: any) {
    console.error('Login error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    })
  }
}