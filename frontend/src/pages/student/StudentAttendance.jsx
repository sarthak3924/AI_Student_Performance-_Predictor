import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonTable } from '../../components/Skeletons';
import { Calendar, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentAttendance() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/v1/student/attendance');
      setRecords(response.data);
    } catch (err) {
      showToast('Failed to load attendance history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-20 justify-center"><CheckCircle2 className="h-3 w-3" /> Present</span>;
      case 'Late':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-20 justify-center"><AlertTriangle className="h-3 w-3" /> Late</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-20 justify-center"><XCircle className="h-3 w-3" /> Absent</span>;
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
        <h2 className="text-2xl font-bold font-sans tracking-tight">Attendance Ledger</h2>
        <p className="text-xs text-slate-400">Review class presence records and compliance thresholds.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2.5 font-bold">Academic Date</th>
                <th className="py-2.5 font-bold text-center">Status Flag</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3 font-semibold text-slate-200">{r.date}</td>
                  <td className="py-3 flex justify-center">{getStatusBadge(r.status)}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-slate-500 font-medium">
                    No attendance records found.
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
