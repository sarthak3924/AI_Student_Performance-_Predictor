import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentPredictor from './pages/student/StudentPredictor';
import StudentAdvisor from './pages/student/StudentAdvisor';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentAttendance from './pages/student/StudentAttendance';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherRoster from './pages/teacher/TeacherRoster';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherAlerts from './pages/teacher/TeacherAlerts';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminModels from './pages/admin/AdminModels';
import AdminSystem from './pages/admin/AdminSystem';

// 1. Role-Based Route Guard Wrapper
const ProtectedRoute = ({ allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// 2. Dashboard Layout wrapper
const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Nav */}
      <Sidebar />
      
      {/* Page Content viewport */}
      <div className="pl-0 lg:pl-64 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/predictor" element={<StudentPredictor />} />
            <Route path="/student/advisor" element={<StudentAdvisor />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
          </Route>
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/roster" element={<TeacherRoster />} />
            <Route path="/teacher/marks" element={<TeacherMarks />} />
            <Route path="/teacher/alerts" element={<TeacherAlerts />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/models" element={<AdminModels />} />
            <Route path="/admin/system" element={<AdminSystem />} />
          </Route>
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
