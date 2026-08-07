import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', rollNo: '', department: '', semester: 1, gender: '' };

const Students = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const params = { role: 'student', page, limit: 10 };
    if (search) params.search = search;
    if (deptFilter) params.department = deptFilter;
    const res = await api.get('/users', { params });
    setStudents(res.data.users);
    setTotal(res.data.total);
    setPages(res.data.pages);
  };

  useEffect(() => {
    api.get('/departments').then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, deptFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, rollNo: s.rollNo || '', department: s.department?._id || '', semester: s.semester || 1, gender: s.gender || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, form);
      } else {
        await api.post('/users', { ...form, role: 'student' });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this student account?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search name, roll no, email..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>
          <select className="input max-w-[160px]" value={deptFilter} onChange={(e) => { setPage(1); setDeptFilter(e.target.value); }}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.code}</option>)}
          </select>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 shrink-0">
            <Plus size={16} /> Add Student
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Roll No.</th><th>Email</th><th>Department</th><th>Semester</th>
              {isAdmin && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td className="font-medium">{s.name}</td>
                <td>{s.rollNo}</td>
                <td>{s.email}</td>
                <td>{s.department?.code || '—'}</td>
                <td>{s.semester}</td>
                {isAdmin && (
                  <td>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-brand-600"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-6">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{total} student(s) total</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">Previous</button>
          <span className="px-2 py-1.5">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">Next</button>
        </div>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Student' : 'Add Student'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email</label>
              <input type="email" required disabled={!!editing} className="input disabled:bg-gray-100" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {!editing && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Password</label>
                <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Roll number</label>
                <input required className="input" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Semester</label>
                <input type="number" min={1} max={12} required className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Department</label>
                <select required className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.code}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Gender</label>
                <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">{editing ? 'Save changes' : 'Add student'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Students;
