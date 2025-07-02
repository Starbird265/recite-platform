

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

type CourseType = {
  id: string;
  title: string;
};

const EditLesson = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Fetch lesson details
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();
        if (lessonError) throw lessonError;
        if (lessonData) {
          setTitle(lessonData.title);
          setContent(lessonData.content);
          setSelectedCourseId(lessonData.course_id || null);
        }

        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('id, title');
        if (coursesError) throw coursesError;
        setCourses(coursesData || []);

      } catch (error: any) {
        setError(error.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.from('lessons').update({ title, content, course_id: selectedCourseId }).eq('id', id);
      if (error) throw error;
      navigate(`/lesson/${id}`);
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
            <div className="mb-3">
              <label htmlFor="course" className="form-label">Course</label>
              <select
                className="form-control"
                id="course"
                value={selectedCourseId || ''}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">No Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Lesson'}
            </button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(`/lesson/${id}`)}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLesson;

