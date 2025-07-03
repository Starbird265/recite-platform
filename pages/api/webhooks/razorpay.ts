
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use the SERVICE_ROLE_KEY for backend operations to bypass RLS if needed
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // 1. Validate the Razorpay webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
        return res.status(401).json({ error: 'Signature missing.' });
    }

    try {
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Signature validation failed.' });
    }

    // 2. Process the event payload
    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        // The referral_id should be stored in the order's notes
        const referralId = payload.order.entity.notes?.referral_id;

        if (!referralId) {
            console.warn(`Webhook received for order ${orderId} without a referral_id in notes.`);
            // Still return 200 to acknowledge receipt, but log the issue.
            return res.status(200).json({ message: 'Acknowledged, but no referral_id found.' });
        }

        // 3. Update the referral status in Supabase
        try {
            const { data, error } = await supabase
                .from('referrals')
                .update({ status: 'paid' })
                .eq('id', referralId)
                .select();

            if (error) {
                console.error(`Supabase update failed for referral ${referralId}:`, error);
                // Even if DB update fails, acknowledge the webhook to prevent retries
                return res.status(500).json({ error: 'Failed to update referral status.' });
            }

            if (data && data.length > 0) {
                console.log(`Successfully updated referral ${referralId} to 'paid'.`);
            } else {
                console.warn(`Referral with ID ${referralId} not found.`);
            }

        } catch (dbError) {
            console.error('Database operation failed:', dbError);
            return res.status(500).json({ error: 'Internal database error.' });
        }
    }

    // Acknowledge receipt of the webhook
    res.status(200).json({ received: true });
}
