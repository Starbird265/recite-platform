'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

type LessonType = {
  id: string;
  title: string;
  content: string;
  status: string; // e.g., 'draft', 'pending_review', 'approved', 'rejected'
};

const ManageLessons = () => {
  const [lessons, setLessons] = useState<LessonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('lessons').select('*');
      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch lessons.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        fetchLessons(); // Refresh list
      } catch (error: any) {
        setError(error.message || 'Failed to delete lesson.');
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('lessons').update({ status }).eq('id', id);
      if (error) throw error;
      fetchLessons(); // Refresh list
    } catch (error: any) {
      setError(error.message || 'Failed to update lesson status.');
    }
  };

  if (loading) return <div>Loading lessons...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Manage Lessons</h2></div>
        <div className="card-body">
          <Link href="/create-lesson" className="btn btn-primary mb-3">Create New Lesson</Link>
          {lessons.length > 0 ? (
            <ul className="list-group">
              {lessons.map((lesson) => (
                <li key={lesson.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{lesson.title} <span className={`badge bg-${lesson.status === 'approved' ? 'success' : lesson.status === 'pending_review' ? 'warning' : 'danger'}`}>{lesson.status}</span></h5>
                    <p className="text-muted">{lesson.content.substring(0, 100)}...</p>
                  </div>
                  <div>
                    {lesson.status !== 'approved' && (
                      <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdateStatus(lesson.id, 'approved')}>Approve</button>
                    )}
                    {lesson.status !== 'rejected' && (
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleUpdateStatus(lesson.id, 'rejected')}>Reject</button>
                    )}
                    <Link href={`/edit-lesson/${lesson.id}`} className="btn btn-secondary btn-sm me-2">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lesson.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons found.</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/admin/content-management" className="btn btn-primary">Back to Content Management</Link>
        </div>
      </div>
    </div>
  );
};

export default ManageLessons;
