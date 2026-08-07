import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CalendarClock,
  Bell,
  Wallet,
  UserCircle,
  GraduationCap as CourseIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linksByRole = {
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/faculty', label: 'Faculty', icon: GraduationCap },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/timetable', label: 'Timetable', icon: CalendarClock },
    { to: '/fees', label: 'Fees', icon: Wallet },
    { to: '/notices', label: 'Notice Board', icon: Bell },
  ],
  faculty: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-courses', label: 'My Subjects', icon: CourseIcon },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/marks', label: 'Marks', icon: ClipboardList },
    { to: '/timetable', label: 'Timetable', icon: CalendarClock },
    { to: '/notices', label: 'Notice Board', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/marks', label: 'Marks', icon: ClipboardList },
    { to: '/timetable', label: 'Timetable', icon: CalendarClock },
    { to: '/fees', label: 'Fees', icon: Wallet },
    { to: '/notices', label: 'Notice Board', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <aside className="w-60 shrink-0 bg-sidebar text-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-700">
        <span className="text-white font-semibold text-lg">CampusConnect</span>
        <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role} portal</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
