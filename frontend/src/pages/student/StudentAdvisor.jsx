import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChatbotPanel from '../../components/ChatbotPanel';
import { useToast } from '../../components/Toast';
import { SkeletonCard } from '../../components/Skeletons';
import { Sparkles, MessageSquare, ShieldAlert, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentAdvisor() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/v1/student/performance');
      setMetrics(response.data);
    } catch (err) {
      showToast('Failed to load student counselor context.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
        <SkeletonCard />
        <div className="h-96 bg-slate-800 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  const latestPred = metrics?.latest_prediction;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight">AI Advisor Counselor</h2>
        <p className="text-xs text-slate-400">Consult with our AI counselor regarding your grades, study plans, or risks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side Info Panel */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-slate-700/20 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-purple-400" /> Academic Standing
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                <span className="text-slate-400">Attendance Quotient</span>
                <span className={`font-bold ${metrics?.attendance_rate >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metrics?.attendance_rate}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                <span className="text-slate-400">Homework Average</span>
                <span className="font-bold text-slate-200">{metrics?.assignment_average}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                <span className="text-slate-400">Projected Final Grade</span>
                <span className="font-bold text-slate-200">
                  {latestPred?.predicted_score ? `${latestPred.predicted_score}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Dropout Risk Level</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  latestPred?.risk_level === 'High' 
                    ? 'text-rose-400 bg-rose-500/10' 
                    : latestPred?.risk_level === 'Medium'
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {latestPred?.risk_level || 'Low'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-700/20 text-xs text-slate-400 space-y-2.5">
            <h4 className="font-bold text-slate-300">Prompting Tips:</h4>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>Type <b className="text-purple-400">"Am I at risk?"</b> to examine predictive indicators.</li>
              <li>Ask <b className="text-purple-400">"How do I improve?"</b> for active study advice.</li>
              <li>Ask about <b className="text-purple-400">"sleep"</b> to check the impact of fatigue on GPA.</li>
              <li>Type <b className="text-purple-400">"attendance"</b> to check warnings.</li>
            </ul>
          </div>
        </div>

        {/* Right Side Chatbot */}
        <div className="lg:col-span-2">
          <ChatbotPanel />
        </div>

      </div>
    </motion.div>
  );
}
