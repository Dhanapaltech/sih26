import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService, StateAnalytics } from '@/lib/supabase/analyticsService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { JharkhandMap } from '@/components/maps/JharkhandMap';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  School,
  GraduationCap,
  Briefcase,
  Rocket,
  Brain,
  Globe2,
  Plus,
  Loader2,
} from 'lucide-react';

// ─── Static domain data (not demo, just category taxonomy) ───────────────────
const CHALLENGE_CATEGORIES = [
  { id: 'water', name: 'Water Management', icon: '💧' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'environment', name: 'Environment', icon: '🌿' },
  { id: 'energy', name: 'Energy', icon: '⚡' },
  { id: 'urban', name: 'Urban Development', icon: '🏙️' },
  { id: 'rural', name: 'Rural Livelihoods', icon: '🏘️' },
  { id: 'accessibility', name: 'Accessibility', icon: '♿' },
  { id: 'admin', name: 'Public Administration', icon: '🏛️' },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<StateAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    analyticsService.getStateAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoadingAnalytics(false));
  }, []);

  const ECOSYSTEM_FLOW = [
    { label: 'Citizen', role: 'Reports grassroots issue' },
    { label: 'Problem', role: 'Geolocated & evidence backed' },
    { label: 'AI Engine', role: 'Categorized & priority scored' },
    { label: 'Government', role: 'Validated & allocated' },
    { label: 'University', role: 'MOU & labs assigned' },
    { label: 'Faculty', role: 'Principal Investigator leads' },
    { label: 'Students', role: 'Engineering cells build' },
    { label: 'Industry', role: 'CSR hardware & funding' },
    { label: 'Prototype', role: 'Lab calibrated' },
    { label: 'Field Pilot', role: 'Tested in villages' },
    { label: 'Deployment', role: 'Statewide scaling' },
    { label: 'Impact', role: 'Citizens benefited' },
  ];

  const StatCell: React.FC<{ label: string; value: React.ReactNode; sub: string; color?: string }> = ({
    label, value, sub, color = 'text-slate-900 dark:text-slate-100'
  }) => (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <div className={`text-3xl sm:text-4xl font-extrabold font-mono ${color}`}>
        {loadingAnalytics ? (
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-400" />
        ) : value}
      </div>
      <span className={`text-[11px] font-semibold ${color.replace('text-slate-900 dark:text-slate-100', 'text-emerald-600').replace('dark:text-', 'dark:text-')}`}>
        {sub}
      </span>
    </div>
  );

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Smart India Hackathon 2026 • Flagship State Innovation Infrastructure
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn Local Problems Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300">
              Real Solutions.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Jharkhand Innovate connects citizens, government, universities, students, and industries to transform societal challenges into measurable innovation.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/citizen/report')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 h-12 shadow-lg gap-2"
            >
              <Plus className="w-5 h-5" /> Report a Problem (/citizen)
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/challenges')}
              className="border-slate-600 text-slate-200 hover:bg-slate-800 text-sm px-6 h-12 font-semibold"
            >
              Explore State Challenges
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate('/how-it-works')}
              className="text-slate-300 hover:text-white text-sm"
            >
              See How It Works &rarr;
            </Button>
          </div>
        </div>

        {/* Animated Ecosystem Horizontal Flow */}
        <div className="max-w-6xl mx-auto mt-14 pt-8 border-t border-slate-800">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-mono font-bold text-emerald-400 tracking-wider">
              THE UNIFIED INNOVATION LIFECYCLE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-left">
            {ECOSYSTEM_FLOW.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col justify-between space-y-1 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    STEP {idx + 1}
                  </span>
                  {idx < ECOSYSTEM_FLOW.length - 1 && (
                    <span className="text-slate-600 text-xs hidden lg:inline">&rarr;</span>
                  )}
                </div>
                <div className="font-bold text-white text-xs">{step.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{step.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. LIVE STATISTICS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-4">
          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
            LIVE DATA — SUPABASE POSTGRESQL
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCell
            label="Challenges Logged"
            value={analytics ? analytics.totalChallenges.toLocaleString() : '0'}
            sub="From Jharkhand Districts"
            color="text-slate-900 dark:text-slate-100"
          />
          <StatCell
            label="Active R&D Projects"
            value={analytics ? analytics.activeProjects.toLocaleString() : '0'}
            sub="In State Universities"
            color="text-purple-600"
          />
          <StatCell
            label="Solutions Deployed"
            value={analytics ? analytics.deployedSolutions.toLocaleString() : '0'}
            sub="Field Verified"
            color="text-emerald-600 dark:text-emerald-400"
          />
          <StatCell
            label="Citizens Impacted"
            value={analytics ? analytics.impactedCitizens.toLocaleString() : '0'}
            sub="Direct Beneficiaries"
            color="text-blue-600"
          />
        </div>
      </section>

      {/* 3. CHALLENGE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Core Societal Challenge Domains
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Categorized to match state administrative departments and academic engineering laboratories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CHALLENGE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate('/challenges')}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer space-y-2"
            >
              <div className="text-2xl">{cat.icon}</div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{cat.name}</h4>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Browse Challenges
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. JHARKHAND INTERACTIVE MAP TELEMETRY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            District Innovation Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Live decentralized map connecting remote panchayats directly to university research clusters.
          </p>
        </div>
        <JharkhandMap />
      </section>

      {/* 5. PLATFORM OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <Card className="border-emerald-600/40 overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white">
          <CardContent className="p-6 sm:p-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                JHARKHAND INNOVATE PLATFORM
              </Badge>
              <span className="text-xs text-slate-400 font-mono">POWERED BY SUPABASE + AI</span>
            </div>

            <div className="space-y-2 max-w-3xl">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                A Unified Ecosystem for State-Level Innovation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Citizens submit geolocated field challenges. The AI engine classifies and scores them. Government officers validate and allocate. Universities accept and form research teams. Students build real prototypes. Industry partners provide funding and expertise. Every milestone is tracked end-to-end with verifiable impact metrics.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">AUTHENTICATION</span>
                <span className="font-bold text-white text-base">Supabase Auth</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">DATABASE</span>
                <span className="font-bold text-white text-base">PostgreSQL + RLS</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">AI ENGINE</span>
                <span className="font-bold text-white text-base">Edge Functions</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">REALTIME</span>
                <span className="font-bold text-emerald-400 text-base">Live Channels</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => navigate('/app')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5"
              >
                Open Innovation Hub &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Ready to experience the innovation journey?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Start as a citizen reporting a local challenge, or switch to government and academic personas to see solutions come to life.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => navigate('/citizen')}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-6 h-11"
          >
            Launch Citizen App (/citizen)
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/login')}
            className="text-xs sm:text-sm px-6 h-11"
          >
            Open Innovation Hub (/app)
          </Button>
        </div>
      </section>
    </div>
  );
};
