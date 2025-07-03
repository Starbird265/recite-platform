'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

type CourseType = {
  id: string;
  title: string;
  description: string;
};

const ManageCourses = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course? This will not delete associated lessons.')) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        fetchCourses(); // Refresh list
      } catch (error: any) {
        setError(error.message || 'Failed to delete course.');
      }
    }
  };

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Manage Courses</h2></div>
        <div className="card-body">
          <Link href="/create-course" className="btn btn-primary mb-3">Create New Course</Link>
          {courses.length > 0 ? (
            <ul className="list-group">
              {courses.map((course) => (
                <li key={course.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{course.title}</h5>
                    <p className="text-muted">{course.description.substring(0, 100)}...</p>
                  </div>
                  <div>
                    <Link href={`/edit-course/${course.id}`} className="btn btn-secondary btn-sm me-2">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No courses found.</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/admin/content-management" className="btn btn-primary">Back to Content Management</Link>
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;
