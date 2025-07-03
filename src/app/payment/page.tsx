'use client';

import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

const EMI_OPTIONS = [
  { label: '3 months (₹1,566/mo)', value: '3', amount: 1566 },
  { label: '4 months (₹1,175/mo)', value: '4', amount: 1175 },
  { label: '6 months (₹783/mo)', value: '6', amount: 783 },
];

const TOTAL_AMOUNT = 4699;

const PaymentPage = () => {
  const { user } = useAuth();
  const [selectedEmi, setSelectedEmi] = useState('3');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePayNow = async () => {
    setPaying(true);
    setError(null);
    try {
      // Mock Razorpay payment success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Update payment status in Supabase
      if (!user) throw new Error('User not found.');
      const { error } = await supabase
        .from('payments')
        .insert({ user_id: user.id, amount: TOTAL_AMOUNT, emi_plan: selectedEmi, status: 'paid', paid_at: new Date().toISOString() });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Payment failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-3">Pay & Enroll</h2>
              <p className="text-center text-muted mb-4">Complete your payment to unlock all lessons, quizzes, and exam registration.</p>
              <div className="mb-4">
                <h4>Total Amount: <span className="text-success">₹4,699</span></h4>
                <h5 className="mt-3 mb-2">Choose EMI Plan</h5>
                <div className="d-flex flex-wrap gap-3">
                  {EMI_OPTIONS.map((plan) => (
                    <div className="form-check form-check-inline" key={plan.value}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="emiPlan"
                        id={`emi-${plan.value}`}
                        value={plan.value}
                        checked={selectedEmi === plan.value}
                        onChange={() => setSelectedEmi(plan.value)}
                        disabled={paying || success}
                      />
                      <label className="form-check-label fw-bold" htmlFor={`emi-${plan.value}`}>{plan.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary w-100 mt-3" onClick={handlePayNow} disabled={paying || success}>
                {paying ? 'Processing...' : 'Pay Now'}
              </button>
              {success && <div className="alert alert-success text-center mt-3">Payment successful! Redirecting...</div>}
              {error && <div className="alert alert-danger text-center mt-3">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
