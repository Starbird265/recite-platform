import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { user_id } = req.query

      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' })
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single()

      if (error) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.status(200).json(data)

    } catch (error: any) {
      console.error('Profile fetch error:', error)
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      })
    }
  } else if (req.method === 'PUT') {
    try {
      const { user_id } = req.query
      const { name, phone, city } = req.body

      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' })
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          name,
          phone,
          city,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)
        .select()
        .single()

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.status(200).json({ 
        message: 'Profile updated successfully',
        user: data 
      })

    } catch (error: any) {
      console.error('Profile update error:', error)
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}