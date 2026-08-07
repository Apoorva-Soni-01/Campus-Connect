import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses', { params: { instructor: user._id } }).then((res) => setCourses(res.data));
  }, [user]);

  return (
    <div className="card overflow-x-auto">
      <table className="data-table">
        <thead><tr><th>Code</th><th>Name</th><th>Department</th><th>Semester</th><th>Credits</th><th>Schedule</th></tr></thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c._id}>
              <td className="font-medium">{c.code}</td>
              <td>{c.name}</td>
              <td>{c.department?.code || '—'}</td>
              <td>{c.semester}</td>
              <td>{c.credits}</td>
              <td>{c.schedule || '—'}</td>
            </tr>
          ))}
          {courses.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-6">No subjects assigned yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default MyCourses;
