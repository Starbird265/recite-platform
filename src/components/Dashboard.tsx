
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from './supabaseClient';

// Define a type for your lesson data
type LessonType = {
  id: string;
  title: string;
  status: string;
};

// Define a type for your course data
type CourseType = {
  id: string;
  title: string;
  description: string;
};

const Dashboard = () => {
  const [lessons, setLessons] = useState<LessonType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      } catch (error: any) {
        setError(error.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
