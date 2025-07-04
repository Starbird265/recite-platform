// Edge Functions utilities for RS-CIT Platform
import { supabase } from '../lib/supabaseClient'

// AI Content Generation
export const generateLesson = async (topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner') => {
  const { data, error } = await supabase.functions.invoke('generate-lesson', {
    body: { topic, difficulty }
  })
  
  if (error) {
    console.error('Error generating lesson:', error)
    throw error
  }
  
  return data
}

export const generateQuiz = async (lessonContent: string, questionCount: number = 5) => {
  const { data, error } = await supabase.functions.invoke('generate-quiz', {
    body: { lessonContent, questionCount }
  })
  
  if (error) {
    console.error('Error generating quiz:', error)
    throw error
  }
  
  return data
}

// Payment Processing
export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  const { data, error } = await supabase.functions.invoke('razorpay-order', {
    body: { amount, currency }
  })
  
  if (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
  
  return data
}

export const verifyRazorpayPayment = async (paymentData: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) => {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: paymentData
  })
  
  if (error) {
    console.error('Error verifying payment:', error)
    throw error
  }
  
  return data
}

// Enquiry Processing
export const processTypeformEnquiry = async (enquiryData: any) => {
  const { data, error } = await supabase.functions.invoke('typeform-webhook', {
    body: enquiryData
  })
  
  if (error) {
    console.error('Error processing enquiry:', error)
    throw error
  }
  
  return data
}

// Email Notifications
export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  const { data, error } = await supabase.functions.invoke('send-welcome-email', {
    body: { userEmail, userName }
  })
  
  if (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
  
  return data
}

export const sendCertificateEmail = async (userEmail: string, certificateUrl: string) => {
  const { data, error } = await supabase.functions.invoke('send-certificate', {
    body: { userEmail, certificateUrl }
  })
  
  if (error) {
    console.error('Error sending certificate:', error)
    throw error
  }
  
  return data
}

// Analytics & Reporting
export const generateProgressReport = async (userId: string, timeframe: 'week' | 'month' | 'quarter' = 'week') => {
  const { data, error } = await supabase.functions.invoke('generate-report', {
    body: { userId, timeframe }
  })
  
  if (error) {
    console.error('Error generating progress report:', error)
    throw error
  }
  
  return data
}

// Content Moderation
export const moderateContent = async (content: string, type: 'question' | 'answer' | 'comment') => {
  const { data, error } = await supabase.functions.invoke('moderate-content', {
    body: { content, type }
  })
  
  if (error) {
    console.error('Error moderating content:', error)
    throw error
  }
  
  return data
}

// Admin Functions
export const bulkUpdateProgress = async (updates: Array<{ userId: string, lessonId: string, progress: number }>) => {
  const { data, error } = await supabase.functions.invoke('bulk-update-progress', {
    body: { updates }
  })
  
  if (error) {
    console.error('Error updating progress:', error)
    throw error
  }
  
  return data
}

export const generateCertificate = async (userId: string, courseId: string) => {
  const { data, error } = await supabase.functions.invoke('generate-certificate', {
    body: { userId, courseId }
  })
  
  if (error) {
    console.error('Error generating certificate:', error)
    throw error
  }
  
  return data
}

// Utility function to check if Edge Functions are available
export const checkFunctionsHealth = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('health-check', {
      body: { timestamp: new Date().toISOString() }
    })
    
    return { available: !error, data, error }
  } catch (error) {
    console.error('Edge Functions not available:', error)
    return { available: false, error }
  }
}

// Export all functions for easy importing
export const EdgeFunctions = {
  generateLesson,
  generateQuiz,
  createRazorpayOrder,
  verifyRazorpayPayment,
  processTypeformEnquiry,
  sendWelcomeEmail,
  sendCertificateEmail,
  generateProgressReport,
  moderateContent,
  bulkUpdateProgress,
  generateCertificate,
  checkFunctionsHealth
}