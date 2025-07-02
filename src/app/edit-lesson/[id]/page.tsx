'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useRouter } from 'next/navigation';

const EditLessonPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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
        if (data) {
          setTitle(data.title);
          setContent(data.content);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch lesson.');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.from('lessons').update({ title, content }).eq('id', id);
      if (error) throw error;
      router.push(`/lesson/${id}`);
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header"><h2>Edit Lesson</h2></div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">Content</label>
              <textarea
                className="form-control"
                id="content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Lesson'}
            </button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => router.push(`/lesson/${id}`)}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLessonPage;
