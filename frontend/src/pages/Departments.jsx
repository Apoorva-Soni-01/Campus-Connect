import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const emptyForm = { name: '', code: '' };

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = () => api.get('/departments').then((res) => setDepartments(res.data));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code }); setError(''); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/departments/${editing._id}`, form);
      else await api.post('/departments', form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? This cannot be undone.')) return;
    try {
      await api.delete(`/departments/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Department</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d._id}>
                <td className="font-medium">{d.code}</td>
                <td>{d.name}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(d)} className="text-gray-400 hover:text-brand-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(d._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {departments.length === 0 && <tr><td colSpan={3} className="text-center text-gray-400 py-6">No departments yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Department' : 'Add Department'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Code</label>
              <input required className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <button type="submit" className="btn-primary w-full">{editing ? 'Save changes' : 'Add department'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Departments;
