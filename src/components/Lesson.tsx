
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

type LessonType = {
  id: string;
  title: string;
  content: string;
  quiz_id?: string; // Add quiz_id to LessonType
  status: string; // Add status to LessonType
};

const Lesson = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, streakCount, lastCompletedDate } = useAuth(); // Get current user and streak data
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchLessonAndProgress = async () => {
      if (!id) return;
      try {
        // Fetch lesson details
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*, quiz_id') // Select quiz_id
          .eq('id', id)
          .eq('status', 'approved') // Only fetch approved lessons
          .single();

        if (lessonError) throw lessonError;
        setLesson(lessonData);

        // Check if lesson is completed by current user
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('id')
            .eq('user_id', user.id)
            .eq('lesson_id', id)
            .single();

          if (progressError && progressError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw progressError;
          }
          setIsCompleted(!!progressData);
        }

      } catch (error: any) {
        setError(error.message || 'Failed to fetch lesson or progress.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndProgress();
  }, [id, user]);

  const handleMarkComplete = async () => {
    if (!user || !lesson) return;
    setLoading(true);
    try {
      // Record lesson completion
      const { error: progressError } = await supabase.from('user_progress').insert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed_at: new Date().toISOString(),
      });
      if (progressError) throw progressError;
      setIsCompleted(true);

      // Update streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let newStreak = 1;
      let newLastCompletedDate = today.toISOString();

      if (lastCompletedDate) {
        const prevCompletedDate = new Date(lastCompletedDate);
        prevCompletedDate.setHours(0, 0, 0, 0);

        if (prevCompletedDate.getTime() === yesterday.getTime()) {
          newStreak = (streakCount || 0) + 1;
        } else if (prevCompletedDate.getTime() === today.getTime()) {
          // Already completed today, streak remains same
          newStreak = streakCount || 0;
          newLastCompletedDate = lastCompletedDate; // Keep original last completed date
        } else {
          newStreak = 1; // Streak broken
        }
      }

      const { error: profileUpdateError } = await supabase.from('profiles').update({
        streak_count: newStreak,
        last_completed_date: newLastCompletedDate,
      }).eq('id', user.id);

      if (profileUpdateError) {
        console.error('Error updating streak:', profileUpdateError);
      }

    } catch (error: any) {
      setError(error.message || 'Failed to mark lesson as complete.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        navigate('/');
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
          {/* Placeholder for AI-generated video/audio content */}
          <div className="mb-3 p-3 bg-light border rounded">
            <p className="text-muted text-center">[Video/Audio Player for AI-generated lesson content will go here]</p>
            {/* Example: <video controls src={lesson.video_url} className="w-100"></video> */}
            {/* Example: <audio controls src={lesson.audio_url} className="w-100"></audio> */}
          </div>
          <p>{lesson.content}</p>
        </div>
        <div className="card-footer">
          {lesson.quiz_id && (
            <Link href={`/quiz/${lesson.quiz_id}`} className="btn btn-info me-2">Start Quiz</Link>
          )}
          {!isCompleted && user && (
            <button className="btn btn-success me-2" onClick={handleMarkComplete} disabled={loading}>
              Mark as Complete
            </button>
          )}
          {isCompleted && <span className="badge bg-success me-2">Completed!</span>}
          <Link href={`/edit-lesson/${lesson.id}`} className="btn btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger ms-2">Delete</button>
          <Link href="/" className="btn btn-primary ms-2">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
