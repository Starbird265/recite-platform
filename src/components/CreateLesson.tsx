
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

type CourseType = {
  id: string;
  title: string;
};

const CreateLesson = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generateMedia, setGenerateMedia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('id, title');
        if (error) throw error;
        setCourses(data || []);
        if (data && data.length > 0) {
          setSelectedCourseId(data[0].id); // Select the first course by default
        }
      } catch (error: any) {
        console.error('Error fetching courses:', error.message);
        // Optionally set an error state for courses
      }
    };
    fetchCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.from('lessons').insert([
        {
          title,
          content,
          course_id: selectedCourseId,
          ai_generated_prompt: aiPrompt || null, // Store AI prompt
          status: 'pending_review', // Set initial status
          // video_url: generateMedia ? '' : null, // Placeholder for generated media
          // audio_url: generateMedia ? '' : null, // Placeholder for generated media
        },
      ]);
      if (error) throw error;
      router.push('/');
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header"><h2>Create New Lesson</h2></div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleCreate}>
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
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="aiPrompt" className="form-label">AI Generation Prompt (Optional)</label>
              <textarea
                className="form-control"
                id="aiPrompt"
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Generate a 30-minute micro-lesson script about the basics of computer hardware."
              ></textarea>
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="generateMedia"
                checked={generateMedia}
                onChange={(e) => setGenerateMedia(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="generateMedia">
                Generate Video/Audio (Requires AI Prompt)
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lesson'}
            </button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => router.push('/')}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;
