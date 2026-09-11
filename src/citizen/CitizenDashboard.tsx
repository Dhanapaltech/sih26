import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus, Users, ArrowRight, MapPin, Sparkles, CheckCircle2, Clock, ShieldCheck, Loader2 } from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [myReports, setMyReports] = useState<Challenge[]>([]);
  const [nearbyChallenges, setNearbyChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCitizenData() {
      setIsLoading(true);
      try {
        const allChallenges = await challengesService.getChallenges();
        if (currentUser?.id) {
          const mine = allChallenges.filter((c) => c.citizenId === currentUser.id);
          setMyReports(mine);
          setNearbyChallenges(allChallenges.filter((c) => c.citizenId !== currentUser.id).slice(0, 4));
        } else {
          setMyReports([]);
          setNearbyChallenges(allChallenges.slice(0, 4));
        }
      } catch (err) {
        console.warn('Error loading citizen data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCitizenData();
  }, [currentUser]);

  const validatedCount = myReports.filter((c) =>
    ['validated', 'university_matched', 'project_created', 'prototype', 'pilot', 'deployed', 'impact_measured'].includes(c.status)
  ).length;

  const inProgressCount = myReports.filter((c) =>
    ['project_created', 'prototype', 'pilot'].includes(c.status)
  ).length;

  const resolvedCount = myReports.filter((c) =>
    ['deployed', 'impact_measured'].includes(c.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero Greeting Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Jharkhand Citizen Telemetry Node
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {currentUser?.displayName?.split(' ')[0] || 'Citizen'} 👋
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            See a local problem in your village or ward? Report it directly. Our AI engine routes validated civic challenges straight to state universities and student engineering teams.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/citizen/report')}
              size="lg"
              className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold shadow-lg gap-2 text-sm sm:text-base cursor-pointer"
            >
              <Plus className="w-5 h-5 text-emerald-700" />
              Report a Problem
            </Button>
            <Button
              onClick={() => navigate('/citizen/challenges')}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 text-sm font-semibold cursor-pointer"
            >
              Track My Submissions
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards (Real Database Derived) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Reported</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : myReports.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Validated</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : validatedCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Gov approved</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">In Progress</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : inProgressCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Univ Project Active
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Resolved</span>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : resolvedCount}
          </div>
          <span className="text-[10px] text-blue-600 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Pilot Deployed
          </span>
        </div>
      </div>

      {/* Flagship Community Impact Banner */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Grassroots Impact Summary
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {resolvedCount > 0 ? `${resolvedCount} Solutions Deployed` : 'No verified impact data yet.'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {resolvedCount > 0
                ? 'Your reported problems have active technological interventions deployed in the field!'
                : 'Report local challenges to connect with university research teams and build verified civic solutions.'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/citizen/report')}
          size="sm"
          className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs shrink-0 self-start sm:self-center cursor-pointer"
        >
          Submit New Challenge &rarr;
        </Button>
      </div>

      {/* My Recent Reports Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            My Recent Reports
          </h3>
          <button
            onClick={() => navigate('/citizen/challenges')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            See all ({myReports.length}) <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
        ) : myReports.length === 0 ? (
          <EmptyState
            type="no-challenges"
            title="No challenges submitted yet"
            description="You have not filed any civic or infrastructural challenges yet. Tap the button below to report an issue in your village or town."
            actionLabel="Report Your First Challenge"
            onAction={() => navigate('/citizen/report')}
          />
        ) : (
          <div className="space-y-3">
            {myReports.slice(0, 3).map((ch) => (
              <Card
                key={ch.id}
                onClick={() => navigate(`/citizen/challenges/${ch.id}`)}
                className="cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all border-slate-200 dark:border-slate-800"
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {ch.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {ch.title}
                      </h4>
                    </div>
                    <StatusBadge status={ch.status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ch.district} {ch.village ? `(${ch.village})` : ''}
                    </span>
                    <span>•</span>
                    <span>{ch.peopleAffected.toLocaleString()} affected</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Challenges */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Nearby Community Issues
          </h3>
          <p className="text-xs text-slate-500">Challenges reported by fellow citizens across Jharkhand.</p>
        </div>

        {nearbyChallenges.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No other community issues reported yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearbyChallenges.map((ch) => (
              <div
                key={ch.id}
                onClick={() => navigate(`/citizen/challenges/${ch.id}`)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {ch.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">{ch.district}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {ch.title}
                </h5>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>{ch.peopleAffected} citizens affected</span>
                  <span className="text-emerald-600 font-medium">View &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
