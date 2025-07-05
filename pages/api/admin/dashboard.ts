
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // Ensure only authenticated admins can access this route
  // This check is redundant if the route is protected by Next.js middleware
  // or if the frontend only calls this route after verifying admin status.
  // However, it's good practice to have a server-side check.
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

  // Assuming 'role' is stored in user_metadata
  if (user.user_metadata.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Not an admin.' });
  }

  try {
    // Fetch data from the admin views
    const { data: contentSummary, error: contentError } = await supabaseAdmin
      .from('admin_content_summary')
      .select('*');

    const { data: userSummary, error: userErrorView } = await supabaseAdmin
      .from('admin_user_summary')
      .select('*');

    const { data: referralSummary, error: referralError } = await supabaseAdmin
      .from('admin_referral_summary')
      .select('*');

    if (contentError) throw contentError;
    if (userErrorView) throw userErrorView;
    if (referralError) throw referralError;

    res.status(200).json({
      contentSummary,
      userSummary: userSummary ? userSummary[0] : null, // userSummary is an array, take the first element
      referralSummary,
    });

  } catch (error: any) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard data.', details: error.message });
  }
}
