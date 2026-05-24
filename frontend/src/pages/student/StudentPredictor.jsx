import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { Sparkles, Brain, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentPredictor() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
  // Input states
  const [attendance, setAttendance] = useState(85);
  const [studyHours, setStudyHours] = useState(12);
  const [prevGrades, setPrevGrades] = useState(78);
  const [assignScores, setAssignScores] = useState(80);
  const [sleepHours, setSleepHours] = useState(7);
  const [internet, setInternet] = useState(true);
  const [participation, setParticipation] = useState(70);
  const [support, setSupport] = useState(75);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    
    const payload = {
      attendance: parseFloat(attendance),
      study_hours: parseFloat(studyHours),
      previous_grades: parseFloat(prevGrades),
      assignment_scores: parseFloat(assignScores),
      sleep_hours: parseFloat(sleepHours),
      internet_access: internet ? 1 : 0,
      participation: parseFloat(participation),
      family_support: parseFloat(support)
    };

    try {
      const response = await axios.post('/api/v1/student/predict', payload);
      setPrediction(response.data);
      showToast('ML inference calculated successfully.', 'success');
    } catch (err) {
      showToast('ML prediction run failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'High') return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    if (risk === 'Medium') return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight">AI Predictive Engine</h2>
        <p className="text-xs text-slate-400">Run What-If scenarios to simulate how study habits affect predicted outcomes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form controls */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="font-semibold text-sm mb-6 flex items-center gap-2">
            <Brain className="h-4.5 w-4.5 text-purple-400" /> Student Profile Parameters
          </h3>

          <form onSubmit={handlePredict} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Attendance */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Class Attendance Rate</span>
                  <span className="font-bold text-purple-400">{attendance}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Study Hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Weekly Study Hours</span>
                  <span className="font-bold text-purple-400">{studyHours} hrs</span>
                </div>
                <input 
                  type="range" min="0" max="40" value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Previous Grades */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Previous Semester Grade</span>
                  <span className="font-bold text-purple-400">{prevGrades}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={prevGrades}
                  onChange={(e) => setPrevGrades(e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Assignment Scores */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Assignment Average</span>
                  <span className="font-bold text-purple-400">{assignScores}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={assignScores}
                  onChange={(e) => setAssignScores(e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Sleep Hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Nightly Sleep Duration</span>
                  <span className="font-bold text-purple-400">{sleepHours} hrs</span>
                </div>
                <input 
                  type="range" min="3" max="12" value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Participation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Class Participation Index</span>
                  <span className="font-bold text-purple-400">{participation}/100</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={participation}
                  onChange={(e) => setParticipation(e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Family Support */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Family Support Scale</span>
                  <span className="font-bold text-purple-400">{support}/100</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={support}
                  onChange={(e) => setSupport(e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Internet Check */}
              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer">
                  <input 
                    type="checkbox" checked={internet}
                    onChange={(e) => setInternet(e.target.checked)}
                    className="accent-purple-500 h-4.5 w-4.5 rounded border-slate-700 bg-slate-900" 
                  />
                  <span>Has Reliable Home Internet Access</span>
                </label>
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl glow-btn text-white font-bold text-sm tracking-wide mt-4 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 animate-pulse" /> Compute Performance Forecast
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results block */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
          <h3 className="font-semibold text-sm mb-4">Inference Reports</h3>
          
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                key="prediction-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col justify-between space-y-4"
              >
                {/* Score Dial Mockup */}
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Predicted Grade</span>
                  <span className="text-4xl font-extrabold block font-sans text-indigo-400">{prediction.predicted_score}%</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className={`p-3 rounded-xl border ${getRiskColor(prediction.risk_level)}`}>
                    <span className="text-[9px] text-slate-400 block uppercase">Risk Category</span>
                    <span className="font-extrabold text-sm uppercase">{prediction.risk_level} RISK</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/40">
                    <span className="text-[9px] text-slate-400 block uppercase">AI Confidence</span>
                    <span className="font-extrabold text-sm text-purple-400">{Math.round(prediction.confidence_score * 100)}%</span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-left text-xs leading-relaxed space-y-2">
                  <div>
                    <span className="font-bold text-purple-400 uppercase tracking-wider text-[9px] block">AI Counselor Suggestion</span>
                    <p className="text-slate-300 mt-0.5">{prediction.recommendations}</p>
                  </div>
                  <div>
                    <span className="font-bold text-purple-400 uppercase tracking-wider text-[9px] block">Improvement Strategy</span>
                    <p className="text-slate-300 mt-0.5">{prediction.improvement_strategy}</p>
                  </div>
                </div>
                
                <span className="text-[9px] text-slate-500 text-center block font-mono">
                  Classifier: {prediction.model_used}
                </span>

              </motion.div>
            ) : (
              <div key="no-prediction" className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-500">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs">Awaiting Parameters</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Adjust the sliders on the left and trigger prediction to compute results.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
