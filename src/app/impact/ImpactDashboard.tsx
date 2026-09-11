import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Briefcase,
  Loader2,
  Droplets,
  Heart,
  BookOpen,
  Leaf,
  CheckCircle2,
} from 'lucide-react';

const DEMO_METRICS = {
  peopleImpacted: 85000,
  villagesImpacted: 342,
  jobsCreated: 1240,
  costSavings: 18400000, // ₹18.4 Cr
};

const DEMO_STORIES = [
  {
    id: 'story-1',
    project: 'AI + IoT Water Quality Monitor',
    district: 'Dumka',
    university: 'BIT Sindri',
    metric: '2,400 villagers',
    highlight: 'safe drinking water access',
    reduction: '64% waterborne illness decline',
    color: '#2563EB',
    icon: Droplets,
  },
  {
    id: 'story-2',
    project: 'Telemedicine Hub Network',
    district: 'Gumla',
    university: 'RIMS Ranchi',
    metric: '12,000 patients',
    highlight: 'remote healthcare access',
    reduction: '3x reduction in hospital travel',
    color: '#DC2626',
    icon: Heart,
  },
  {
    id: 'story-3',
    project: 'Smart Agriculture Advisory',
    district: 'Khunti',
    university: 'BAU Ranchi',
    metric: '8,000 farmers',
    highlight: 'precision crop management',
    reduction: '28% increase in crop yield',
    color: '#059669',
    icon: Leaf,
  },
];

const SDG_GOALS = [
  { number: 3, label: 'Good Health & Well-Being', color: '#4CAF50', icon: Heart },
  { number: 4, label: 'Quality Education', color: '#C5192D', icon: BookOpen },
  { number: 6, label: 'Clean Water & Sanitation', color: '#26BDE2', icon: Droplets },
  { number: 8, label: 'Decent Work & Growth', color: '#A21942', icon: Briefcase },
  { number: 11, label: 'Sustainable Cities', color: '#FD9D24', icon: MapPin },
  { number: 13, label: 'Climate Action', color: '#3F7E44', icon: Leaf },
];

export const ImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<{
    peopleImpacted: number;
    villagesImpacted: number;
    jobsCreated: number;
    costSavings: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadImpactData() {
      setIsLoading(true);
      try {
        const { data, error } = await (supabase.from('impact_metrics') as any)
          .select('*')
          .eq('verification_status', 'verified');

        if (!error && data && data.length > 0) {
          const consolidated = data.reduce(
            (acc: any, row: any) => ({
              peopleImpacted: acc.peopleImpacted + (Number(row.people_impacted) || 0),
              villagesImpacted: acc.villagesImpacted + (Number(row.villages_impacted) || 0),
              jobsCreated: acc.jobsCreated + (Number(row.jobs_created) || 0),
              costSavings: acc.costSavings + (Number(row.cost_savings) || 0),
            }),
            { peopleImpacted: 0, villagesImpacted: 0, jobsCreated: 0, costSavings: 0 }
          );
          if (consolidated.peopleImpacted > 0) {
            setMetrics(consolidated);
            setIsDemo(false);
          } else {
            setMetrics(DEMO_METRICS);
            setIsDemo(true);
          }
        } else {
          setMetrics(DEMO_METRICS);
          setIsDemo(true);
        }
      } catch (e) {
        console.warn('Error loading impact metrics:', e);
        setMetrics(DEMO_METRICS);
        setIsDemo(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadImpactData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Statewide Impact & Societal Return
            </h1>
            <Badge className="bg-emerald-800 text-white text-[10px]">VERIFIED CITIZEN OUTCOMES</Badge>
            {isDemo && (
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-400">
                DEMO DATA
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking concrete socioeconomic transformations from verified engineering deployments across Jharkhand.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : (
        metrics && (
          <>
            {/* Hero Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-800/40 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
                    Consolidated Human Metric{isDemo ? ' (SIH 2026 Demo)' : ' (Supabase Verified)'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold font-mono">
                    {metrics.peopleImpacted.toLocaleString()}+ Citizens Benefited
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Across {metrics.villagesImpacted} verified villages in Jharkhand, university
                    innovations deployed in the field have delivered measurable civic return.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
                  <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 text-center">
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      ₹{(metrics.costSavings / 10000000).toFixed(1)} Cr
                    </span>
                    <span className="text-[10px] text-slate-300 block uppercase">Public Savings</span>
                  </div>
                  <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 text-center">
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      {metrics.jobsCreated.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-300 block uppercase">Local Jobs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Citizens Impacted', value: metrics.peopleImpacted.toLocaleString() + '+', icon: Users, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Villages Covered', value: metrics.villagesImpacted.toString(), icon: MapPin, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Public Savings', value: '₹' + (metrics.costSavings / 10000000).toFixed(1) + ' Cr', icon: DollarSign, color: 'text-purple-600 dark:text-purple-400' },
                { label: 'Local Jobs Created', value: metrics.jobsCreated.toLocaleString(), icon: Briefcase, color: 'text-amber-600 dark:text-amber-400' },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{kpi.label}</span>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                    <div className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
                    {isDemo && <span className="text-[10px] text-amber-600 font-medium">Demo projection</span>}
                  </div>
                );
              })}
            </div>

            {/* Featured Impact Stories */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Featured Engineering Impact Stories
                </CardTitle>
                <p className="text-xs text-slate-500">Prototype-to-deployment projects with verified community outcomes.</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
                {DEMO_STORIES.map((story) => {
                  const Icon = story.icon;
                  return (
                    <div key={story.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${story.color}15`, color: story.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{story.project}</h4>
                            <Badge variant="outline" className="text-[10px]">{story.district}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">{story.university}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{story.metric}</span>
                          <span className="text-slate-500">now have {story.highlight}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{story.reduction}</span>
                        </div>
                      </div>
                      <Progress value={75} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* SDG Goals */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-base font-bold">UN Sustainable Development Goals Aligned</CardTitle>
                <p className="text-xs text-slate-500">Projects mapped to verified SDG targets for reporting to state and national bodies.</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {SDG_GOALS.map((sdg) => {
                    const Icon = sdg.icon;
                    return (
                      <div
                        key={sdg.number}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs mx-auto"
                          style={{ backgroundColor: sdg.color }}
                        >
                          {sdg.number}
                        </div>
                        <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                          {sdg.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
};
