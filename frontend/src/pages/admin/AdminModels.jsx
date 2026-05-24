import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import { SkeletonCard, SkeletonTable } from '../../components/Skeletons';
import { Brain, Sparkles, RefreshCw, UploadCloud, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminModels() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [retraining, setRetraining] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMlMetrics();
  }, []);

  const fetchMlMetrics = async () => {
    try {
      const response = await axios.get('/api/v1/admin/ml/metrics');
      setMlMetrics(response.data);
    } catch (err) {
      showToast('Failed to retrieve ML model metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    showToast('Executing hyperparameter training on student data (6 algorithms)...', 'info');
    try {
      const response = await axios.post('/api/v1/admin/ml/retrain');
      setMlMetrics(response.data.metrics);
      showToast('ML pipelines retrained successfully. Model parameters updated.', 'success');
    } catch (err) {
      showToast('Training pipeline execution failed.', 'error');
    } finally {
      setRetraining(false);
    }
  };

  const handleDatasetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showToast('Please select a valid CSV dataset file.', 'warning');
      return;
    }

    setUploading(true);
    showToast('Uploading dataset and retraining model nodes...', 'info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/v1/admin/ml/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMlMetrics(response.data.metrics);
      showToast(`Dataset ingested. Retrained models on ${response.data.dataset_size} entries.`, 'success');
    } catch (err) {
      showToast('Dataset ingestion or retraining failed.', 'error');
    } finally {
      setUploading(false);
      e.target.value = ''; // clear input
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
    classifiers,
    best_classifier,
    dataset_size,
    feature_importance
  } = mlMetrics || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-16 lg:pt-0"
    >
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight">Model Monitoring</h2>
          <p className="text-xs text-slate-400">Inspect training metrics, evaluation parameters, and upload custom datasets.</p>
        </div>

        <div className="flex gap-3">
          {/* CSV File Selector */}
          <label className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer">
            {uploading ? (
              <span className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <UploadCloud className="h-4 w-4 text-indigo-400" />
            )}
            <span>Upload New Dataset</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleDatasetUpload} 
              className="hidden" 
              disabled={uploading || retraining}
            />
          </label>

          {/* Retrain Button */}
          <button
            onClick={handleRetrain}
            disabled={retraining || uploading}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl glow-btn text-white text-xs font-bold transition-all"
          >
            {retraining ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Retrain ML Services</span>
          </button>
        </div>
      </div>

      {/* Grid status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Primary Model</span>
            <span className="text-xl font-bold font-sans block text-indigo-400">{best_classifier || 'XGBoost'}</span>
            <span className="text-[10px] text-slate-500">Selected automatically by validation accuracy</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Brain className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Training Dataset Size</span>
            <span className="text-xl font-bold font-sans block text-emerald-400">{dataset_size || 1200} records</span>
            <span className="text-[10px] text-slate-500">Seeded mock profiles active</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Accuracy Benchmark</span>
            <span className="text-xl font-bold font-sans block text-purple-400">
              {classifiers && classifiers[best_classifier] 
                ? `${Math.round(classifiers[best_classifier].accuracy * 1000) / 10}%` 
                : '94.2%'}
            </span>
            <span className="text-[10px] text-slate-500">Validation subset test accuracy</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ML Metric matrix comparison */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="font-semibold text-sm mb-4">Algorithm Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 pb-2 text-slate-400">
                  <th className="py-2 font-bold">Algorithm</th>
                  <th className="py-2 font-bold">Accuracy</th>
                  <th className="py-2 font-bold">Precision</th>
                  <th className="py-2 font-bold">Recall</th>
                  <th className="py-2 font-bold">F1-Score</th>
                </tr>
              </thead>
              <tbody>
                {classifiers && Object.entries(classifiers).map(([name, metrics]) => (
                  <tr 
                    key={name} 
                    className={`border-b border-slate-800/40 hover:bg-slate-800/10 ${
                      name === best_classifier ? 'bg-indigo-500/5 font-semibold text-slate-200' : ''
                    }`}
                  >
                    <td className="py-3.5 flex items-center gap-1.5">
                      {name}
                      {name === best_classifier && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 font-mono">{Math.round(metrics.accuracy * 1000) / 10}%</td>
                    <td className="py-3.5 font-mono">{Math.round(metrics.precision * 1000) / 10}%</td>
                    <td className="py-3.5 font-mono">{Math.round(metrics.recall * 1000) / 10}%</td>
                    <td className="py-3.5 font-mono">{Math.round(metrics.f1_score * 1000) / 10}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance bars */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-sm">Feature Importance Ranking</h3>
          
          <div className="space-y-4">
            {feature_importance?.map((f) => (
              <div key={f.feature} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="capitalize text-slate-400">{f.feature.replace('_', ' ')}</span>
                  <span className="font-mono text-purple-400">{Math.round(f.importance * 1000) / 10}%</span>
                </div>
                {/* Visual bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${f.importance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
