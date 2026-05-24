import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonCard } from '../../components/Skeletons';
import { ShieldAlert, AlertTriangle, MessageSquare, Mail, Sparkles, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeacherAlerts() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [weakStudents, setWeakStudents] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/v1/teacher/weak-students');
      setWeakStudents(response.data);
    } catch (err) {
      showToast('Failed to load risk alert listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInterventionSend = (email) => {
    showToast(`Dispatched warning alert notification and tutorial invitation to ${email}.`, 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight">At-Risk Alerts</h2>
        <p className="text-xs text-slate-400">Proactively engage students flagged for high academic risk profiles.</p>
      </div>

      <div className="space-y-4">
        {weakStudents.map((s) => (
          <div 
            key={s.id} 
            className={`glass-card p-6 rounded-2xl border flex flex-col md:flex-row justify-between gap-6 ${
              s.risk_level === 'High' 
                ? 'border-rose-500/30 bg-rose-950/10' 
                : 'border-amber-500/20 bg-amber-950/5'
            }`}
          >
            {/* Info details */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <span className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                  s.risk_level === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {s.risk_level === 'High' ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">{s.name} ({s.student_ref_id})</h3>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{s.course}</span>
                </div>
              </div>

              {/* Grid performance outputs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-3">
                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Predicted Grade</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{s.predicted_score}%</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">ML Confidence</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{Math.round(s.confidence_score * 100)}%</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">AI Diagnosis</span>
                  <span className="text-[10px] text-slate-300 mt-0.5 block truncate" title={s.recommendations}>{s.recommendations}</span>
                </div>
              </div>

              {/* Strategy */}
              <div className="text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                <span className="font-bold text-purple-400 uppercase tracking-wider text-[8px] block">Active Counselor Roadmap</span>
                <p className="text-slate-300 mt-1">{s.improvement_strategy}</p>
              </div>

            </div>

            {/* Quick intervention actions */}
            <div className="flex flex-col justify-between items-stretch md:items-end w-full md:w-48 gap-4 shrink-0">
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider border text-center w-full ${
                s.risk_level === 'High' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/40 shadow-sm' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {s.risk_level.toUpperCase()} ACADEMIC RISK
              </span>

              <div className="space-y-2 w-full">
                <button
                  onClick={() => handleInterventionSend(s.email)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-100 text-xs font-bold border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                >
                  <Mail className="h-4 w-4 text-purple-400" /> Email Advisory Map
                </button>
                <button
                  onClick={() => handleInterventionSend(s.email)}
                  className="w-full py-2.5 rounded-xl glow-btn text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> Trigger Warning Flag
                </button>
              </div>
            </div>

          </div>
        ))}

        {weakStudents.length === 0 && (
          <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Perfect Standing!</h4>
              <p className="text-xs text-slate-400 mt-1">No students are currently flagged as High or Medium risk in the system.</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
