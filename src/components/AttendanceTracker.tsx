'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import Link from 'next/link';

type StudentType = {
  id: string;
  email: string;
  // Add other student profile fields as needed
};

type AttendanceRecord = {
  user_id: string;
  attended: boolean;
};

const AttendanceTracker = () => {
  const { centreId } = useAuth();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!centreId) {
        setLoading(false);
        setError('Centre ID not found. Cannot track attendance.');
        return;
      }
      try {
        // Fetch students registered at this centre
        const { data: registrations, error: regError } = await supabase
          .from('exam_registrations')
          .select('user_id')
          .eq('centre_id', centreId)
          .eq('payment_status', 'completed'); // Only consider paid registrations

        if (regError) throw regError;

        const studentIds = registrations?.map(reg => reg.user_id) || [];

        if (studentIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        const { data: studentProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', studentIds);

        if (profileError) throw profileError;
        setStudents(studentProfiles || []);

        // Fetch existing attendance for the selected date
        const { data: existingAttendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('user_id, attended')
          .eq('centre_id', centreId)
          .eq('session_date', selectedDate);

        if (attendanceError) throw attendanceError;

        const initialAttendance: Record<string, boolean> = {};
        existingAttendance?.forEach(record => {
          initialAttendance[record.user_id] = record.attended;
        });
        setAttendance(initialAttendance);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [centreId, selectedDate]);

  const handleAttendanceChange = (userId: string, attended: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: attended,
    }));
  };

  const handleSubmitAttendance = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const recordsToUpsert = students.map(student => ({
        user_id: student.id,
        centre_id: centreId,
        session_date: selectedDate,
        attended: attendance[student.id] || false, // Default to false if not explicitly marked
      }));

      const { error: upsertError } = await supabase.from('attendance').upsert(recordsToUpsert, { onConflict: 'user_id, session_date' });

      if (upsertError) throw upsertError;
      setMessage('Attendance recorded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to record attendance.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading attendance tracker...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Attendance Tracker</h2></div>
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label htmlFor="attendanceDate" className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control"
              id="attendanceDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {students.length > 0 ? (
            <ul className="list-group">
              {students.map((student) => (
                <li key={student.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{student.email}</h5>
                    {/* Display student name if available in profile */}
                  </div>
                  <div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`attendance-${student.id}`}
                        id={`attended-${student.id}`}
                        checked={attendance[student.id] === true}
                        onChange={() => handleAttendanceChange(student.id, true)}
                      />
                      <label className="form-check-label" htmlFor={`attended-${student.id}`}>Present</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`attendance-${student.id}`}
                        id={`absent-${student.id}`}
                        checked={attendance[student.id] === false}
                        onChange={() => handleAttendanceChange(student.id, false)}
                      />
                      <label className="form-check-label" htmlFor={`absent-${student.id}`}>Absent</label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No students registered at this centre yet.</p>
          )}

          <button className="btn btn-primary mt-3" onClick={handleSubmitAttendance} disabled={loading}>
            {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
        <div className="card-footer">
          <Link href="/centre" className="btn btn-secondary">Back to Centre Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
