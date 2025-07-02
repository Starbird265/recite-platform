'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import Link from 'next/link';

type PayoutRecord = {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  // Add more fields as needed, e.g., associated_registration_id
};

const CentrePayouts = () => {
  const { centreId } = useAuth();
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      if (!centreId) {
        setLoading(false);
        setError('Centre ID not found. Cannot fetch payouts.');
        return;
      }
      try {
        // Fetch exam registrations for this centre that are completed and paid
        const { data: registrations, error: regError } = await supabase
          .from('exam_registrations')
          .select('id, payment_status')
          .eq('centre_id', centreId)
          .eq('payment_status', 'completed');

        if (regError) throw regError;

        const registrationIds = registrations?.map(reg => reg.id) || [];

        // Fetch payments associated with these registrations
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('id, amount, created_at, status')
          .in('razorpay_order_id', registrationIds); // Assuming razorpay_order_id stores registration ID

        if (paymentsError) throw paymentsError;

        setPayouts(paymentsData || []);

        // Calculate total earnings (assuming 350 per referral)
        const earnings = (paymentsData || []).filter(p => p.status === 'completed' || p.status === 'paid_out').length * 350;
        setTotalEarnings(earnings);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch payouts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [centreId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div>Loading payouts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Centre Payouts</h2>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
        <div className="card-body">
          <h4 className="mb-3">Total Estimated Earnings: ₹{totalEarnings}</h4>

          <h5 className="mt-4">Payout History</h5>
          {payouts.length > 0 ? (
            <ul className="list-group">
              {payouts.map((payout) => (
                <li key={payout.id} className="list-group-item">
                  <p><strong>Payment ID:</strong> {payout.id}</p>
                  <p><strong>Amount:</strong> ₹{payout.amount}</p>
                  <p><strong>Status:</strong> {payout.status}</p>
                  <p><strong>Date:</strong> {new Date(payout.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No payout history available.</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/centre" className="btn btn-primary">Back to Centre Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default CentrePayouts;
