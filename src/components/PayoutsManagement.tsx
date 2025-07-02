'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

type PaymentType = {
  id: string;
  user_id: string;
  amount: number;
  status: string; // e.g., 'completed', 'pending_payout', 'paid_out'
  created_at: string;
  // Add more fields as needed, e.g., centre_id, referral_id
};

const PayoutsManagement = () => {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Fetch payments that are 'completed' and not yet 'paid_out'
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .neq('status', 'paid_out')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch payments.');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaidOut = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to mark this payment as paid out?')) {
      try {
        const { error } = await supabase
          .from('payments')
          .update({ status: 'paid_out' })
          .eq('id', paymentId);

        if (error) throw error;
        fetchPayments(); // Refresh list
      } catch (error: any) {
        setError(error.message || 'Failed to mark payment as paid out.');
      }
    }
  };

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Payouts Management</h2></div>
        <div className="card-body">
          {payments.length > 0 ? (
            <ul className="list-group">
              {payments.map((payment) => (
                <li key={payment.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>Payment ID: {payment.id}</h5>
                    <p>User ID: {payment.user_id}</p>
                    <p>Amount: ₹{payment.amount}</p>
                    <p>Status: {payment.status}</p>
                    <p>Date: {new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                  {payment.status !== 'paid_out' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => markAsPaidOut(payment.id)}
                    >
                      Mark as Paid Out
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No payments awaiting payout.</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/admin" className="btn btn-primary">Back to Admin Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default PayoutsManagement;
