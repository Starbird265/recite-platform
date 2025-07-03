
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Supabase client using the service role key for elevated privileges
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Placeholder for email sending (e.g., using Resend, SendGrid, etc.)
async function sendEmail(to: string, subject: string, body: string) {
  console.log(`Simulating email to: ${to}, Subject: ${subject}, Body: ${body}`);
  // In a real application, you would integrate with an email API here.
  // Example with Resend:
  // const resendApiKey = Deno.env.get('RESEND_API_KEY');
  // if (!resendApiKey) throw new Error('RESEND_API_KEY not set');
  // const res = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${resendApiKey}`,
  //   },
  //   body: JSON.stringify({
  //     from: 'onboarding@yourdomain.com',
  //     to: to,
  //     subject: subject,
  //     html: body,
  //   }),
  // });
  // if (!res.ok) throw new Error(`Failed to send email: ${res.statusText}`);
  return true;
}

// Placeholder for SMS sending (e.g., using Twilio, MessageBird, etc.)
async function sendSms(to: string, body: string) {
  console.log(`Simulating SMS to: ${to}, Body: ${body}`);
  // In a real application, you would integrate with an SMS API here.
  // Example with Twilio:
  // const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  // const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  // const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
  // if (!accountSid || !authToken || !twilioPhoneNumber) throw new Error('Twilio credentials not set');
  // const client = new Twilio(accountSid, authToken);
  // const message = await client.messages.create({
  //   body: body,
  //   from: twilioPhoneNumber,
  //   to: to,
  // });
  // console.log(message.sid);
  return true;
}

serve(async (req) => {
  // Protect the function from unauthorized calls
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_FUNCTION_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch pending notifications
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*, user:user_id(email, phone)') // Fetch user email/phone for sending
      .eq('status', 'pending');

    if (fetchError) throw fetchError;

    const processedNotifications = [];

    for (const notification of notifications) {
      let success = false;
      let errorMessage = null;

      try {
        switch (notification.type) {
          case 'missed_lesson_reminder':
            if (notification.user?.email) {
              const missedCount = notification.content?.missed_count || 0;
              const subject = `Reminder: You've missed ${missedCount} lessons!`;
              const body = `Hi there, you've missed ${missedCount} lessons. Please log in to catch up!`;
              success = await sendEmail(notification.user.email, subject, body);
            }
            break;
          case 'payment_complete':
            if (notification.user?.phone) {
              const body = `Your payment was successful! Thank you.`;
              success = await sendSms(notification.user.phone, body);
            }
            break;
          case 'new_enquiry':
            // This might be an email to a centre coordinator, not the user
            // For simplicity, skipping for now or assuming it's handled elsewhere
            console.log('Skipping new_enquiry notification for now.');
            success = true; // Mark as success if not handled here
            break;
          case 'qa_answered':
            if (notification.user?.email) {
              const subject = `Your question has been answered!`;
              const body = `Hi, your question on the Q&A forum has received an answer. Check it out!`;
              success = await sendEmail(notification.user.email, subject, body);
            }
            break;
          default:
            console.warn(`Unknown notification type: ${notification.type}`);
            errorMessage = `Unknown notification type: ${notification.type}`;
            break;
        }
      } catch (e) {
        console.error(`Failed to send notification ${notification.id}:`, e);
        errorMessage = e.message;
        success = false;
      }

      // 2. Update notification status
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ status: success ? 'sent' : 'failed', content: { ...notification.content, error: errorMessage } })
        .eq('id', notification.id);

      if (updateError) {
        console.error(`Failed to update notification status for ${notification.id}:`, updateError);
      }
      processedNotifications.push({ id: notification.id, success, errorMessage });
    }

    return new Response(JSON.stringify({ processed: processedNotifications.length, details: processedNotifications }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in send-notifications function:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
