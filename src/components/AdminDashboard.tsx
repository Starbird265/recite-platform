'use client';

import React from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

const AdminDashboard = () => {
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
    </div>
  );
};

export default AdminDashboard;
