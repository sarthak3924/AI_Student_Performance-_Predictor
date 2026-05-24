import React from 'react';

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse space-y-3">
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
      <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-2/3"></div>
      <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/6"></div>
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-end p-4 gap-2">
        <div className="bg-slate-300 dark:bg-slate-700 w-full h-1/3 rounded-t"></div>
        <div className="bg-slate-300 dark:bg-slate-700 w-full h-2/3 rounded-t"></div>
        <div className="bg-slate-300 dark:bg-slate-700 w-full h-1/2 rounded-t"></div>
        <div className="bg-slate-300 dark:bg-slate-700 w-full h-3/4 rounded-t"></div>
        <div className="bg-slate-300 dark:bg-slate-700 w-full h-5/6 rounded-t"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
      <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded w-1/6 mb-4"></div>
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-4 pb-2 border-b border-slate-700/20">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-2 border-b border-slate-700/10">
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-2/3"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
