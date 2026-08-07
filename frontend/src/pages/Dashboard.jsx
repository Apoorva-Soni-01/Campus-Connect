import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Users, GraduationCap, Building2, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';

const chartOptions = { responsive: true, plugins: { legend: { display: false } }, maintainAspectRatio: false };

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/admin').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-gray-500">Loading dashboard...</p>;

  const trendData = {
    labels: data.attendanceTrend.map((d) => d.date.slice(5)),
    datasets: [{ label: 'Attendance %', data: data.attendanceTrend.map((d) => d.percentage), borderColor: '#1d4ed8', backgroundColor: '#dbeafe', tension: 0.3 }],
  };
  const deptData = {
    labels: data.departmentWise.map((d) => d.department),
    datasets: [{ label: 'Students', data: data.departmentWise.map((d) => d.count), backgroundColor: '#2563eb' }],
  };
  const genderData = {
    labels: data.genderRatio.map((g) => g.gender),
    datasets: [{ data: data.genderRatio.map((g) => g.count), backgroundColor: ['#2563eb', '#f59e0b', '#94a3b8'] }],
  };
  const placementData = {
    labels: data.placementStats.map((p) => p.year),
    datasets: [{ label: 'Placed %', data: data.placementStats.map((p) => p.placedPercentage), backgroundColor: '#16a34a' }],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data.cards.totalStudents} icon={Users} accent="brand" />
        <StatCard label="Faculty" value={data.cards.totalFaculty} icon={GraduationCap} accent="green" />
        <StatCard label="Departments" value={data.cards.totalDepartments} icon={Building2} accent="amber" />
        <StatCard label="Courses" value={data.cards.totalCourses} icon={BookOpen} accent="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Attendance trend (last 14 days)</h3>
          <div className="h-56">{data.attendanceTrend.length ? <Line data={trendData} options={chartOptions} /> : <p className="text-sm text-gray-400">No attendance data yet.</p>}</div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Students by department</h3>
          <div className="h-56">{data.departmentWise.length ? <Bar data={deptData} options={chartOptions} /> : <p className="text-sm text-gray-400">No student data yet.</p>}</div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Gender ratio</h3>
          <div className="h-56 flex items-center justify-center">{data.genderRatio.length ? <Doughnut data={genderData} options={{ ...chartOptions, plugins: { legend: { display: true, position: 'bottom' } } }} /> : <p className="text-sm text-gray-400">No data yet.</p>}</div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Placement statistics</h3>
          <p className="text-xs text-gray-400 mb-2">Sample data — no placement module wired up yet</p>
          <div className="h-52"><Bar data={placementData} options={chartOptions} /></div>
        </div>
      </div>
    </div>
  );
};

const FacultyDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/faculty').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-gray-500">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Assigned Courses" value={data.assignedCoursesCount} icon={BookOpen} accent="brand" />
        <StatCard label="Attendance Pending Today" value={data.attendancePending.length} icon={Users} accent="amber" />
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Today's lectures</h3>
        {data.todaysLectures.length === 0 ? (
          <p className="text-sm text-gray-400">No lectures scheduled for today.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.todaysLectures.map((l) => (
              <li key={l._id} className="py-2 flex justify-between text-sm">
                <span>{l.course.code} — {l.course.name}</span>
                <span className="text-gray-500">{l.startTime} - {l.endTime} · {l.room}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Attendance not yet marked today</h3>
        {data.attendancePending.length === 0 ? (
          <p className="text-sm text-gray-400">All caught up.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {data.attendancePending.map((c) => (
              <li key={c._id} className="badge badge-amber">{c.code} — {c.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/student').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-gray-500">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Attendance" value={`${data.attendancePercentage}%`} icon={Users} accent={data.attendancePercentage < 75 ? 'red' : 'green'} />
        <StatCard label="CGPA" value={data.cgpa || '—'} icon={GraduationCap} accent="brand" />
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Today's classes</h3>
        {data.todaysClasses.length === 0 ? (
          <p className="text-sm text-gray-400">No classes scheduled for today.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.todaysClasses.map((c) => (
              <li key={c._id} className="py-2 flex justify-between text-sm">
                <span>{c.course.code} — {c.course.name} ({c.faculty.name})</span>
                <span className="text-gray-500">{c.startTime} - {c.endTime} · {c.room}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent notices</h3>
        {data.notices.length === 0 ? (
          <p className="text-sm text-gray-400">No notices yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.notices.map((n) => (
              <li key={n._id} className="py-2">
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-sm text-gray-500">{n.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'faculty') return <FacultyDashboard />;
  return <StudentDashboard />;
};

export default Dashboard;
