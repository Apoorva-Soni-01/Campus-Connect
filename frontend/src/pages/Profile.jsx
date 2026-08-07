import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef();

  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploading, setUploading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      await api.put(`/users/${user._id}`, form);
      await refreshUser();
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    setSavingPassword(true);
    try {
      const res = await api.put('/auth/change-password', passwordForm);
      setPasswordMessage(res.data.message);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await api.put(`/users/${user._id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="w-20 h-20 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 bg-brand-600 text-white p-1.5 rounded-full hover:bg-brand-700"
            title="Change photo"
          >
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500 capitalize">{user.role}{user.rollNo ? ` · ${user.rollNo}` : ''}{user.employeeId ? ` · ${user.employeeId}` : ''}</p>
          {uploading && <p className="text-xs text-brand-600 mt-1">Uploading photo...</p>}
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="card p-6 space-y-3">
        <h3 className="font-medium text-gray-800 mb-1">Edit profile</h3>
        {profileMessage && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">{profileMessage}</p>}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Email</label>
          <input className="input bg-gray-100" value={user.email} disabled />
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary">{savingProfile ? 'Saving...' : 'Save changes'}</button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card p-6 space-y-3">
        <h3 className="font-medium text-gray-800 mb-1">Change password</h3>
        {passwordError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{passwordError}</p>}
        {passwordMessage && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">{passwordMessage}</p>}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Current password</label>
          <input type="password" required className="input" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">New password</label>
          <input type="password" required minLength={6} className="input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
        </div>
        <button type="submit" disabled={savingPassword} className="btn-primary">{savingPassword ? 'Updating...' : 'Update password'}</button>
      </form>
    </div>
  );
};

export default Profile;
