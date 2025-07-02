'use client';

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

const CentreOnboarding = () => {
  const [centreName, setCentreName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not logged in.');

      const { error: insertError } = await supabase.from('centres').insert([
        {
          user_id: user.id,
          name: centreName,
          contact_person: contactPerson,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address: address,
          status: 'pending', // Initial status
        },
      ]);

      if (insertError) throw insertError;

      // Optionally update the user's profile role to 'centre' immediately or after admin approval
      const { error: profileUpdateError } = await supabase.from('profiles')
        .update({ role: 'centre' })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('Error updating profile role:', profileUpdateError);
        // Decide if you want to throw this error or just log it
      }

      setSuccess('Centre registration submitted successfully! Awaiting admin approval.');
      // Redirect after a short delay or on success
      setTimeout(() => router.push('/'), 3000);

    } catch (error: any) {
      setError(error.message || 'Failed to register centre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header"><h2>Centre Onboarding</h2></div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="centreName" className="form-label">Centre Name</label>
              <input type="text" className="form-control" id="centreName" value={centreName} onChange={(e) => setCentreName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="contactPerson" className="form-label">Contact Person</label>
              <input type="text" className="form-control" id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="contactEmail" className="form-label">Contact Email</label>
              <input type="email" className="form-control" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
              <input type="tel" className="form-control" id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <textarea className="form-control" id="address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Register Centre'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CentreOnboarding;
