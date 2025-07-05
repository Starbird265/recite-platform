
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Initialize Razorpay client
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // 1. Authenticate and Authorize Admin
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing.' });
  }

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  if (user.user_metadata.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Not an admin.' });
  }

  // 2. Validate Request Body
  const { centre_id, amount } = req.body;

  if (!centre_id || !amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid or missing centre_id or amount.' });
  }

  try {
    // 3. Fetch Centre UPI ID
    const { data: centre, error: centreError } = await supabaseAdmin
      .from('centres')
      .select('upi_id')
      .eq('id', centre_id)
      .single();

    if (centreError || !centre || !centre.upi_id) {
      console.error('Error fetching centre UPI ID:', centreError || 'UPI ID not found.');
      return res.status(404).json({ error: 'Centre not found or UPI ID not configured.' });
    }

    // 4. Initiate Payout via Razorpay Route API
    // Amount needs to be in smallest currency unit (e.g., paise for INR)
    const payoutAmountInPaise = Math.round(amount * 100);

    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_FUND_ACCOUNT_NUMBER, // Your Razorpay Route account number
      fund_account_id: centre.upi_id, // This should be the fund account ID for the UPI ID
      amount: payoutAmountInPaise,
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true,
      notes: {
        centre_id: centre_id,
        admin_user_id: user.id,
      },
    });

    // 5. Respond with Payout Details
    return res.status(200).json({ message: 'Payout initiated successfully.', payout });

  } catch (error: any) {
    console.error('Error initiating payout:', error);
    // Handle specific Razorpay errors if needed
    return res.status(500).json({ error: 'Failed to initiate payout.', details: error.message });
  }
}
