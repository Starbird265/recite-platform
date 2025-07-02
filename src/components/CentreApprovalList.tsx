'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

type CentreType = {
  id: string;
  name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  status: string;
  user_id: string;
};

const CentreApprovalList = () => {
  const [pendingCentres, setPendingCentres] = useState<CentreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingCentres();
  }, []);

  const fetchPendingCentres = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('centres')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;
      setPendingCentres(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch pending centres.');
    } finally {
      setLoading(false);
    }
  };

  const updateCentreStatus = async (centreId: string, userId: string, newStatus: string) => {
    try {
      // Update centre status
      const { error: centreError } = await supabase
        .from('centres')
        .update({ status: newStatus })
        .eq('id', centreId);

      if (centreError) throw centreError;

      // If approved, update the user's profile to link to this centre
      if (newStatus === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ centre_id: centreId })
          .eq('id', userId);

        if (profileError) throw profileError;
      }

      fetchPendingCentres(); // Refresh the list
    } catch (error: any) {
      setError(error.message || 'Failed to update centre status.');
    }
  };

  if (loading) return <div>Loading pending centres...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>Centre Approval Requests</h2>
        </div>
        <div className="card-body">
          {pendingCentres.length > 0 ? (
            <ul className="list-group">
              {pendingCentres.map((centre) => (
                <li key={centre.id} className="list-group-item">
                  <h5>{centre.name}</h5>
                  <p>Contact: {centre.contact_person} ({centre.contact_email}, {centre.contact_phone})</p>
                  <p>Address: {centre.address}</p>
                  <p>Status: {centre.status}</p>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => updateCentreStatus(centre.id, centre.user_id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => updateCentreStatus(centre.id, centre.user_id, 'rejected')}
                  >
                    Reject
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending centre approval requests.</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/admin" className="btn btn-primary">Back to Admin Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default CentreApprovalList;
