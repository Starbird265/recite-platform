'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

const EditCourse = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch course.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.from('courses').update({ title, description }).eq('id', id);
      if (error) throw error;
      router.push('/admin/content-management/courses');
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading course...</div>;

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header"><h2>Edit Course</h2></div>
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
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Course'}
            </button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => router.push('/admin/content-management/courses')}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
