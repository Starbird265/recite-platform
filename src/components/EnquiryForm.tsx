'use client';

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const EnquiryForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enquiryId, setEnquiryId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnquiryId(null);
    setLoading(true);

    try {
      // Insert enquiry data into Supabase
      const { data, error: insertError } = await supabase.from('enquiries').insert([
        {
          name,
          email,
          phone,
          status: 'new', // Initial status for the enquiry
        },
      ]).select(); // Select the inserted row to get the generated ID

      if (insertError) throw insertError;

      if (data && data.length > 0) {
        setEnquiryId(data[0].id); // Assuming Supabase generates a UUID for 'id'
      } else {
        throw new Error('Failed to retrieve enquiry ID.');
      }

    } catch (error: any) {
      setError(error.message || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header"><h2>Student Enquiry</h2></div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {enquiryId ? (
                <div className="alert alert-success">
                  <p>Thank you for your enquiry! Your Enquiry ID is: <strong>{enquiryId}</strong></p>
                  <p>Please keep this ID for future reference.</p>
                  <p>We will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Enquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;
