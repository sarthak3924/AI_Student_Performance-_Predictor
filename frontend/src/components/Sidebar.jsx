import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Brain, 
  MessageSquare, 
  BookOpen, 
  FileSpreadsheet, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Activity, 
  Database,
  CalendarCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    switch (role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'AI Predictor', path: '/student/predictor', icon: Brain },
          { name: 'AI Advisor', path: '/student/advisor', icon: MessageSquare },
          { name: 'Assignments', path: '/student/assignments', icon: BookOpen },
          { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck }
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Students Roster', path: '/teacher/roster', icon: Users },
          { name: 'Record Marks', path: '/teacher/marks', icon: FileSpreadsheet },
          { name: 'At-Risk Alerts', path: '/teacher/alerts', icon: Brain }
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Users Register', path: '/admin/users', icon: Users },
          { name: 'Model Control', path: '/admin/models', icon: Brain },
          { name: 'System Monitor', path: '/admin/system', icon: Activity }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
        <div className="h-10 w-10 rounded-xl glow-btn flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold font-sans text-md leading-tight gradient-text font-extrabold tracking-wide">
            AI ACADEMY
          </h1>
          <p className="text-xs text-slate-400">Student Analytics</p>
        </div>
      </div>

      {/* User Information */}
      {user && (
        <div className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/30 rounded-2xl p-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 flex items-center justify-center font-bold font-sans text-lg">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-semibold text-sm truncate">{user.full_name}</h2>
            <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              {role}
            </p>
          </div>
        </div>
      )}

      {/* Nav Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 border border-purple-500/30 text-purple-300 shadow-neon-glow'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer block */}
      <div className="mt-auto border-t border-slate-800 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-400">Switch Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 rounded-xl transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-20">
        {sidebarContent}
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 text-white px-4 py-3 fixed top-0 left-0 w-full z-20">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-purple-400" />
          <span className="font-bold text-sm tracking-wide">AI ACADEMY</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded bg-slate-800 text-slate-200"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-10 flex">
          <div className="w-64 h-full pt-14">
            {sidebarContent}
          </div>
          <div
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-black/60 backdrop-blur-xs"
          />
        </div>
      )}
    </>
  );
}
