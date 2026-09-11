import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const CitizenChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await challengesService.getChallengeById(id);
        setChallenge(data);
      } catch (err) {
        console.error('Error fetching challenge:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const LIFECYCLE_STAGES = [
    { key: 'submitted', label: 'Problem Submitted by Citizen' },
    { key: 'ai_analyzed', label: 'AI Analyzed & Priority Scored' },
    { key: 'government_review', label: 'Government Command Review' },
    { key: 'validated', label: 'Officially Validated' },
    { key: 'university_matched', label: 'University & Lab Assigned' },
    { key: 'project_created', label: 'Engineering Project Created' },
    { key: 'prototype', label: 'Hardware/Software Prototype Built' },
    { key: 'pilot', label: 'Field Pilot Test in District' },
    { key: 'deployed', label: 'Full Scale Solution Deployed' },
    { key: 'impact_measured', label: 'Citizen Impact Measured' },
  ];

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        <p className="text-xs text-slate-500 mt-2">Loading challenge details from Supabase...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-8 text-center space-y-3">
        <h3 className="text-lg font-bold">Challenge Not Found</h3>
        <p className="text-xs text-slate-500">The requested challenge record does not exist in the database.</p>
        <Button size="sm" onClick={() => navigate('/citizen/challenges')}>
          &larr; Back to Challenges
        </Button>
      </div>
    );
  }

  const currentStageIndex = Math.max(
    0,
    LIFECYCLE_STAGES.findIndex((s) => s.key === challenge.status)
  );

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <button
        onClick={() => navigate('/citizen/challenges')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Reports
      </button>

      {/* Challenge Title Banner */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-blue-600" />
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{challenge.category}</Badge>
              <PriorityBadge priority={challenge.priority || 'medium'} />
            </div>
            <StatusBadge status={challenge.status} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
            {challenge.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {challenge.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {challenge.district} ({challenge.village || 'Panchayat Area'})
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              {challenge.peopleAffected.toLocaleString()} citizens affected
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Filed on {formatDate(challenge.submittedAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Media Evidence Gallery if available */}
      {challenge.photos && challenge.photos.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Attached Photographic Evidence (Supabase Storage)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {challenge.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                  <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifecycle Stepper */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            End-to-End Solution Lifecycle
          </CardTitle>
          <p className="text-xs text-slate-500">
            Real-time status tracking from your grassroots report to campus R&D and field resolution.
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4">
          <div className="space-y-4">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div>
                    <h5
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-amber-600 dark:text-amber-400 font-bold'
                          : isPast
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </h5>
                    {isCurrent && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Current Active Phase in Jharkhand State Workflow
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
