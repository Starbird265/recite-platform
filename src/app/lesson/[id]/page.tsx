'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LessonType = {
  id: string;
  title: string;
  content: string;
};

export default function LessonPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLesson(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch lesson.');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        router.push('/');
      } catch (error: any) {
        setError(error.message || 'Failed to delete lesson.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!lesson) return <div>Lesson not found.</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>{lesson.title}</h2>
        </div>
        <div className="card-body">
          <p>{lesson.content}</p>
        </div>
        <div className="card-footer">
          <Link href={`/edit-lesson/${lesson.id}`} className="btn btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger ms-2">Delete</button>
          <Link href="/" className="btn btn-primary ms-2">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
