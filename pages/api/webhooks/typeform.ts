
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// It's best to use environment variables for this
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The shape of the Typeform payload (simplified)
interface TypeformPayload {
  form_response: {
    answers: Array<{
      field: {
        ref: string; // The 'ref' you set in your Typeform question
      };
      text?: string;
      email?: string;
      phone_number?: string;
    }>;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Optional: Secure your webhook with a secret token
  const typeformSignature = req.headers['typeform-signature'];
  if (process.env.TYPEFORM_SECRET && (!typeformSignature || typeformSignature !== `sha256=${process.env.TYPEFORM_SECRET}`)) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload: TypeformPayload = req.body;

    // Extract answers using the 'ref' from your Typeform fields
    const answers = payload.form_response.answers;

    const findAnswer = (ref: string) => answers.find(a => a.field.ref === ref);

    const name = findAnswer('name')?.text;
    const email = findAnswer('email')?.email;
    const phone = findAnswer('phone')?.phone_number;
    const preferred_district = findAnswer('district')?.text;

    if (!name || !email || !phone || !preferred_district) {
      return res.status(400).json({ error: 'Missing required fields from Typeform response.' });
    }

    // Insert the data into your 'enquiries' table
    const { data, error } = await supabase
      .from('enquiries')
      .insert([{ name, email, phone, preferred_district }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save enquiry.', details: error.message });
    }

    console.log('Successfully inserted enquiry:', data);
    return res.status(200).json({ message: 'Enquiry received and saved.' });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
