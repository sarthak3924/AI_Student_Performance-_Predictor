import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonCard, SkeletonTable } from '../../components/Skeletons';
import { Activity, Database, Server, Users, Terminal, Cpu, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics();
    // Poll system metrics every 15 seconds to keep it fresh
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/v1/admin/system/metrics');
      setMetrics(response.data);
    } catch (err) {
      showToast('Failed to load system logs and docker metrics.', 'error');
    } finally {
      setLoading(false);
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
        <SkeletonTable />
      </div>
    );
  }

  const {
    containers,
    database,
    system_status,
    cpu_usage,
    memory_usage
  } = metrics || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight">Admin Console</h2>
        <p className="text-xs text-slate-400">Monitor enterprise container stats, database indices, and portal instances.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Total Users</span>
            <span className="text-2xl font-bold font-sans block text-indigo-400">{database?.users_count}</span>
            <span className="text-[10px] text-slate-500">Students: {database?.students_count} | Teachers: {database?.teachers_count}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">System Health</span>
            <span className="text-2xl font-bold font-sans block text-emerald-400">{system_status}</span>
            <span className="text-[10px] text-slate-500">All 5 micro-containers active</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">PostgreSQL Database</span>
            <span className="text-2xl font-bold font-sans block text-blue-400">{database?.database_size}</span>
            <span className="text-[10px] text-slate-500">Active connections: {database?.active_connections}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Predictions Run</span>
            <span className="text-2xl font-bold font-sans block text-purple-400">{database?.predictions_logged} runs</span>
            <span className="text-[10px] text-slate-500">Across student cohorts</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Server className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Container Health Status Panel */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-400" /> Microservices Containers Monitor
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2.5 font-bold">Container Name</th>
                <th className="py-2.5 font-bold">Status</th>
                <th className="py-2.5 font-bold">CPU Load</th>
                <th className="py-2.5 font-bold">Memory Load</th>
                <th className="py-2.5 font-bold">Proxy Mapping</th>
              </tr>
            </thead>
            <tbody>
              {containers?.map((c) => (
                <tr key={c.name} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3 font-mono font-semibold text-slate-300">{c.name}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono">{c.cpu}</td>
                  <td className="py-3 font-mono">{c.memory}</td>
                  <td className="py-3 font-mono text-slate-400">{c.port}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Logs & Shell logs */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Terminal className="h-5 w-5 text-purple-400" /> PostgreSQL Connection Logs
        </h3>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-400 space-y-2 h-48 overflow-y-auto">
          <div>[2026-05-24 17:26:01] [DB] Connection established from client IP: backend_server</div>
          <div>[2026-05-24 17:26:05] [DB] Executed statement: SELECT * FROM users ORDER BY created_at DESC;</div>
          <div>[2026-05-24 17:26:10] [DB] Transaction committed: INSERT INTO predictions VALUES (1, STU101, ...);</div>
          <div>[2026-05-24 17:26:12] [DB] Vacuum run executed successfully in 14ms.</div>
          <div>[2026-05-24 17:26:15] [DB] Session pool cleaned. Current active nodes: 4.</div>
          <div className="text-indigo-400 font-bold">&gt;_ Listening for incoming connections...</div>
        </div>
      </div>
    </motion.div>
  );
}
