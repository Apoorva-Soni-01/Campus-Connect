import React, { useState } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleMeta = {
  admin: { label: 'Admin', icon: ShieldCheck },
  faculty: { label: 'Faculty', icon: BookOpen },
  student: { label: 'Student', icon: GraduationCap },
};

const Login = () => {
  const { role } = useParams();
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!roleMeta[role]) return <Navigate to="/" replace />;
  const { label, icon: Icon } = roleMeta[role];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      if (loggedInUser.role !== role) {
        logout();
        setError(`That account isn't a ${label} account. Please use the correct login page.`);
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back to role selection
        </Link>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-brand-600 text-white flex items-center justify-center mb-3">
            <Icon size={24} />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">CampusConnect</h1>
          <p className="text-sm text-gray-500">{label} sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="text-brand-600 hover:underline">
              Forgot password?
            </Link>
            {role === 'student' && (
              <Link to="/register" className="text-brand-600 hover:underline">
                Create student account
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
