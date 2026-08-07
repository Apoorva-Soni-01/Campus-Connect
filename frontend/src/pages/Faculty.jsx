import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const emptyForm = { name: '', email: '', password: '', employeeId: '', department: '' };

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const params = { role: 'faculty', page, limit: 10 };
    if (search) params.search = search;
    const res = await api.get('/users', { params });
    setFaculty(res.data.users);
    setTotal(res.data.total);
    setPages(res.data.pages);
  };

  useEffect(() => {
    api.get('/departments').then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({ name: f.name, email: f.email, employeeId: f.employeeId || '', department: f.department?._id || '' });
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
        await api.post('/users', { ...form, role: 'faculty' });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this faculty account?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Search name, employee ID..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 shrink-0">
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Employee ID</th><th>Email</th><th>Department</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {faculty.map((f) => (
              <tr key={f._id}>
                <td className="font-medium">{f.name}</td>
                <td>{f.employeeId}</td>
                <td>{f.email}</td>
                <td>{f.department?.code || '—'}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(f)} className="text-gray-400 hover:text-brand-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(f._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {faculty.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-6">No faculty found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{total} faculty member(s) total</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">Previous</button>
          <span className="px-2 py-1.5">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">Next</button>
        </div>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Faculty' : 'Add Faculty'} onClose={() => setModalOpen(false)}>
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
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Employee ID</label>
              <input required className="input" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Department</label>
              <select required className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.code}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">{editing ? 'Save changes' : 'Add faculty'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Faculty;
