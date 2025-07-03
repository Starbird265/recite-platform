import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

interface NotificationRequest {
  user_ids?: string[]
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  send_to_all?: boolean
  filter_by?: {
    subscription_plan?: string
    city?: string
    enrollment_status?: string
  }
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
      user_ids,
      title,
      message,
      type,
      send_to_all = false,
      filter_by
    }: NotificationRequest = req.body

    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Missing required fields: title, message, type' })
    }

    let targetUserIds: string[] = []

    if (send_to_all) {
      // Get all user IDs
      const { data: users, error } = await supabase
        .from('users')
        .select('id')

      if (error) throw error
      targetUserIds = users.map(user => user.id)
    } else if (filter_by) {
      // Build query based on filters
      let query = supabase.from('users').select('id')

      if (filter_by.subscription_plan) {
        query = query.eq('subscription_plan', filter_by.subscription_plan)
      }
      if (filter_by.city) {
        query = query.eq('city', filter_by.city)
      }

      const { data: filteredUsers, error } = await query

      if (error) throw error
      targetUserIds = filteredUsers.map(user => user.id)

      // Additional filter for enrollment status
      if (filter_by.enrollment_status) {
        const { data: enrolledUsers, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('user_id')
          .eq('status', filter_by.enrollment_status)

        if (enrollmentError) throw enrollmentError
        const enrolledUserIds = enrolledUsers.map(e => e.user_id)
        targetUserIds = targetUserIds.filter(id => enrolledUserIds.includes(id))
      }
    } else if (user_ids) {
      targetUserIds = user_ids
    } else {
      return res.status(400).json({ message: 'Must specify user_ids, send_to_all, or filter_by' })
    }

    if (targetUserIds.length === 0) {
      return res.status(400).json({ message: 'No users found matching criteria' })
    }

    // Create notification records
    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    }))

    // Batch insert notifications
    const batchSize = 1000
    const batches = []
    for (let i = 0; i < notifications.length; i += batchSize) {
      batches.push(notifications.slice(i, i + batchSize))
    }

    let totalInserted = 0
    for (const batch of batches) {
      const { error } = await supabase
        .from('notifications')
        .insert(batch)

      if (error) throw error
      totalInserted += batch.length
    }

    // Here you would also send push notifications, emails, SMS etc.
    // await sendPushNotifications(targetUserIds, title, message)
    // await sendEmailNotifications(targetUserIds, title, message)

    res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${totalInserted} users`,
      recipients: totalInserted
    })

  } catch (error: any) {
    console.error('Error sending notification:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to send notification',
      error: error.message 
    })
  }
}

// Helper functions for different notification channels
async function sendPushNotifications(userIds: string[], title: string, message: string) {
  // Implement push notification logic here
  // Could use services like Firebase Cloud Messaging, OneSignal, etc.
  console.log(`Push notification sent to ${userIds.length} users: ${title}`)
}

async function sendEmailNotifications(userIds: string[], title: string, message: string) {
  // Implement email notification logic here
  // Could use services like SendGrid, Mailgun, AWS SES, etc.
  console.log(`Email notification sent to ${userIds.length} users: ${title}`)
}

async function sendSMSNotifications(userIds: string[], message: string) {
  // Implement SMS notification logic here
  // Could use services like Twilio, AWS SNS, etc.
  console.log(`SMS notification sent to ${userIds.length} users: ${message}`)
}