import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, X, Sparkles } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const store = useAuthStore() as any;
  const isDemoMode = store?.isDemoMode;
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;


  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-800 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase">
            Demo Mode Active
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Showing realistic simulated Jharkhand innovation ecosystem data. All organizational names are for demonstration.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
