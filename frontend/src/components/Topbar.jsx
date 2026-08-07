import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        {user?.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <button onClick={logout} title="Log out" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
