'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import Link from 'next/link';

type ExamRegistrationType = {
  id: string;
  user_id: string;
  registration_date: string;
  payment_status: string;
  centre_notified: boolean;
  profiles: { email: string }; // Assuming we can join to get user email
};

const CentreDashboard = () => {
  const { centreId } = useAuth();
  const [referrals, setReferrals] = useState<ExamRegistrationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, paid: 0 });
  const [referralStats, setReferralStats] = useState({ total: 0, paid: 0, unpaid: 0 });

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!centreId) {
        setLoading(false);
        setError('Centre ID not found. Please complete onboarding.');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('exam_registrations')
          .select('id, user_id, registration_date, payment_status, centre_notified, profiles(email)')
          .eq('centre_id', centreId)
          .order('registration_date', { ascending: false });

        if (error) throw error;
        // Fix: Map profiles to ensure email is a string, not array
        const mapped = (data || []).map((r: any) => ({
          ...r,
          profiles: { email: Array.isArray(r.profiles) ? (r.profiles[0]?.email || 'N/A') : (r.profiles?.email || 'N/A') }
        }));
        setReferrals(mapped);

        // Referral stats
        const total = (data || []).length;
        const paid = (data || []).filter((r: any) => r.payment_status === 'paid').length;
        const unpaid = total - paid;
        setReferralStats({ total, paid, unpaid });
      } catch (error: any) {
        setError(error.message || 'Failed to fetch referrals.');
      } finally {
        setLoading(false);
      }
    };

    const fetchEarnings = async () => {
      if (!centreId) return;
      try {
        // Fetch payouts for this centre
        const { data, error } = await supabase
          .from('payouts')
          .select('amount, status')
          .eq('centre_id', centreId);
        if (error) throw error;
        const total = (data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const paid = (data || []).filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const pending = total - paid;
        setEarnings({ total, paid, pending });
      } catch (error: any) {
        // Ignore earnings error for now
      }
    };

    fetchReferrals();
    fetchEarnings();
  }, [centreId]);

  const handleMarkNotified = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('exam_registrations')
        .update({ centre_notified: true })
        .eq('id', registrationId);

      if (error) throw error;
      // Update the local state to reflect the change
      setReferrals(prev => prev.map(reg =>
        reg.id === registrationId ? { ...reg, centre_notified: true } : reg
      ));
    } catch (error: any) {
      setError(error.message || 'Failed to mark as notified.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const unnotifiedReferrals = referrals.filter(reg => !reg.centre_notified);

  if (loading) return <div>Loading Centre Dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h1>Centre Dashboard</h1>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
        <div className="card-body">
          <p>Welcome to the Centre Dashboard! This is where you'll manage student referrals, attendance, and earnings.</p>

          <h4 className="mt-4">Incoming Student Referrals</h4>
          <Link href="/centre/attendance" className="btn btn-info btn-sm me-2 mb-3">Manage Attendance</Link>
          <Link href="/centre/payouts" className="btn btn-warning btn-sm mb-3">View Payouts</Link>

          {unnotifiedReferrals.length > 0 && (
            <div className="alert alert-info mt-3">
              You have {unnotifiedReferrals.length} new unnotified exam registrations!
            </div>
          )}

          {referrals.length > 0 ? (
            <ul className="list-group">
              {referrals.map((referral) => (
                <li key={referral.id} className="list-group-item">
                  <h5>Registration ID: {referral.id}</h5>
                  <p>Student Email: {referral.profiles?.email || 'N/A'}</p>
                  <p>Registration Date: {new Date(referral.registration_date).toLocaleDateString()}</p>
                  <p>Payment Status: {referral.payment_status}</p>
                  {!referral.centre_notified && (
                    <button
                      className="btn btn-sm btn-success mt-2"
                      onClick={() => handleMarkNotified(referral.id)}
                    >
                      Mark as Notified
                    </button>
                  )}
                  {referral.centre_notified && (
                    <span className="badge bg-secondary mt-2">Notified</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No student referrals at this time.</p>
          )}
        </div>
      </div>

      {/* Earnings & Referral Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title">Total Earnings</h5>
              <p className="fs-4 text-success">₹{earnings.total}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title">Pending Payouts</h5>
              <p className="fs-5 text-warning">₹{earnings.pending}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title">Paid Payouts</h5>
              <p className="fs-5 text-primary">₹{earnings.paid}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h6 className="card-title">Total Referrals</h6>
              <p className="fs-5">{referralStats.total}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h6 className="card-title">Paid Referrals</h6>
              <p className="fs-5 text-success">{referralStats.paid}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h6 className="card-title">Unpaid Referrals</h6>
              <p className="fs-5 text-danger">{referralStats.unpaid}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentreDashboard;
