'use client';

import React from 'react';
import Link from 'next/link';

const ContentManagement = () => {
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Content Management</h2></div>
        <div className="card-body">
          <p>Select the type of content you want to manage:</p>
          <div className="list-group">
            <Link href="/admin/content-management/lessons" className="list-group-item list-group-item-action">
              Manage Lessons
            </Link>
            <Link href="/admin/content-management/quizzes" className="list-group-item list-group-item-action">
              Manage Quizzes
            </Link>
            <Link href="/admin/content-management/courses" className="list-group-item list-group-item-action">
              Manage Courses
            </Link>
          </div>
        </div>
        <div className="card-footer">
          <Link href="/admin" className="btn btn-primary">Back to Admin Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
