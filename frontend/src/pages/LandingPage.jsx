import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  ShieldAlert, 
  Database,
  ArrowRight,
  CheckCircle,
  Users,
  Mail,
  MessageSquareCode
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formSent, setFormSent] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setEmail('');
      setMessage('');
    }, 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-100 relative">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] -z-10" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[120px] -z-10" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] -z-10" />

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 w-full z-40 bg-background-light/75 dark:bg-background-dark/75 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl glow-btn flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wide gradient-text">AI ACADEMY</span>
              <span className="text-[10px] block text-slate-400 font-medium">Predictive Student Analytics</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-xl border border-indigo-500/30 hover:bg-indigo-500/10 font-semibold text-sm transition-all duration-200 text-indigo-400"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded-xl glow-btn text-white font-semibold text-sm transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Brain className="h-4 w-4" /> Leading-edge Student Risk Engine
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-sans leading-tight">
            Predict Academic Success <br />
            <span className="gradient-text">Before the Final Exam</span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-md leading-relaxed max-w-lg">
            Empower educators and students with institutional intelligence. Utilizing multi-model ML predictions, track attendance dropout indexes, grade averages, and access 1-on-1 advisor counseling chatbot recommendations.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 rounded-xl glow-btn text-white font-semibold text-md flex items-center gap-2"
            >
              Explore Portals <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                document.getElementById('works').scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700/80 font-semibold text-md transition-all duration-200"
            >
              See How It Works
            </button>
          </div>
        </motion.div>

        {/* Dashboard Floating Preview Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:block flex justify-center"
        >
          <div className="w-full max-w-[550px] aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-slate-700/40 p-4 shadow-glass-dark relative flex flex-col gap-4">
            {/* Window control circles */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-500 ml-4 font-mono">student_predictor_dashboard.ai</span>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/30 text-center">
                <span className="text-[9px] text-slate-400 block uppercase">Predicted Grade</span>
                <span className="text-xl font-bold font-sans text-indigo-400">86.4%</span>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/30 text-center">
                <span className="text-[9px] text-slate-400 block uppercase">Dropout Risk</span>
                <span className="text-xl font-bold font-sans text-emerald-400">LOW</span>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/30 text-center">
                <span className="text-[9px] text-slate-400 block uppercase">Confidence</span>
                <span className="text-xl font-bold font-sans text-purple-400">94.0%</span>
              </div>
            </div>

            <div className="flex-1 bg-slate-800/50 rounded-2xl border border-slate-700/20 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-700/30 pb-2">
                <span className="text-xs font-semibold">Weekly Study Target</span>
                <span className="text-[10px] text-slate-400">18 Hours Tracked</span>
              </div>
              {/* Fake Graph Bars */}
              <div className="flex items-end justify-between h-20 pt-4 gap-2">
                <div className="bg-indigo-500/20 w-full h-[30%] rounded-t-md"></div>
                <div className="bg-indigo-500/20 w-full h-[50%] rounded-t-md"></div>
                <div className="bg-indigo-500/20 w-full h-[40%] rounded-t-md"></div>
                <div className="bg-indigo-500/30 w-full h-[70%] rounded-t-md"></div>
                <div className="bg-purple-500/60 w-full h-[90%] rounded-t-md"></div>
              </div>
            </div>

            {/* floating counselor dialog mockup */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute bottom-6 -right-6 glass-card p-3 rounded-2xl border border-purple-500/30 max-w-[240px] shadow-lg flex items-start gap-2 text-[10px] bg-slate-950 text-slate-200"
            >
              <Brain className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-purple-400 uppercase tracking-wide">Advisor Suggestion</span>
                "Maintaining study hours at 18 hours/wk secures Low risk levels."
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-slate-900/60 border-y border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-purple-400 font-sans block">94.8%</span>
            <span className="text-xs text-slate-400 block mt-1 uppercase font-semibold">Model Accuracy</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-blue-400 font-sans block">25,000+</span>
            <span className="text-xs text-slate-400 block mt-1 uppercase font-semibold">Predictions Logged</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-400 font-sans block">12%</span>
            <span className="text-xs text-slate-400 block mt-1 uppercase font-semibold">Average Grade Lift</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-emerald-400 font-sans block">&lt; 100ms</span>
            <span className="text-xs text-slate-400 block mt-1 uppercase font-semibold">Inference Latency</span>
          </div>
        </div>
      </section>

      {/* Features grid section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold font-sans">Full Suite Academic Intelligence</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Everything needed to detect failure vectors, grade dropouts, and plan proactive student interventions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Multi-Model AI Inference</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trains 6 separate classifiers and regressors (XGBoost, Random Forest, SVM) to compute grades, calculate dropout probability index limits, and check confidence metrics.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Counselor Chatbot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Students query their predicted metrics interactively. The advisor matches NLP queries with attendance ratios, study hours, and sleep targets to advise routines.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Automated Report Cards</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate fully compiled PDF reports on-demand containing attendance graphs, assignment grids, ML predictions, and strategies suitable for academic counselor reviews.
            </p>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="works" className="py-20 bg-slate-900/40 border-y border-slate-800 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold font-sans">How AI Prediction Works</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              From academic metrics collection to personalized student counseling pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-3 relative text-center md:text-left">
              <div className="h-10 w-10 rounded-full glow-btn text-white flex items-center justify-center font-bold text-sm font-mono mx-auto md:mx-0">
                1
              </div>
              <h3 className="font-bold text-md">Data Ingestion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We pull key features: attendance logs, homework grades, study tracking hours, and student sleep parameters from campus datasets.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 relative text-center md:text-left">
              <div className="h-10 w-10 rounded-full glow-btn text-white flex items-center justify-center font-bold text-sm font-mono mx-auto md:mx-0">
                2
              </div>
              <h3 className="font-bold text-md">Pipeline Training</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The ML service applies standard scaling, splits testing folders, and trains 6 algorithms, selecting the best fit classifier.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative text-center md:text-left">
              <div className="h-10 w-10 rounded-full glow-btn text-white flex items-center justify-center font-bold text-sm font-mono mx-auto md:mx-0">
                3
              </div>
              <h3 className="font-bold text-md">Risk Classification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculates numerical grade predictions, determines the category (High, Medium, or Low Risk), and rates inference confidence.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 relative text-center md:text-left">
              <div className="h-10 w-10 rounded-full glow-btn text-white flex items-center justify-center font-bold text-sm font-mono mx-auto md:mx-0">
                4
              </div>
              <h3 className="font-bold text-md">Active Interventions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Exposes metrics in dashboard panels, flags weak students to teachers, triggers PDF prints, and runs advisor counseling dialogs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold font-sans">Trusted by Academic Leaders</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Educators share their experience using AI Academy predictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-2xl border border-slate-700/20">
            <p className="italic text-xs text-slate-500 leading-relaxed mb-4">
              "We deployed AI Academy across our Computer Science department. The ability to identify students dropping below attendance thresholds, combined with the prediction engine, lowered our D/F grade rate by 18% in the first semester."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs text-white">DR</div>
              <div>
                <span className="font-bold block text-sm">Dr. Diana Prince</span>
                <span className="text-[10px] text-slate-400">Dean of Informatics, Metro University</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-700/20">
            <p className="italic text-xs text-slate-500 leading-relaxed mb-4">
              "The counselor chatbot advisor and the automated PDF reports have saved our mentors hours. Instead of combing through spreadsheets, they get a direct action plan highlighting exactly why a student is underperforming."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs text-white">PX</div>
              <div>
                <span className="font-bold block text-sm">Prof. Charles Xavier</span>
                <span className="text-[10px] text-slate-400">Headmaster, Xavier School</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-slate-900/20 border-t border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-sans">Engineering Excellence</h2>
            <p className="text-slate-500 text-sm mt-2">The system architecture design team.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="glass-card p-5 rounded-2xl">
              <div className="h-16 w-16 rounded-full glow-btn mx-auto flex items-center justify-center text-lg font-bold text-white mb-3">SC</div>
              <h4 className="font-bold text-sm">Sarthak Chubey</h4>
              <p className="text-[10px] text-indigo-400 uppercase font-semibold">Lead UI/UX & AI Engineer</p>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <div className="h-16 w-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-lg font-bold text-slate-300 mb-3">AL</div>
              <h4 className="font-bold text-sm">Ada Lovelace</h4>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">FastAPI Backend Dev</p>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <div className="h-16 w-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-lg font-bold text-slate-300 mb-3">AM</div>
              <h4 className="font-bold text-sm">Alan Turing</h4>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">ML Pipeline Architect</p>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <div className="h-16 w-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-lg font-bold text-slate-300 mb-3">GH</div>
              <h4 className="font-bold text-sm">Grace Hopper</h4>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">DevOps Coordinator</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section & Form */}
      <section className="py-20 px-6 max-w-xl mx-auto">
        <div className="glass-card p-8 rounded-3xl border border-slate-700/30 relative overflow-hidden">
          <h2 className="text-2xl font-bold font-sans mb-2 text-center">Contact Academic Support</h2>
          <p className="text-xs text-slate-400 text-center mb-6">Ask about enterprise API integrations or dataset seeding.</p>
          
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="glass-input"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Your Message</label>
              <textarea 
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Inquire about dataset loading parameters..."
                className="glass-input resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 rounded-xl glow-btn text-white font-bold transition-all duration-200"
            >
              {formSent ? 'Dispatched Request Successfully!' : 'Send Request'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6 bg-slate-950/40 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            <span className="font-bold tracking-wider text-slate-300">AI ACADEMY</span>
          </div>
          <div>
            &copy; 2026 AI Academy Inc. Built for Next-Gen Student Analytics. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-300 cursor-pointer">PostgreSQL schemas</span>
            <span className="hover:text-slate-300 cursor-pointer">Dockerized setup</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
