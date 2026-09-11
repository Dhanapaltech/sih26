import React from 'react';

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 animate-pulse"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
          </div>
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <SkeletonCard count={3} />
    </div>
  );
};
