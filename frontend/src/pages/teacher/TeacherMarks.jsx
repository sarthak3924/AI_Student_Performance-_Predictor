import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonCard } from '../../components/Skeletons';
import { FileSpreadsheet, PlusCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeacherMarks() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  
  // Form states
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Graded');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/v1/teacher/students');
      setStudents(response.data);
      if (response.data.length > 0) {
        setStudentId(response.data[0].id); // set default selected
      }
    } catch (err) {
      showToast('Failed to load students roster for grading.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !title.trim() || score === '' || submitting) return;

    if (parseFloat(score) > parseFloat(maxScore)) {
      showToast("Score cannot exceed maximum points.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/v1/teacher/students/${studentId}/assignments`, {
        student_id: parseInt(studentId, 10),
        title,
        subject,
        score: parseFloat(score),
        max_score: parseFloat(maxScore),
        due_date: dueDate,
        status
      });

      showToast("Graded assignment record successfully uploaded.", "success");
      setTitle('');
      setScore('');
    } catch (err) {
      showToast("Failed to upload assignment marks.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
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
        <h2 className="text-2xl font-bold font-sans tracking-tight">Record Academic Grades</h2>
        <p className="text-xs text-slate-400">Post midterms, quizzes, and projects to calculate student averages.</p>
      </div>

      <div className="max-w-xl glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-sm mb-6 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-400" /> Grade Record Parameters
        </h3>

        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Select Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full glass-input bg-slate-900 text-xs"
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.student_ref_id})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Assignment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Programming Exam"
              className="glass-input text-xs"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Subject / Module</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full glass-input bg-slate-900 text-xs"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Computer Programming">Computer Programming</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Score Earned</label>
              <input
                type="number"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 85"
                className="glass-input text-xs"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Max Points</label>
              <input
                type="number"
                step="0.1"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="e.g. 100"
                className="glass-input text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full glass-input bg-slate-900 text-xs"
              >
                <option value="Graded">Graded (Active points)</option>
                <option value="Submitted">Submitted (Awaiting evaluation)</option>
                <option value="Pending">Pending (Not yet submitted)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl glow-btn text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 mt-4"
            disabled={submitting}
          >
            {submitting ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" /> Post Grade Outcomes
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
