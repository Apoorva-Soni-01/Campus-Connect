import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const emptyForm = { department: '', semester: 1, day: 'Monday', startTime: '09:00', endTime: '10:00', course: '', faculty: '', room: '' };

const AdminTimetable = () => {
  const [slots, setSlots] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [deptFilter, setDeptFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = (dept) => api.get('/timetable', { params: dept ? { department: dept } : {} }).then((res) => setSlots(res.data));

  useEffect(() => {
    api.get('/departments').then((res) => setDepartments(res.data));
    api.get('/courses').then((res) => setCourses(res.data));
    api.get('/users', { params: { role: 'faculty', limit: 100 } }).then((res) => setFacultyList(res.data.users));
  }, []);

  useEffect(() => { load(deptFilter); }, [deptFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/timetable', form);
      setModalOpen(false);
      setForm(emptyForm);
      load(deptFilter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable slot?')) return;
    await api.delete(`/timetable/${id}`);
    load(deptFilter);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <select className="input max-w-[200px]" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.code}</option>)}
        </select>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Slot</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Faculty</th><th>Dept / Sem</th><th>Room</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s._id}>
                <td>{s.day}</td>
                <td>{s.startTime} - {s.endTime}</td>
                <td>{s.course?.code}</td>
                <td>{s.faculty?.name}</td>
                <td>{s.department?.code} / Sem {s.semester}</td>
                <td>{s.room}</td>
                <td className="text-right"><button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {slots.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-6">No timetable slots yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title="Add Timetable Slot" onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Department</label>
                <select required className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.code}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Semester</label>
                <input type="number" min={1} max={12} required className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Day</label>
                <select className="input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Start time</label>
                <input type="time" required className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">End time</label>
                <input type="time" required className="input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Course</label>
                <select required className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                  <option value="">Select</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Faculty</label>
                <select required className="input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                  <option value="">Select</option>
                  {facultyList.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Room</label>
              <input className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary w-full">Add slot</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const ViewOnlyTimetable = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => { api.get('/timetable').then((res) => setSlots(res.data)); }, []);

  const byDay = days.map((day) => ({ day, slots: slots.filter((s) => s.day === day) }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {byDay.map(({ day, slots: daySlots }) => (
        <div key={day} className="card p-4">
          <h3 className="font-medium text-gray-800 mb-3">{day}</h3>
          {daySlots.length === 0 ? (
            <p className="text-sm text-gray-400">No classes</p>
          ) : (
            <ul className="space-y-2">
              {daySlots.map((s) => (
                <li key={s._id} className="text-sm border-l-2 border-brand-500 pl-2">
                  <p className="font-medium text-gray-800">{s.course?.code} — {s.course?.name}</p>
                  <p className="text-gray-500">{s.startTime} - {s.endTime} · {s.room} · {s.faculty?.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

const Timetable = () => {
  const { user } = useAuth();
  return user.role === 'admin' ? <AdminTimetable /> : <ViewOnlyTimetable />;
};

export default Timetable;
