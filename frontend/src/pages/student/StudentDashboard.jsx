import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../../components/Skeletons';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  FileText, TrendingUp, Calendar, GraduationCap, AlertTriangle, CheckCircle, Info, Download, Sparkles, BookOpen, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [perfData, setPerfData] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get('/api/v1/student/performance');
      setPerfData(response.data);
    } catch (err) {
      showToast('Failed to fetch academic analytics. Please check server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    showToast('Compiling metrics and rendering PDF report card...', 'info');
    
    try {
      const response = await axios.get('/api/v1/student/reports/download', {
        responseType: 'blob' // Important for binary files
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${perfData?.latest_prediction?.student_id || 'Student'}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Report card downloaded successfully.', 'success');
    } catch (err) {
      showToast('Failed to compile PDF report card.', 'error');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
        <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonTable />
      </div>
    );
  }

  const {
    attendance_rate,
    assignment_average,
    latest_prediction,
    gpa_trend,
    subject_performance,
    study_analytics,
    assignments
  } = perfData || {};

  const getRiskDetails = (risk) => {
    switch (risk) {
      case 'High':
        return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', icon: <AlertTriangle className="h-5 w-5" /> };
      case 'Medium':
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: <Info className="h-5 w-5" /> };
      default:
        return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: <CheckCircle className="h-5 w-5" /> };
    }
  };

  const risk = latest_prediction?.risk_level || 'Low';
  const riskMeta = getRiskDetails(risk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      {/* Header and Download Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight">Student Portal</h2>
          <p className="text-xs text-slate-400">Track and monitor your predicted academic outcomes.</p>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={downloadingReport}
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 hover:bg-slate-800 text-xs font-bold transition-all"
        >
          {downloadingReport ? (
            <span className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Download className="h-4 w-4 text-purple-400" />
          )}
          <span>Export Progress PDF</span>
        </button>
      </div>

      {/* Grid Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">GPA Index</span>
            <span className="text-2xl font-bold font-sans block text-indigo-400">
              {gpa_trend?.length > 0 ? gpa_trend[gpa_trend.length - 1].gpa : 'N/A'}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +4.2% since Sem 1
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Attendance Rate</span>
            <span className={`text-2xl font-bold font-sans block ${attendance_rate >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {attendance_rate}%
            </span>
            <span className="text-[10px] text-slate-400">Recommended threshold: 85%</span>
          </div>
          <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
            attendance_rate >= 85 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Assignment Avg</span>
            <span className="text-2xl font-bold font-sans block text-purple-400">
              {assignment_average}%
            </span>
            <span className="text-[10px] text-slate-400">Calculated over graded items</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Predicted Grade</span>
            <span className="text-2xl font-bold font-sans block text-blue-400">
              {latest_prediction?.predicted_score ? `${latest_prediction.predicted_score}%` : 'Pending Run'}
            </span>
            <span className="text-[10px] text-slate-400">Inference Confidence: {latest_prediction ? `${round(latest_prediction.confidence_score * 100, 1)}%` : 'N/A'}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* AI Risk Alert Banner */}
      {latest_prediction && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${riskMeta.color}`}>
          <div className="mt-0.5">{riskMeta.icon}</div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Predictive Risk Level: {risk.toUpperCase()} RISK</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <b>AI Counsel Recommendation:</b> {latest_prediction.recommendations}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Active Strategy: {latest_prediction.improvement_strategy}
            </p>
          </div>
        </div>
      )}

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Timeline */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold text-sm mb-4">GPA Semester Progress Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpa_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 4.0]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Line type="monotone" dataKey="gpa" stroke="#6366F1" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly study time */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold text-sm mb-4">Weekly Study Schedule Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={study_analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="hours" fill="url(#purpleGlow)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Breakdown chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-sm mb-4">Subject performance Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subject_performance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={10} width={130} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="score" fill="#3B82F6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Assignments Checklist */}
      <div className="glass-card p-6 rounded-2xl overflow-hidden">
        <h3 className="font-semibold text-sm mb-4">Course Assignment Board</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2.5 font-bold">Assignment Title</th>
                <th className="py-2.5 font-bold">Subject</th>
                <th className="py-2.5 font-bold">Grade Outcome</th>
                <th className="py-2.5 font-bold">Academic Due Date</th>
                <th className="py-2.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments?.map((a) => (
                <tr key={a.id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3 font-semibold">{a.title}</td>
                  <td className="py-3 text-slate-400">{a.subject}</td>
                  <td className="py-3">{a.status === 'Graded' ? `${a.score}/${a.max_score}` : 'N/A'}</td>
                  <td className="py-3">{a.due_date}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'Graded' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : a.status === 'Submitted'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {a.status}
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

// Utility rounding
function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
