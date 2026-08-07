import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FacultyAttendance = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/courses', { params: { instructor: user._id } }).then((res) => {
      setCourses(res.data);
      if (res.data.length) setCourseId(res.data[0]._id);
    });
  }, [user]);

  useEffect(() => {
    if (!courseId) return;
    setMessage('');
    Promise.all([
      api.get('/users', { params: { role: 'student', enrolledIn: courseId, limit: 100 } }),
      api.get('/attendance', { params: { course: courseId, date } }),
    ]).then(([rosterRes, attRes]) => {
      setRoster(rosterRes.data.users);
      const existing = {};
      attRes.data.forEach((a) => { existing[a.student._id] = a.status; });
      setStatuses(existing);
    });
  }, [courseId, date]);

  const toggle = (studentId, status) => setStatuses((s) => ({ ...s, [studentId]: status }));

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = roster.map((s) => ({ student: s._id, status: statuses[s._id] || 'absent' }));
      await api.post('/attendance', { course: courseId, date, records });
      setMessage('Attendance saved.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Course</label>
          <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
        </div>
        <button onClick={handleSave} disabled={saving || !roster.length} className="btn-primary">{saving ? 'Saving...' : 'Save attendance'}</button>
      </div>
      {message && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded inline-block">{message}</p>}

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Roll No.</th><th>Name</th><th>Status</th></tr></thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s._id}>
                <td>{s.rollNo}</td>
                <td className="font-medium">{s.name}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => toggle(s._id, 'present')} className={`btn ${statuses[s._id] === 'present' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Present</button>
                    <button onClick={() => toggle(s._id, 'absent')} className={`btn ${statuses[s._id] === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Absent</button>
                  </div>
                </td>
              </tr>
            ))}
            {roster.length === 0 && <tr><td colSpan={3} className="text-center text-gray-400 py-6">No students enrolled in this course.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StudentAttendance = ({ user }) => {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    api.get(`/attendance/student/${user._id}`).then((res) => setSummary(res.data.summary));
  }, [user]);

  return (
    <div className="card overflow-x-auto">
      <table className="data-table">
        <thead><tr><th>Course</th><th>Classes Held</th><th>Present</th><th>Percentage</th></tr></thead>
        <tbody>
          {summary.map((s) => (
            <tr key={s.course._id}>
              <td className="font-medium">{s.course.code} — {s.course.name}</td>
              <td>{s.total}</td>
              <td>{s.present}</td>
              <td>
                <span className={`badge ${s.percentage >= 75 ? 'badge-green' : 'badge-red'}`}>{s.percentage}%</span>
              </td>
            </tr>
          ))}
          {summary.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-6">No attendance recorded yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const Attendance = () => {
  const { user } = useAuth();
  return user.role === 'faculty' ? <FacultyAttendance user={user} /> : <StudentAttendance user={user} />;
};

export default Attendance;
