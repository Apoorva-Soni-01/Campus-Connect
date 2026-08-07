import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';

const emptyForm = { title: '', message: '', targetRole: 'all' };

const Notices = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [notices, setNotices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = () => api.get('/notices').then((res) => setNotices(res.data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/notices', form);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await api.delete(`/notices/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Create Notice</button>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n._id} className="card p-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-medium text-gray-800">{n.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Posted by {n.createdBy?.name} · {new Date(n.createdAt).toLocaleDateString()}
                  {n.targetRole !== 'all' && <span className="badge badge-gray ml-2 capitalize">{n.targetRole} only</span>}
                </p>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(n._id)} className="text-gray-400 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>
              )}
            </div>
          </div>
        ))}
        {notices.length === 0 && <p className="text-center text-gray-400 py-6">No notices yet.</p>}
      </div>

      {modalOpen && (
        <Modal title="Create Notice" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Title</label>
              <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Message</label>
              <textarea required rows={4} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Audience</label>
              <select className="input" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="student">Students only</option>
                <option value="faculty">Faculty only</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Post notice</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Notices;
