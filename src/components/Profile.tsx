'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import Link from 'next/link';

type ProfileType = {
  id: string;
  email: string;
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
          .select('id, email')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*, lessons(title)') // Select all from user_progress and lesson title from lessons table
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

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in to view your profile.</div>;
  if (!profile) return <div>Profile not found.</div>;

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
