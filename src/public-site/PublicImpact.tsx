import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';

interface ImpactSummary {
  benefited_citizens: number;
  villages_covered: number;
  public_savings_inr: number;
  jobs_created: number;
}

export const PublicImpact: React.FC = () => {
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Aggregate real impact_metrics from Supabase
        const { data, error: qErr } = await supabase
          .from('impact_metrics')
          .select('metric_key, value_numeric')
          .in('metric_key', [
            'benefited_citizens',
            'villages_covered',
            'public_savings_inr',
            'jobs_created',
          ]);

        if (qErr) throw qErr;

        const agg: ImpactSummary = {
          benefited_citizens: 0,
          villages_covered: 0,
          public_savings_inr: 0,
          jobs_created: 0,
        };

        (data || []).forEach((row: any) => {
          const key = row.metric_key as keyof ImpactSummary;
          if (key in agg) {
            agg[key] += Number(row.value_numeric) || 0;
          }
        });

        setSummary(agg);
      } catch (e) {
        console.error('Failed to load impact metrics:', e);
        setError('Failed to load impact data.');
        // Zero-data fallback
        setSummary({ benefited_citizens: 0, villages_covered: 0, public_savings_inr: 0, jobs_created: 0 });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatCurrency = (value: number): string => {
    if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)} Cr`;
    if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)} L`;
    return `₹${value.toLocaleString()}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <Badge className="bg-emerald-800 text-white text-[10px]">VERIFIABLE FIELD OUTCOMES</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          Statewide Innovation Social Impact
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Every rupee and hour invested in university research is quantified in citizen wellness, economic savings, and environmental protection.
        </p>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Benefited Citizens */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs text-slate-400">Benefited Citizens</span>
          <div className="text-3xl font-bold font-mono text-emerald-600">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            ) : (
              summary ? summary.benefited_citizens.toLocaleString() : '0'
            )}
          </div>
          <span className="text-[10px] text-slate-500">Documented in Districts</span>
        </div>

        {/* Villages Covered */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs text-slate-400">Villages Covered</span>
          <div className="text-3xl font-bold font-mono text-purple-600">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            ) : (
              summary ? summary.villages_covered.toLocaleString() : '0'
            )}
          </div>
          <span className="text-[10px] text-slate-500">Panchayat Hubs</span>
        </div>

        {/* Public Savings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs text-slate-400">Public Savings</span>
          <div className="text-3xl font-bold font-mono text-blue-600">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            ) : (
              summary ? formatCurrency(summary.public_savings_inr) : '₹0'
            )}
          </div>
          <span className="text-[10px] text-slate-500">Medical & Agronomic</span>
        </div>

        {/* Jobs Created */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs text-slate-400">Local Jobs Created</span>
          <div className="text-3xl font-bold font-mono text-amber-600">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            ) : (
              summary ? summary.jobs_created.toLocaleString() : '0'
            )}
          </div>
          <span className="text-[10px] text-slate-500">Field Technicians</span>
        </div>
      </div>

      {/* Zero state note */}
      {!loading && summary && Object.values(summary).every((v) => v === 0) && (
        <div className="text-center py-10 space-y-2">
          <BarChart3 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500">
            No verified impact data yet. Impact metrics will appear as projects deploy solutions to communities.
          </p>
        </div>
      )}
    </div>
  );
};
