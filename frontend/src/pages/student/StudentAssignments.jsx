import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonTable } from '../../components/Skeletons';
import { BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentAssignments() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/v1/student/assignments');
      setAssignments(response.data);
    } catch (err) {
      showToast('Failed to load assignments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
        <SkeletonTable />
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
        <h2 className="text-2xl font-bold font-sans tracking-tight">Assignments Board</h2>
        <p className="text-xs text-slate-400">View upcoming homework tasks, submissions, and grades.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2.5 font-bold">Assignment Title</th>
                <th className="py-2.5 font-bold">Subject</th>
                <th className="py-2.5 font-bold">Due Date</th>
                <th className="py-2.5 font-bold">Earned Score</th>
                <th className="py-2.5 font-bold">Max Points</th>
                <th className="py-2.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3.5 font-semibold text-slate-200">{a.title}</td>
                  <td className="py-3.5 text-slate-400">{a.subject}</td>
                  <td className="py-3.5">{a.due_date}</td>
                  <td className="py-3.5 font-bold">{a.status === 'Graded' ? a.score : '—'}</td>
                  <td className="py-3.5 text-slate-400">{a.max_score}</td>
                  <td className="py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 w-24 mx-auto ${
                      a.status === 'Graded'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : a.status === 'Submitted'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {a.status === 'Graded' && <CheckCircle className="h-3 w-3" />}
                      {a.status === 'Submitted' && <Clock className="h-3 w-3 animate-pulse" />}
                      {a.status === 'Pending' && <AlertCircle className="h-3 w-3" />}
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-medium">
                    No course assignments found in dataset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
