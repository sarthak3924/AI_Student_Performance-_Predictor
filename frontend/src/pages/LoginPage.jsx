import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import BackgroundParticles from '../components/BackgroundParticles';
import { Eye, EyeOff, Lock, Mail, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('student'); // 'student', 'teacher', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const result = await login(email, password);
      showToast(`Welcome back! Successfully logged in.`, 'success');
      
      // Navigate based on logged in role
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderEmail = () => {
    if (activeRole === 'student') return 'jane@student.com (student123)';
    if (activeRole === 'teacher') return 'charles@academy.com (teacher123)';
    return 'admin@aiacademy.com (admin123)';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative p-6 overflow-hidden">
      {/* Background Neural Particles */}
      <BackgroundParticles />
      
      {/* Glow Circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[80px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md glass-panel border border-slate-700/35 rounded-3xl p-8 shadow-glass-dark relative overflow-hidden"
      >
        {/* Banner Decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
        
        {/* Logo/Title */}
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl glow-btn mx-auto flex items-center justify-center mb-3">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight">Access Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Select your administrative role below to proceed.</p>
        </div>

        {/* Role Select tabs */}
        <div className="flex bg-slate-950/60 p-1 border border-slate-800 rounded-xl mb-6">
          {['student', 'teacher', 'admin'].map((roleType) => (
            <button
              key={roleType}
              type="button"
              onClick={() => {
                setActiveRole(roleType);
                // Pre-fill demo credentials to help user easily test portals out-of-the-box!
                if (roleType === 'student') {
                  setEmail('jane@student.com');
                  setPassword('student123');
                } else if (roleType === 'teacher') {
                  setEmail('charles@academy.com');
                  setPassword('teacher123');
                } else {
                  setEmail('admin@aiacademy.com');
                  setPassword('admin123');
                }
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg uppercase tracking-wide transition-all duration-200 ${
                activeRole === roleType
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 shadow-neon-glow'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {roleType}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={getPlaceholderEmail()}
              className="w-full glass-input"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 flex justify-between items-center">
              <span>Password</span>
              <span 
                onClick={() => navigate('/forgot-password')}
                className="text-[10px] text-purple-400 hover:underline cursor-pointer font-medium"
              >
                Forgot Password?
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember me check */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-purple-500 h-4 w-4 rounded border-slate-700 bg-slate-900" 
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl glow-btn text-white font-bold text-sm tracking-wide mt-4 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Sign In as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              </>
            )}
          </button>
        </form>

        {/* Demo Warning Message */}
        <div className="mt-5 text-[10px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 text-center">
          <span className="font-bold text-purple-400">Demo Mode Active:</span> Demo credentials pre-filled when switching tabs.
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-purple-400 font-semibold hover:underline cursor-pointer"
          >
            Register Student/Teacher
          </span>
        </div>
      </motion.div>
    </div>
  );
}
