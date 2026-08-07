import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, GraduationCap, BookOpen } from 'lucide-react';

const roles = [
  { key: 'admin', label: 'Admin', icon: ShieldCheck },
  { key: 'faculty', label: 'Faculty', icon: BookOpen },
  { key: 'student', label: 'Student', icon: GraduationCap },
];

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="w-12 h-12 rounded-lg bg-brand-600 text-white flex items-center justify-center mx-auto mb-3">
          <GraduationCap size={24} />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">CampusConnect</h1>
        <p className="text-sm text-gray-500 mb-8">Choose how you'd like to sign in</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {roles.map(({ key, label, description, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(`/login/${key}`)}
              className="card p-6 text-center hover:border-brand-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center mb-3 mx-auto">
                <Icon size={20} />
              </div>
              <p className="font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
