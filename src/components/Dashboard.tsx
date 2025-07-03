import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';
import Quiz from './Quiz';

// Define a type for your lesson data
type LessonType = {
  id: string;
  title: string;
  status: string;
  content?: string;
};

// Define a type for your course data
type CourseType = {
  id: string;
  title: string;
  description: string;
};

const Dashboard = () => {
  const { user, streakCount } = useAuth();
  const [lessons, setLessons] = useState<LessonType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayLesson, setTodayLesson] = useState<LessonType | null>(null);
  const [marking, setMarking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase.from('lessons').select('*').eq('status', 'approved');
        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
        if (coursesError) throw coursesError;
        setCourses(coursesData || []);

        // Fetch user progress to determine today's lesson
        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id);
          const completedLessonIds = (progressData || []).map((p: any) => p.lesson_id);
          const nextLesson = (lessonsData || []).find((l: any) => !completedLessonIds.includes(l.id));
          setTodayLesson(nextLesson || null);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, success]);

  const handleMarkComplete = async () => {
    if (!user || !todayLesson) return;
    setMarking(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_progress')
        .insert({ user_id: user.id, lesson_id: todayLesson.id, completed_at: new Date().toISOString() });
      if (error) throw error;
      setSuccess(true);
      // If lesson has a quiz_id, show the quiz
      if ((todayLesson as any).quiz_id) {
        setCurrentQuizId((todayLesson as any).quiz_id);
        setShowQuiz(true);
      }
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to mark lesson as complete.');
    } finally {
      setMarking(false);
    }
  };

  if (showQuiz && currentQuizId) {
    return <Quiz quizId={currentQuizId} onComplete={() => { setShowQuiz(false); setCurrentQuizId(null); }} />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="container mt-4">
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h3 className="card-title">Today's Lesson</h3>
          {todayLesson ? (
            <>
              <h5 className="mt-2">{todayLesson.title}</h5>
              <p>{todayLesson.content}</p>
              <button className="btn btn-success mt-2" onClick={handleMarkComplete} disabled={marking || success}>
                {marking ? 'Marking...' : success ? 'Completed!' : 'Mark as Complete'}
              </button>
            </>
          ) : (
            <div className="text-success">You have completed all available lessons for now. Great job!</div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-primary fs-6">Streak: {streakCount || 0} days</span>
        </div>
      </div>
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">Dashboard</h1>
            <div>
              <Link href="/create-lesson" className="btn btn-primary me-2">Create Lesson</Link>
              <Link href="/create-course" className="btn btn-success me-2">Create Course</Link>
              <Link href="/profile" className="btn btn-info me-2">Profile</Link>
              <Link href="/payment" className="btn btn-warning me-2">Enroll Now</Link>
              <Link href="/exam-registration" className="btn btn-info me-2">Exam Registration</Link>
              <Link href="/chat" className="btn btn-secondary me-2">Doubt Chat</Link>
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        <div className="card-body">
          <h3 className="mt-4">Courses</h3>
          {courses.length > 0 ? (
            <ul className="list-group list-group-flush mb-4">
              {courses.map((course) => (
                <li key={course.id} className="list-group-item">
                  <Link href={`/course/${course.id}`}>{course.title}</Link>
                  <p className="text-muted">{course.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No courses found.</p>
          )}

          <h3>Lessons</h3>
          {lessons.length > 0 ? (
            <ul className="list-group list-group-flush">
              {lessons.map((lesson) => (
                <li key={lesson.id} className="list-group-item">
                  <Link href={`/lesson/${lesson.id}`}>{lesson.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
