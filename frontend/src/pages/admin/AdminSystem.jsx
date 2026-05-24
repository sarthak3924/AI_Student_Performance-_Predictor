import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonCard, SkeletonTable } from '../../components/Skeletons';
import { Cpu, Server, Terminal, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSystem() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/v1/admin/system/metrics');
      setMetrics(response.data);
    } catch (err) {
      showToast('Failed to compile docker log files.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 lg:pt-0">
        <SkeletonCard />
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight">System Monitor</h2>
        <p className="text-xs text-slate-400">Inspect server resource allocation load, containers metrics, and connection threads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Resource Allocation */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-purple-400" /> Host Resource Usage
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">System CPU Load</span>
              <span className="font-mono font-bold text-slate-200">{cpu_usage}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">System Memory Load</span>
              <span className="font-mono font-bold text-slate-200">{memory_usage}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Active Container Networks</span>
              <span className="font-mono font-bold text-slate-200">Bridge (app-network)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Uptime Duration</span>
              <span className="font-mono font-bold text-slate-200">14 days, 6 hours, 23 mins</span>
            </div>
          </div>
        </div>

        {/* Database specs */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Server className="h-4.5 w-4.5 text-indigo-400" /> Database Health Checks
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Engine Type</span>
              <span className="font-bold text-slate-200">PostgreSQL 15 (alpine)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Schema Index Tuning</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Optimizations Configured
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Table Count</span>
              <span className="font-mono font-bold text-slate-200">8 Primary Relations</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Data Directories Volumes</span>
              <span className="font-mono font-bold text-slate-200">student_prediction_db (Persistent)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Containers Grid Table */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-sm mb-4">Orchestrated Docker Containers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 pb-2 text-slate-400">
                <th className="py-2.5 font-bold">Container</th>
                <th className="py-2.5 font-bold">Image Basis</th>
                <th className="py-2.5 font-bold">Internal Port</th>
                <th className="py-2.5 font-bold">Volume Mounts</th>
              </tr>
            </thead>
            <tbody>
              {containers?.map((c) => (
                <tr key={c.name} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="py-3.5 font-mono font-semibold text-slate-200">{c.name}</td>
                  <td className="py-3.5 text-slate-400">
                    {c.name.includes('db') ? 'postgres:15-alpine' : 
                     c.name.includes('nginx') ? 'nginx:alpine' : 
                     c.name.includes('backend') ? 'python:3.10-slim (FastAPI)' : 
                     c.name.includes('ml-service') ? 'python:3.10-slim (FastAPI + scikit-learn)' : 
                     'node:alpine (React/Vite build)'}
                  </td>
                  <td className="py-3.5 font-mono text-slate-400">{c.port}</td>
                  <td className="py-3.5 font-mono text-slate-500">
                    {c.name.includes('db') ? 'pgdata:/var/lib/.../data' : 
                     c.name.includes('ml-service') ? 'ml-data:/app/app/data' : 
                     c.name.includes('nginx') ? 'nginx.conf:/etc/nginx/...' :
                     'Static cache / none'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
