import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonCard, SkeletonChart } from '../../components/Skeletons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, Calendar, Award, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeacherDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchClassAnalytics();
  }, []);

  const fetchClassAnalytics = async () => {
    try {
      const response = await axios.get('/api/v1/teacher/analytics/class');
      setAnalytics(response.data);
    } catch (err) {
      showToast('Failed to compile class dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
        <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  const {
    average_attendance,
    average_score,
    risk_distribution,
    rankings
  } = analytics || {};

  const highRiskCount = risk_distribution?.find(item => item.name === 'High Risk')?.value || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight">Teacher Console</h2>
        <p className="text-xs text-slate-400">Evaluate classroom metrics, attendance rates, and predictive analytics.</p>
      </div>

      {/* Roster stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Class Attendance</span>
            <span className="text-2xl font-bold font-sans block text-emerald-400">{average_attendance}%</span>
            <span className="text-[10px] text-slate-500">Department average threshold</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Predicted Grade Average</span>
            <span className="text-2xl font-bold font-sans block text-indigo-400">{average_score}%</span>
            <span className="text-[10px] text-slate-500">Based on ML inference calculations</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">High Risk Alerts</span>
            <span className={`text-2xl font-bold font-sans block ${highRiskCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {highRiskCount} Students
            </span>
            <span className="text-[10px] text-slate-500">Require academic intervention planning</span>
          </div>
          <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
            highRiskCount > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Distribution Pie Chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="font-semibold text-sm mb-4">Dropout Risk Distribution</h3>
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {risk_distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Legend */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{rankings?.length || 0}</span>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Students</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-xs mt-2">
            {risk_distribution?.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name} ({item.value})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Student Score Rankings Bar Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold text-sm mb-4">Class Performance Rank Grid</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankings?.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="predicted_score" fill="#6366F1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Class Rankings Board */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-sm mb-4">Student Rankings Dashboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2 font-bold">Rank</th>
                <th className="py-2 font-bold">Name</th>
                <th className="py-2 font-bold">Student ID</th>
                <th className="py-2 font-bold">Attendance</th>
                <th className="py-2 font-bold">Predicted score</th>
                <th className="py-2 font-bold text-center">Academic Risk</th>
              </tr>
            </thead>
            <tbody>
              {rankings?.map((r, idx) => (
                <tr key={r.student_id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3 font-mono font-bold text-indigo-400">#{idx + 1}</td>
                  <td className="py-3 font-semibold text-slate-200">{r.name}</td>
                  <td className="py-3 text-slate-400">{r.student_id}</td>
                  <td className="py-3">{r.attendance}%</td>
                  <td className="py-3 font-bold">{r.predicted_score}%</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      r.risk_level === 'High' 
                        ? 'text-rose-400 bg-rose-500/10' 
                        : r.risk_level === 'Medium'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {r.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
