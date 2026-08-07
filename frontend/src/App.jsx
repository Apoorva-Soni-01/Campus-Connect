import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Notices from './pages/Notices';
import Fees from './pages/Fees';
import Timetable from './pages/Timetable';
import Profile from './pages/Profile';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <RoleSelect />} />
      <Route path="/login/:role" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
      <Route path="/reset-password/:token" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<ProtectedRoute roles={['admin']}><Students /></ProtectedRoute>} />
        <Route path="/faculty" element={<ProtectedRoute roles={['admin']}><Faculty /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute roles={['admin']}><Departments /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute roles={['admin']}><Courses /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute roles={['faculty']}><MyCourses /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute roles={['faculty', 'student']}><Attendance /></ProtectedRoute>} />
        <Route path="/marks" element={<ProtectedRoute roles={['faculty', 'student']}><Marks /></ProtectedRoute>} />
        <Route path="/fees" element={<ProtectedRoute roles={['admin', 'student']}><Fees /></ProtectedRoute>} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
};

export default App;
