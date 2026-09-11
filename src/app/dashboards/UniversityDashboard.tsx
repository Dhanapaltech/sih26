import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengesService } from '@/lib/supabase/challengesService';
import { projectsService } from '@/lib/supabase/projectsService';
import { Challenge, Project } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Sparkles, Eye, Loader2, FolderPlus, Plus } from 'lucide-react';
import { SubmitProjectModal } from '@/components/projects/SubmitProjectModal';

export const UniversityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'validated'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedChallengeForProject, setSelectedChallengeForProject] = useState<string>('');

  async function loadUnivData() {
    setIsLoading(true);
    try {
      const [allChs, allProjs] = await Promise.all([
        challengesService.getChallenges(),
        projectsService.getProjects(),
      ]);
      setChallenges(allChs);
      setProjects(allProjs);
    } catch (err) {
      console.warn('Error loading university dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUnivData();

    const handleChallengeSync = () => loadUnivData();
    const handleProjectSync = () => loadUnivData();

    window.addEventListener('jh_challenge_created', handleChallengeSync);
    window.addEventListener('jh_challenge_updated', handleChallengeSync);
    window.addEventListener('jh_project_created', handleProjectSync);

    return () => {
      window.removeEventListener('jh_challenge_created', handleChallengeSync);
      window.removeEventListener('jh_challenge_updated', handleChallengeSync);
      window.removeEventListener('jh_project_created', handleProjectSync);
    };
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (activeTab === 'submitted') return c.status === 'submitted' || c.status === 'ai_analyzed';
    if (activeTab === 'validated') return ['validated', 'university_matched', 'project_created'].includes(c.status);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              University Innovation Hub
            </h1>
            <Badge variant="outline" className="text-emerald-700 border-emerald-600/40">
              Academic R&D Coordination
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Academic R&D Coordination: Review citizen-reported problems, assign departments, approve student teams, and monitor progress.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setSelectedChallengeForProject('');
            setIsProjectModalOpen(true);
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Submit Innovation Project
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Total Reported</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : challenges.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">From citizens & districts</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">New Submissions</span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : challenges.filter(c => c.status === 'submitted' || c.status === 'ai_analyzed').length}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting university review</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Active Projects</span>
          <div className="text-2xl font-bold font-mono text-purple-600 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.length}
          </div>
          <span className="text-[10px] text-purple-600">In incubation</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Field Pilots</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.filter((p) => p.status === 'pilot').length}
          </div>
          <span className="text-[10px] text-emerald-600">In districts</span>
        </div>
      </div>

      {/* Available Challenges for Academic Takeup */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Citizen Reports & State Challenges
            </CardTitle>
            <p className="text-xs text-slate-500">
              Grassroots problems submitted by citizens. Select a challenge to review, assign faculty mentors, and launch student engineering cells.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({challenges.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('submitted')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === 'submitted' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                New Submissions ({challenges.filter(c => c.status === 'submitted' || c.status === 'ai_analyzed').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('validated')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === 'validated' ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Validated ({challenges.filter(c => ['validated', 'university_matched', 'project_created'].includes(c.status)).length})
              </button>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/challenges')} className="text-xs cursor-pointer">
              Browse All &rarr;
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
          ) : filteredChallenges.length === 0 ? (
            <div className="p-8">
              <EmptyState
                type="no-challenges"
                title="0 Challenges Found"
                description="No citizen challenges match the selected filter."
              />
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Problem Summary</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:border-slate-800">
                {filteredChallenges.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">{c.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-sm truncate">{c.title}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.district}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className="text-[10px]">{c.category}</Badge></td>
                    <td className="py-3 px-4"><PriorityBadge priority={c.priority || 'medium'} /></td>
                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                    <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] px-2 gap-1 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 cursor-pointer"
                        onClick={() => {
                          setSelectedChallengeForProject(c.id);
                          setIsProjectModalOpen(true);
                        }}
                      >
                        <FolderPlus className="w-3 h-3" /> Submit Project
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2 cursor-pointer" onClick={() => navigate(`/app/challenges/${c.id}`)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <SubmitProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialChallengeId={selectedChallengeForProject}
        onProjectCreated={() => loadUnivData()}
      />
    </div>
  );
};
