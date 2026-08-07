import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const emptyForm = { code: '', name: '', department: '', credits: 4, semester: 1, schedule: '', instructor: '' };

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = () => api.get('/courses').then((res) => setCourses(res.data));

  useEffect(() => {
    load();
    api.get('/departments').then((res) => setDepartments(res.data));
    api.get('/users', { params: { role: 'faculty', limit: 100 } }).then((res) => setFacultyList(res.data.users));
  }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, name: c.name, department: c.department?._id || '', credits: c.credits,
      semester: c.semester, schedule: c.schedule || '', instructor: c.instructor?._id || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, instructor: form.instructor || undefined };
      if (editing) await api.put(`/courses/${editing._id}`, payload);
      else await api.post('/courses', payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Course</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th>Department</th><th>Semester</th><th>Credits</th><th>Instructor</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id}>
                <td className="font-medium">{c.code}</td>
                <td>{c.name}</td>
                <td>{c.department?.code || '—'}</td>
                <td>{c.semester}</td>
                <td>{c.credits}</td>
                <td>{c.instructor?.name || <span className="text-gray-400">Unassigned</span>}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-brand-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-6">No courses yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Course' : 'Add Course'} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Course code</label>
                <input required className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Course name</label>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
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
                <label className="text-sm text-gray-600 mb-1 block">Credits</label>
                <input type="number" min={1} max={10} required className="input" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Schedule</label>
                <input placeholder="e.g. Mon/Wed 10-11" className="input" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Instructor</label>
                <select className="input" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })}>
                  <option value="">Unassigned</option>
                  {facultyList.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">{editing ? 'Save changes' : 'Add course'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Courses;
