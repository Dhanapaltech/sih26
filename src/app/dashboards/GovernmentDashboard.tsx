import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { analyticsService, StateAnalytics } from '@/lib/supabase/analyticsService';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JharkhandMap } from '@/components/maps/JharkhandMap';
import { AIInsightCard } from '@/components/ai/AIInsightCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  X,
  Eye,
  Loader2,
} from 'lucide-react';

export const GovernmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const [stats, setStats] = useState<StateAnalytics>({
    totalChallenges: 0,
    validatedChallenges: 0,
    underReviewChallenges: 0,
    activeProjects: 0,
    deployedSolutions: 0,
    universities: 0,
    industryPartners: 0,
    impactedCitizens: 0,
  });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, challengesData] = await Promise.all([
        analyticsService.getStateAnalytics(),
        challengesService.getChallenges(),
      ]);
      setStats(analyticsData);
      setChallenges(challengesData);
    } catch (err) {
      console.warn('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidate = async (id: string) => {
    try {
      await challengesService.validateChallenge(id, 'Officially validated by Department of Higher Education', currentUser?.id);
      setToastMessage(`Challenge ${id} officially validated & marked ready for university assignment!`);
      loadData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e: any) {
      setToastMessage(`Validation error: ${e.message}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await challengesService.rejectChallenge(id, 'Does not meet current state R&D criteria', currentUser?.id);
      setToastMessage(`Challenge ${id} rejected.`);
      loadData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e: any) {
      setToastMessage(`Action error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-800 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Jharkhand Innovation Command Center
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              STATE CADRE
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time inter-departmental telemetry: Grassroots civic problems to academic engineering teams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/app/ai-engine')}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Launch AI Matchmaker
          </Button>
        </div>
      </div>

      {/* 8 Real Metric Cards Grid (Derived from Supabase PostgreSQL) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Total Challenges</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.totalChallenges}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">PostgreSQL live</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Validated</span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.validatedChallenges}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Gov approved</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Under Review</span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.underReviewChallenges}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Queue pending</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Active Projects</span>
          <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.activeProjects}
          </div>
          <span className="text-[10px] text-purple-600 font-medium">In universities</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Solutions Deployed</span>
          <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.deployedSolutions}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Field operations</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Universities</span>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.universities}
          </div>
          <span className="text-[10px] text-slate-500">MOU Active</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Industry Partners</span>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.industryPartners}
          </div>
          <span className="text-[10px] text-rose-600 font-medium">CSR sponsors</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Impacted Pop</span>
          <div className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-200 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.impactedCitizens.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Verified citizens</span>
        </div>
      </div>

      {/* Jharkhand District Map Telemetry */}
      <JharkhandMap />

      {/* AI Insights & High Priority Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AIInsightCard
          title="Regional Challenge Prioritization"
          insight={
            challenges.length > 0
              ? `High urgency issues recorded across ${challenges.length} active civic submissions. Recommend assigning BIT Sindri & IIT ISM Dhanbad research labs.`
              : 'No challenges pending validation. Community telemetry nodes are standby.'
          }
          type="recommendation"
          confidence={96}
          actionLabel="View Challenges Repository"
          onAction={() => navigate('/app/challenges')}
        />
        <AIInsightCard
          title="State R&D Academic Allocation"
          insight="Automated AI matchmaker balances student team workloads across Birsa Agricultural University, BIT Sindri, and NIT Jamshedpur."
          type="opportunity"
          confidence={92}
          actionLabel="Launch AI Matchmaker"
          onAction={() => navigate('/app/ai-engine')}
        />
      </div>

      {/* Government Validation Queue Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Incoming Citizen Challenges Pending Official Validation
            </CardTitle>
            <p className="text-xs text-slate-500">
              Departmental secretaries and district magistrates review AI-synthesized priority ratings.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/challenges')}
            className="text-xs cursor-pointer"
          >
            View All ({challenges.length}) &rarr;
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
          ) : challenges.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              0 challenges submitted. No incoming challenges waiting for validation.
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Problem Summary</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Officer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:border-slate-800">
                {challenges.slice(0, 6).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{c.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.district}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {c.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority || 'medium'} />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {c.aiScore || 8.0}/10
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 text-slate-500 hover:text-slate-900 cursor-pointer"
                        onClick={() => navigate(`/app/challenges/${c.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {c.status !== 'validated' && (
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white gap-1 cursor-pointer"
                          onClick={() => handleValidate(c.id)}
                        >
                          <Check className="w-3 h-3" /> Validate
                        </Button>
                      )}
                      {c.status === 'submitted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                          onClick={() => handleReject(c.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
