import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const titles = {
  '/dashboard': 'Dashboard',
  '/students': 'Student Management',
  '/faculty': 'Faculty Management',
  '/departments': 'Departments',
  '/courses': 'Courses',
  '/my-courses': 'My Subjects',
  '/attendance': 'Attendance',
  '/marks': 'Marks',
  '/timetable': 'Timetable',
  '/fees': 'Fees',
  '/notices': 'Notice Board',
  '/profile': 'My Profile',
};

const Layout = () => {
  const location = useLocation();
  const title = titles[location.pathname] || 'CampusConnect';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
