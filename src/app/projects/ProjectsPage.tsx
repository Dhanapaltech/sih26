import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '@/lib/supabase/projectsService';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderKanban, Search, ArrowRight, Loader2, Plus } from 'lucide-react';
import { SubmitProjectModal } from '@/components/projects/SubmitProjectModal';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectsService.getProjects({
        status: filter !== 'all' ? filter : undefined,
        search,
      });
      setProjects(data);
    } catch (e) {
      console.warn('Error loading projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    const handleProjectCreated = () => {
      loadProjects();
    };
    window.addEventListener('jh_project_created', handleProjectCreated);
    return () => window.removeEventListener('jh_project_created', handleProjectCreated);
  }, [filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            State Innovation Projects
          </h1>
          <p className="text-xs text-slate-500">
            Multi-disciplinary engineering ventures solving verified rural challenges across Jharkhand.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsSubmitOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Submit Innovation Project
        </Button>
      </div>

      <SubmitProjectModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onProjectCreated={() => loadProjects()}
      />

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by domain, technology, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['all', 'active', 'prototype', 'pilot'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                  filter === tab ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          type="no-projects"
          title="0 Active Projects"
          description="No innovation projects currently exist. Projects are instantiated from validated citizen challenges."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card
              key={p.id}
              onClick={() => navigate(`/app/projects/${p.id}`)}
              className="cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {p.id.substring(0, 8)}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] uppercase font-mono">
                    {p.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {p.description || 'Multidisciplinary technological solution for verified civic challenge.'}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Milestone Progress</span>
                    <span className="font-bold text-emerald-600">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-1.5" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <span>{p.district || 'Jharkhand'}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
