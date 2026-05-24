import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonTable } from '../../components/Skeletons';
import { Search, Filter, Calendar, BookOpen, AlertCircle, FileSpreadsheet, PlusCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeacherRoster() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Attendance logging modal states
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      const response = await axios.get('/api/v1/teacher/students');
      setStudents(response.data);
    } catch (err) {
      showToast('Failed to retrieve student roster.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || submittingAttendance) return;
    
    setSubmittingAttendance(true);
    try {
      await axios.post(`/api/v1/teacher/students/${selectedStudent.id}/attendance`, {
        student_id: selectedStudent.id,
        status: attendanceStatus,
        date: attendanceDate
      });
      showToast(`Logged '${attendanceStatus}' attendance for ${selectedStudent.name}.`, 'success');
      setAttendanceModal(false);
      fetchRoster(); // refresh rates
    } catch (err) {
      showToast('Failed to record attendance.', 'error');
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.student_ref_id.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'All' || s.course === courseFilter;
    const matchesRisk = riskFilter === 'All' || s.risk_level === riskFilter;
    
    return matchesSearch && matchesCourse && matchesRisk;
  });

  const getUniqueCourses = () => {
    const courses = students.map(s => s.course);
    return ['All', ...new Set(courses)];
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
        <h2 className="text-2xl font-bold font-sans tracking-tight">Student Roster</h2>
        <p className="text-xs text-slate-400">View detailed student profile indices, attendance parameters, and predictions.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or academic ID..."
            className="w-full glass-input pl-10 text-xs py-3"
          />
        </div>

        {/* Course Filter */}
        <div className="relative">
          <input 
            type="hidden" 
          />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full glass-input bg-slate-900 text-xs py-3"
          >
            {getUniqueCourses().map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Course Degrees' : c}</option>
            ))}
          </select>
        </div>

        {/* Risk Filter */}
        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full glass-input bg-slate-900 text-xs py-3"
          >
            <option value="All">All Risk Profiles</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

      </div>

      {/* Roster Grid Table */}
      <div className="glass-card p-6 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2.5 font-bold">Academic ID</th>
                <th className="py-2.5 font-bold">Full Name</th>
                <th className="py-2.5 font-bold">Degree / Course</th>
                <th className="py-2.5 font-bold">Semester</th>
                <th className="py-2.5 font-bold">Attendance Rate</th>
                <th className="py-2.5 font-bold">Predicted Grade</th>
                <th className="py-2.5 font-bold text-center">Risk status</th>
                <th className="py-2.5 font-bold text-center">Interventions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3.5 font-mono text-indigo-400">{s.student_ref_id}</td>
                  <td className="py-3.5 font-semibold text-slate-200">{s.name}</td>
                  <td className="py-3.5 text-slate-400">{s.course}</td>
                  <td className="py-3.5 text-slate-400">Sem {s.semester}</td>
                  <td className={`py-3.5 font-semibold ${s.attendance_rate >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.attendance_rate}%
                  </td>
                  <td className="py-3.5 font-bold">{s.predicted_score ? `${s.predicted_score}%` : '—'}</td>
                  <td className="py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      s.risk_level === 'High' 
                        ? 'text-rose-400 bg-rose-500/10' 
                        : s.risk_level === 'Medium'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {s.risk_level}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setAttendanceModal(true);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700/80 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                    >
                      Log Attendance
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 font-semibold">
                    No matching student profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal Dialog */}
      <AnimatePresence>
        {attendanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel p-6 border border-slate-700/40 rounded-2xl shadow-lg relative"
            >
              <h3 className="font-bold text-md mb-2">Record Daily Attendance</h3>
              <p className="text-xs text-slate-400 mb-4">
                Record presence indexes for student: <b className="text-purple-400">{selectedStudent?.name}</b>
              </p>

              <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Class Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Class Attendance Status</label>
                  <select
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value)}
                    className="glass-input bg-slate-900 text-xs"
                  >
                    <option value="Present">Present (100% compliance)</option>
                    <option value="Late">Late (80% compliance weight)</option>
                    <option value="Absent">Absent (0% compliance)</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setAttendanceModal(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg glow-btn text-white font-bold text-xs flex items-center justify-center gap-1"
                    disabled={submittingAttendance}
                  >
                    {submittingAttendance ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" /> Save Record
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
