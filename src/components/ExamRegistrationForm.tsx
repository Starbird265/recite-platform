'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

type CentreType = {
  id: string;
  name: string;
  address: string;
};

const ExamRegistrationForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [centres, setCentres] = useState<CentreType[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const { data, error } = await supabase
          .from('centres')
          .select('id, name, address')
          .eq('status', 'approved');

        if (error) throw error;
        setCentres(data || []);
        if (data && data.length > 0) {
          setSelectedCentreId(data[0].id); // Select first centre by default
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch centres.');
      } finally {
        setLoading(false);
      }
    };
    fetchCentres();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError('Please log in to register for an exam.');
      setLoading(false);
      return;
    }

    if (!selectedCentreId) {
      setError('Please select a centre.');
      setLoading(false);
      return;
    }

    try {
      // Insert exam registration record (initial status pending payment)
      const { data, error: insertError } = await supabase.from('exam_registrations').insert([
        {
          user_id: user.id,
          centre_id: selectedCentreId,
          registration_date: new Date().toISOString(),
          payment_status: 'pending',
          status: 'registered',
          centre_notified: false, // New field to track notification status
        },
      ]).select();

      if (insertError) throw insertError;

      if (data && data.length > 0) {
        // Redirect to payment page with registration ID
        router.push(`/payment?registrationId=${data[0].id}`);
      } else {
        throw new Error('Failed to create exam registration.');
      }

    } catch (error: any) {
      setError(error.message || 'Failed to register for exam.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading registration form...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header"><h2>Exam Registration</h2></div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="centreSelect" className="form-label">Select Exam Centre</label>
              <select
                className="form-control"
                id="centreSelect"
                value={selectedCentreId || ''}
                onChange={(e) => setSelectedCentreId(e.target.value)}
                required
              >
                {centres.length === 0 && <option value="">No centres available</option>}
                {centres.map((centre) => (
                  <option key={centre.id} value={centre.id}>
                    {centre.name} - {centre.address}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || centres.length === 0}>
              {loading ? 'Registering...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
        <div className="card-footer">
          <Link href="/" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ExamRegistrationForm;
