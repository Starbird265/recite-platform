'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import Link from 'next/link';

type ProfileType = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  // Add other profile fields here, e.g., name, avatar_url
};

type UserProgressType = {
  id: string;
  lesson_id: string;
  lessons: { title: string }; // Nested object for joined lesson title
  completed_at: string;
  quiz_score: number | null;
  quiz_total_questions: number | null;
};

const Profile = () => {
  const { user, streakCount, lastCompletedDate } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, name, phone')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        setName(profileData?.name || '');
        setPhone(profileData?.phone || '');

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*, lessons(title)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (progressError) throw progressError;
        setUserProgress(progressData || []);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch profile or progress.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndProgress();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!user) throw new Error('User not found.');
      const { error } = await supabase
        .from('profiles')
        .update({ name, phone })
        .eq('id', user.id);
      if (error) throw error;
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      // Refetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, name, phone')
        .eq('id', user.id)
        .single();
      setProfile(profileData);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in to view your profile.</div>;
  if (!profile) return <div>Profile not found.</div>;

  // If name or phone is missing, show the form
  if (!profile.name || !profile.phone || editMode) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <h2 className="card-title text-center mb-3">Complete Your Profile</h2>
                <p className="text-center text-muted mb-4">To continue, please provide your full name and phone number. <span className='text-danger'>*</span> Required fields</p>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <form onSubmit={handleSave} autoComplete="off">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-bold">Name <span className='text-danger'>*</span></label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-bold">Phone <span className='text-danger'>*</span></label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-2" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>User Profile</h2>
        </div>
        <div className="card-body">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Current Streak:</strong> {streakCount !== null ? streakCount : 'N/A'} days</p>
          <p><strong>Last Completed:</strong> {lastCompletedDate ? new Date(lastCompletedDate).toLocaleDateString() : 'N/A'}</p>

          <h4 className="mt-4">Your Progress</h4>
          {userProgress.length > 0 ? (
            <ul className="list-group">
              {userProgress.map((progress) => (
                <li key={progress.id} className="list-group-item">
                  <strong>Lesson:</strong> {progress.lessons?.title || 'N/A'} (Completed on: {new Date(progress.completed_at).toLocaleDateString()})
                  {progress.quiz_score !== null && progress.quiz_total_questions !== null && (
                    <p className="mb-0">Quiz Score: {progress.quiz_score}/{progress.quiz_total_questions}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No progress recorded yet. Start learning!</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
