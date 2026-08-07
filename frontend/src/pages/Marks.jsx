import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FacultyMarks = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [examType, setExamType] = useState('midsem');
  const [totalMarks, setTotalMarks] = useState(100);
  const [roster, setRoster] = useState([]);
  const [marks, setMarks] = useState({});
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
    api.get('/users', { params: { role: 'student', enrolledIn: courseId, limit: 100 } }).then((res) => setRoster(res.data.users));
    api.get('/marks', { params: { course: courseId } }).then((res) => {
      const existing = {};
      res.data.filter((m) => m.examType === examType).forEach((m) => { existing[m.student._id] = m.marksObtained; });
      setMarks(existing);
    });
  }, [courseId, examType]);

  const course = courses.find((c) => c._id === courseId);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = roster
        .filter((s) => marks[s._id] !== undefined && marks[s._id] !== '')
        .map((s) => ({ student: s._id, marksObtained: Number(marks[s._id]), totalMarks: Number(totalMarks) }));
      await api.post('/marks/bulk', { course: courseId, examType, semester: course?.semester, records });
      setMessage('Marks saved.');
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
          <label className="text-sm text-gray-600 mb-1 block">Exam type</label>
          <select className="input" value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option value="midsem">Mid Sem</option>
            <option value="endsem">End Sem</option>
            <option value="practical">Practical</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Total marks</label>
          <input type="number" className="input w-24" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={saving || !roster.length} className="btn-primary">{saving ? 'Saving...' : 'Save marks'}</button>
      </div>
      {message && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded inline-block">{message}</p>}

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Roll No.</th><th>Name</th><th>Marks Obtained</th></tr></thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s._id}>
                <td>{s.rollNo}</td>
                <td className="font-medium">{s.name}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={totalMarks}
                    className="input w-24"
                    value={marks[s._id] ?? ''}
                    onChange={(e) => setMarks({ ...marks, [s._id]: e.target.value })}
                  />
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

const StudentMarks = ({ user }) => {
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    api.get('/marks').then((res) => setMarks(res.data));
  }, [user]);

  const byCourse = marks.reduce((acc, m) => {
    const key = m.course._id;
    if (!acc[key]) acc[key] = { course: m.course, entries: {} };
    acc[key].entries[m.examType] = m;
    return acc;
  }, {});

  return (
    <div className="card overflow-x-auto">
      <table className="data-table">
        <thead><tr><th>Course</th><th>Mid Sem</th><th>End Sem</th><th>Practical</th></tr></thead>
        <tbody>
          {Object.values(byCourse).map(({ course, entries }) => (
            <tr key={course._id}>
              <td className="font-medium">{course.code} — {course.name}</td>
              {['midsem', 'endsem', 'practical'].map((type) => (
                <td key={type}>{entries[type] ? `${entries[type].marksObtained} / ${entries[type].totalMarks}` : '—'}</td>
              ))}
            </tr>
          ))}
          {Object.keys(byCourse).length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-6">No marks uploaded yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const Marks = () => {
  const { user } = useAuth();
  return user.role === 'faculty' ? <FacultyMarks user={user} /> : <StudentMarks user={user} />;
};

export default Marks;
