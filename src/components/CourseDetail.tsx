'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LessonType = {
  id: string;
  title: string;
};

type CourseType = {
  id: string;
  title: string;
  description: string;
};

const CourseDetail = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [course, setCourse] = useState<CourseType | null>(null);
  const [lessons, setLessons] = useState<LessonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch lessons associated with this course
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('course_id', id); // Assuming a 'course_id' column in your lessons table

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

      } catch (error: any) {
        setError(error.message || 'Failed to fetch course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!course) return <div>Course not found.</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>{course.title}</h2>
          <p className="text-muted">{course.description}</p>
        </div>
        <div className="card-body">
          <h3>Lessons in this Course</h3>
          {lessons.length > 0 ? (
            <ul className="list-group list-group-flush">
              {lessons.map((lesson) => (
                <li key={lesson.id} className="list-group-item">
                  <Link href={`/lesson/${lesson.id}`}>{lesson.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons found for this course.</p>
          )}
        </div>
        <div className="card-footer">
          <Link href="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
