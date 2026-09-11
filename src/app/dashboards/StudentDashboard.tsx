import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { projectsService } from '@/lib/supabase/projectsService';
import { challengesService } from '@/lib/supabase/challengesService';
import { Project, Task, Challenge } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderKanban, ArrowRight, Loader2, Sparkles, Lightbulb, Plus, FolderPlus } from 'lucide-react';
import { SubmitProjectModal } from '@/components/projects/SubmitProjectModal';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedChallengeForProject, setSelectedChallengeForProject] = useState<string>('');

  async function loadStudentData() {
    setIsLoading(true);
    try {
      const [projs, chs] = await Promise.all([
        projectsService.getProjects(),
        challengesService.getChallenges(),
      ]);
      setProjects(projs);
      setChallenges(chs);
      if (projs.length > 0) {
        const tList = await projectsService.getTasks(projs[0].id);
        setTasks(tList);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.warn('Student dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudentData();

    const handleChallengeSync = () => loadStudentData();
    const handleProjectSync = () => loadStudentData();

    window.addEventListener('jh_challenge_created', handleChallengeSync);
    window.addEventListener('jh_challenge_updated', handleChallengeSync);
    window.addEventListener('jh_project_created', handleProjectSync);

    return () => {
      window.removeEventListener('jh_challenge_created', handleChallengeSync);
      window.removeEventListener('jh_challenge_updated', handleChallengeSync);
      window.removeEventListener('jh_project_created', handleProjectSync);
    };
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Student Innovation Hub
            </h1>
            <Badge variant="outline" className="text-emerald-700 border-emerald-600/40">
              {currentUser?.displayName || 'Student Innovator'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build solutions for genuine grassroots problems, earn state Innovation Points, and qualify for incubation grants.
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

      {/* 4 Stats Cards (Real Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Active Projects</span>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.length}
          </div>
          <span className="text-[10px] text-purple-600 font-medium">PostgreSQL active</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Assigned Tasks</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : tasks.length}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Pending execution</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Innovation Points</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {currentUser?.innovationPoints || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Civic ledger</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Completed Tasks</span>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : tasks.filter((t) => t.status === 'completed').length}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">Verified code & tests</span>
        </div>
      </div>

      {/* Projects List */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-emerald-600" />
            Engineering Projects Assigned to You
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
          ) : projects.length === 0 ? (
            <EmptyState
              type="no-projects"
              title="0 Assigned Projects"
              description="You have not been assigned to an engineering project cell yet. When faculty mentors add you, the workspace will appear here."
            />
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/app/projects/${p.id}`)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.title}</h4>
                    <p className="text-xs text-slate-500">{p.district} • Progress: {p.progress}%</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs gap-1 cursor-pointer">
                    Open Team Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Citizen Problem Statements (Live Grassroots Challenges) */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Citizen Reports & Community Problems
            </CardTitle>
            <p className="text-xs text-slate-500">
              Grassroots problems reported by citizens across Jharkhand. Select any challenge to review details and propose an innovation.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/app/challenges')} className="text-xs cursor-pointer">
            Browse All Problems &rarr;
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2">
          {isLoading ? (
            <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
          ) : challenges.length === 0 ? (
            <EmptyState
              type="no-challenges"
              title="0 Citizen Reports Found"
              description="No citizen problem statements submitted yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {challenges.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/app/challenges/${c.id}`)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{c.category}</Badge>
                      <PriorityBadge priority={c.priority || 'medium'} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                    <span className="text-slate-500 font-medium">📍 {c.district}{c.village ? `, ${c.village}` : ''}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[11px] px-2 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChallengeForProject(c.id);
                          setIsProjectModalOpen(true);
                        }}
                      >
                        <FolderPlus className="w-3 h-3 mr-1" /> Propose Solution
                      </Button>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1 group-hover:underline">
                        <Lightbulb className="w-3.5 h-3.5" /> View
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SubmitProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialChallengeId={selectedChallengeForProject}
        onProjectCreated={() => loadStudentData()}
      />
    </div>
  );
};
