'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({ centres: 0, pending: 0, students: 0, revenue: 0 });
  const [analytics, setAnalytics] = useState({ engagement: 0, conversion: 0, revenue: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      // Fetch total centres
      const { data: centresData } = await supabase.from('centres').select('id');
      // Fetch pending approvals
      const { data: pendingData } = await supabase.from('centres').select('id').eq('status', 'pending');
      // Fetch total students
      const { data: studentsData } = await supabase.from('profiles').select('id');
      // Fetch total revenue
      const { data: paymentsData } = await supabase.from('payments').select('amount');
      const revenue = (paymentsData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      setSummary({
        centres: (centresData || []).length,
        pending: (pendingData || []).length,
        students: (studentsData || []).length,
        revenue,
      });
    };
    const fetchAnalytics = async () => {
      // Engagement: % of students with >3 lessons completed
      const { data: progressData } = await supabase.from('user_progress').select('user_id, lesson_id');
      const { data: studentsData } = await supabase.from('profiles').select('id');
      const studentIds = new Set((studentsData || []).map((s: any) => s.id));
      const progressByUser: Record<string, number> = {};
      (progressData || []).forEach((p: any) => {
        progressByUser[p.user_id] = (progressByUser[p.user_id] || 0) + 1;
      });
      const engaged = Object.values(progressByUser).filter((count) => count > 3).length;
      const engagement = studentIds.size > 0 ? Math.round((engaged / studentIds.size) * 100) : 0;
      // Conversion: % of students who paid
      const { data: paidData } = await supabase.from('payments').select('user_id');
      const paidUsers = new Set((paidData || []).map((p: any) => p.user_id));
      const conversion = studentIds.size > 0 ? Math.round((paidUsers.size / studentIds.size) * 100) : 0;
      // Revenue: already calculated
      setAnalytics({ engagement, conversion, revenue: summary.revenue });
    };
    fetchSummary();
    fetchAnalytics();
  }, [summary.revenue]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h1>Admin Dashboard</h1>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
        <div className="card-body">
          <h3 className="mb-3">Admin Actions</h3>
          <div className="list-group">
            <Link href="/admin/centre-approvals" className="list-group-item list-group-item-action">
              Manage Centre Approvals
            </Link>
            {/* Add more admin links here */}
            <Link href="/admin/content-management" className="list-group-item list-group-item-action">
              Content Management
            </Link>
            <Link href="/admin/payouts" className="list-group-item list-group-item-action">
              Payouts Management
            </Link>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6 className="card-title">Total Centres</h6>
              <p className="fs-4">{summary.centres}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6 className="card-title">Pending Approvals</h6>
              <p className="fs-4 text-warning">{summary.pending}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6 className="card-title">Total Students</h6>
              <p className="fs-4">{summary.students}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6 className="card-title">Total Revenue</h6>
              <p className="fs-4 text-success">₹{summary.revenue}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Analytics Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h6 className="card-title">Engagement</h6>
              <p className="fs-5">{analytics.engagement}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h6 className="card-title">Conversion</h6>
              <p className="fs-5 text-primary">{analytics.conversion}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h6 className="card-title">Revenue</h6>
              <p className="fs-5 text-success">₹{analytics.revenue}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
