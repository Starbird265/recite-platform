'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';

type QuizType = {
  id: string;
  title: string;
  lesson_id?: string;
};

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('quizzes').select('*');
      if (error) throw error;
      setQuizzes(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This will also delete associated questions.')) {
      try {
        const { error } = await supabase.from('quizzes').delete().eq('id', id);
        if (error) throw error;
        fetchQuizzes(); // Refresh list
      } catch (error: any) {
        setError(error.message || 'Failed to delete quiz.');
      }
    }
  };

  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Manage Quizzes</h2></div>
        <div className="card-body">
          {/* Link to create new quiz - assuming a separate page for quiz creation/editing */}
          <Link href="/admin/content-management/quizzes/create" className="btn btn-primary mb-3">Create New Quiz</Link>
          {quizzes.length > 0 ? (
            <ul className="list-group">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{quiz.title}</h5>
                    {quiz.lesson_id && <p className="text-muted">Associated with Lesson ID: {quiz.lesson_id}</p>}
                  </div>
                  <div>
                    <Link href={`/admin/content-management/quizzes/edit/${quiz.id}`} className="btn btn-secondary btn-sm me-2">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(quiz.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No quizzes found.</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/admin/content-management" className="btn btn-primary">Back to Content Management</Link>
        </div>
      </div>
    </div>
  );
};

export default ManageQuizzes;
