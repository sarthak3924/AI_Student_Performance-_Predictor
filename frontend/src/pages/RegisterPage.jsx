import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import BackgroundParticles from '../components/BackgroundParticles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  FileText, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const { registerStudent, registerTeacher } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Multi-step: 1 (Personal details), 2 (Academic Details), 3 (OTP verification)
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student'); // 'student', 'teacher'
  
  // Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [academicId, setAcademicId] = useState(''); // student_id or teacher_id
  const [department, setDepartment] = useState('Computer Science');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState(1);
  
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-slate-700', width: 'w-0' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
      case 2:
        return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 3:
        return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    }
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = async (e) => {
    e.preventDefault();
    if (!academicId.trim()) {
      showToast("Academic ID is required.", "error");
      return;
    }
    if (role === 'student' && !course.trim()) {
      showToast("Course name is required.", "error");
      return;
    }

    // Trigger OTP sending simulation
    setOtpSent(true);
    try {
      await axios.post('/api/v1/auth/forgot-password', { email }); // reuse for OTP dispatch mock
      showToast("MFA verification OTP has been sent to your email (Demo code is '123456')", "info");
      setStep(3);
    } catch (err) {
      showToast("Failed to dispatch OTP.", "error");
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (otp !== '123456' && otp.length !== 6) {
      showToast("Invalid verification OTP. Try '123456'", "error");
      return;
    }

    setVerifying(true);
    try {
      if (role === 'student') {
        await registerStudent({
          email,
          full_name: fullName,
          password,
          student_id: academicId,
          department,
          course,
          semester: parseInt(semester, 10)
        });
      } else {
        await registerTeacher({
          email,
          full_name: fullName,
          password,
          teacher_id: academicId,
          department
        });
      }
      showToast("Account successfully registered! Log in now.", "success");
      navigate('/login');
    } catch (err) {
      showToast(err.message || "Registration failed.", "error");
    } finally {
      setVerifying(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative p-6 overflow-hidden">
      <BackgroundParticles />

      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-500/5 blur-[90px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-[90px] -z-10" />

      <motion.div
        layout
        className="w-full max-w-lg glass-panel border border-slate-700/35 rounded-3xl p-8 shadow-glass-dark relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        {/* Header Progress Stepper */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-400" />
            <span className="font-bold text-sm tracking-wide">Register Account</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step 
                    ? 'w-6 bg-purple-500 shadow-neon-glow' 
                    : s < step 
                    ? 'w-2 bg-emerald-500' 
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Slide Animations for Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleNextStep1}
              className="space-y-4"
            >
              {/* Role selection toggle */}
              <div className="flex bg-slate-950/60 p-1 border border-slate-800 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg uppercase transition-all ${
                    role === 'student'
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 shadow-neon-glow'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg uppercase transition-all ${
                    role === 'teacher'
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 shadow-neon-glow'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Teacher
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@university.edu"
                  className="w-full glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input"
                    required
                  />
                </div>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Password Strength</span>
                    <span className="font-semibold text-slate-300">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl glow-btn text-white font-bold text-sm tracking-wide mt-4 flex items-center justify-center gap-2"
              >
                Proceed to Academic Info <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleNextStep2}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">
                  {role === 'student' ? 'Student ID' : 'Teacher ID'}
                </label>
                <input
                  type="text"
                  value={academicId}
                  onChange={(e) => setAcademicId(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. STU12345' : 'e.g. TCH12345'}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full glass-input bg-slate-900"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              {role === 'student' && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Course / Degree</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech CSE"
                      className="w-full glass-input text-xs"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                      className="w-full glass-input bg-slate-900 text-xs py-3"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-slate-700/40 hover:bg-slate-800/30 text-slate-300 font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 rounded-xl glow-btn text-white font-bold text-sm tracking-wide flex items-center justify-center gap-1.5"
                >
                  Send Verification Code <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleFinalSubmit}
              className="space-y-5 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 mb-2">
                <ShieldCheck className="h-6 w-6 animate-pulse" />
              </div>
              
              <div>
                <h3 className="font-bold text-md text-slate-100">Multi-Factor Authentication</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  A verification code has been dispatched to <b>{email}</b>.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 max-w-xs mx-auto">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-Digit OTP"
                  className="glass-input text-center text-lg tracking-widest font-mono font-bold"
                  maxLength={6}
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1">
                  For demonstration, enter the code: <b className="text-purple-400 font-mono">123456</b>
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-slate-700/40 hover:bg-slate-800/30 text-slate-300 font-semibold rounded-xl text-sm transition-all duration-200"
                  disabled={verifying}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 rounded-xl glow-btn text-white font-bold text-sm tracking-wide flex items-center justify-center gap-1.5"
                  disabled={verifying}
                >
                  {verifying ? (
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4.5 w-4.5" /> Complete Registration
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-purple-400 font-semibold hover:underline cursor-pointer"
          >
            Sign In
          </span>
        </div>
      </motion.div>
    </div>
  );
}
