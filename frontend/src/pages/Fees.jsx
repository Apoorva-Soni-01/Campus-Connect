import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';

const statusBadge = { paid: 'badge-green', unpaid: 'badge-amber', overdue: 'badge-red' };

const emptyForm = { student: '', semester: 1, amount: '', dueDate: '' };

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = () => api.get('/fees').then((res) => setFees(res.data));

  useEffect(() => {
    load();
    api.get('/users', { params: { role: 'student', limit: 200 } }).then((res) => setStudents(res.data.users));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/fees', form);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create fee record');
    }
  };

  const markPaid = async (id) => {
    await api.put(`/fees/${id}/pay`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Fee Record</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Student</th><th>Semester</th><th>Amount</th><th>Due Date</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f._id}>
                <td className="font-medium">{f.student?.name} ({f.student?.rollNo})</td>
                <td>{f.semester}</td>
                <td>₹{f.amount}</td>
                <td>{new Date(f.dueDate).toLocaleDateString()}</td>
                <td><span className={`badge ${statusBadge[f.status]}`}>{f.status}</span></td>
                <td className="text-right">
                  {f.status !== 'paid' && <button onClick={() => markPaid(f._id)} className="btn-secondary">Mark Paid</button>}
                </td>
              </tr>
            ))}
            {fees.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-6">No fee records yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title="Add Fee Record" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Student</label>
              <select required className="input" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })}>
                <option value="">Select</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.rollNo})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Semester</label>
                <input type="number" min={1} max={12} required className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Amount (₹)</label>
                <input type="number" min={0} required className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Due date</label>
              <input type="date" required className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary w-full">Add fee record</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const StudentFees = () => {
  const [fees, setFees] = useState([]);

  const load = () => api.get('/fees').then((res) => setFees(res.data));
  useEffect(() => { load(); }, []);

  const pay = async (id) => {
    if (!window.confirm('Simulate payment for this fee?')) return;
    await api.put(`/fees/${id}/pay`);
    load();
  };

  return (
    <div className="card overflow-x-auto">
      <table className="data-table">
        <thead><tr><th>Semester</th><th>Amount</th><th>Due Date</th><th>Status</th><th className="text-right">Action</th></tr></thead>
        <tbody>
          {fees.map((f) => (
            <tr key={f._id}>
              <td>{f.semester}</td>
              <td>₹{f.amount}</td>
              <td>{new Date(f.dueDate).toLocaleDateString()}</td>
              <td><span className={`badge ${statusBadge[f.status]}`}>{f.status}</span></td>
              <td className="text-right">
                {f.status !== 'paid' && <button onClick={() => pay(f._id)} className="btn-primary">Pay Now</button>}
              </td>
            </tr>
          ))}
          {fees.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-6">No fee records yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const Fees = () => {
  const { user } = useAuth();
  return user.role === 'admin' ? <AdminFees /> : <StudentFees />;
};

export default Fees;
