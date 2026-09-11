import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengesService } from '@/lib/supabase/challengesService';
import { Challenge } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Building,
  School,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

import { supabase, isSupabaseConfigured } from '@/lib/supabase/supabaseClient';
import { DEMO_UNIVERSITIES } from '@/lib/demo/demoData';
import { SubmitProjectModal } from '@/components/projects/SubmitProjectModal';

export const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [universities, setUniversities] = useState<{ id: string; name: string; short_name: string; district: string }[]>([]);
  const [selectedUniv, setSelectedUniv] = useState('');
  const [govNotes, setGovNotes] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Load universities with demo fallback
  useEffect(() => {
    const fallbackUnivs = DEMO_UNIVERSITIES.map((u) => ({
      id: u.id,
      name: u.name,
      short_name: u.shortName,
      district: u.district,
    }));

    async function loadUniversities() {
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from('universities')
            .select('id, name, short_name, district')
            .order('name');

          if (data && data.length > 0) {
            setUniversities(data as any);
            setSelectedUniv((data[0] as any).id);
            return;
          }
        } catch (e) {
          console.warn('Failed to load universities from Supabase:', e);
        }
      }
      setUniversities(fallbackUnivs);
      if (fallbackUnivs.length > 0) setSelectedUniv(fallbackUnivs[0].id);
    }

    loadUniversities();
  }, []);

  const loadChallenge = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await challengesService.getChallengeById(id);
      setChallenge(data);
      if (data?.assignedUniversityId) setSelectedUniv(data.assignedUniversityId);
      if (data?.governmentNote) setGovNotes(data.governmentNote);
    } catch (e) {
      console.warn('Failed to load challenge:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, [id]);


  const handleValidate = async () => {
    if (!challenge) return;
    try {
      await challengesService.validateChallenge(challenge.id, govNotes);
      setActionNotice('Challenge officially validated in Supabase database!');
      loadChallenge();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e: any) {
      setActionNotice(`Validation error: ${e.message}`);
    }
  };

  const handleAssignUniversity = async () => {
    if (!challenge) return;
    try {
      await challengesService.assignUniversity(challenge.id, selectedUniv, 'Environmental & Rural Eng');
      setActionNotice('University assignment confirmed in Supabase database.');
      loadChallenge();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e: any) {
      setActionNotice(`Assignment error: ${e.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-8 text-center space-y-3">
        <h3 className="text-lg font-bold">Challenge Not Found</h3>
        <p className="text-xs text-slate-500">Record not found in Supabase.</p>
        <Button size="sm" onClick={() => navigate('/app/challenges')}>
          &larr; Back to Challenges
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-800 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {actionNotice}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/app/challenges')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Challenges Repository
      </button>

      {/* Header Banner */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-700 via-amber-500 to-purple-600" />
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">CHALLENGE {challenge.id.substring(0, 8)}</span>
              <Badge variant="outline">{challenge.category}</Badge>
              <PriorityBadge priority={challenge.priority || 'high'} />
            </div>
            <StatusBadge status={challenge.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            {challenge.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {challenge.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {challenge.district} ({challenge.village || 'Panchayat Area'})
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              {challenge.peopleAffected.toLocaleString()} citizens affected
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
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
              Attached Field Evidence (Supabase Storage)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {challenge.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                  <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Government Actions Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-600" />
            Government Oversight & Academic Assignment
          </CardTitle>
          <p className="text-xs text-slate-500">
            Authorize state resources and assign to a verified university incubation cell.
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assigned State University
              </label>
              <select
                value={selectedUniv}
                onChange={(e) => setSelectedUniv(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3"
              >
                {universities.length > 0 ? universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.short_name}) - {u.district}
                  </option>
                )) : (
                  <option value="">Loading universities…</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Government Officer Evaluation Note
              </label>
              <input
                type="text"
                value={govNotes}
                onChange={(e) => setGovNotes(e.target.value)}
                placeholder="e.g. Priority funding allocated under State Rural Mission"
                className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {challenge.status !== 'validated' && (
              <Button
                onClick={handleValidate}
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Validate Challenge in PostgreSQL
              </Button>
            )}

            <Button
              onClick={handleAssignUniversity}
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 cursor-pointer"
            >
              <School className="w-3.5 h-3.5 text-blue-600" /> Confirm University Assignment
            </Button>

            <Button
              onClick={() => setIsProjectModalOpen(true)}
              size="sm"
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs gap-1.5 cursor-pointer shadow-xs ml-auto"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Submit / Launch Innovation Project
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubmitProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialChallengeId={challenge.id}
      />
    </div>
  );
};
