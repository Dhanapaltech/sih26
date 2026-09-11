import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { projectsService } from '@/lib/supabase/projectsService';
import { Project } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderKanban, ArrowRight, Loader2 } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFacultyProjects() {
      setIsLoading(true);
      try {
        const projs = await projectsService.getProjects();
        setProjects(projs);
      } catch (e) {
        console.warn('Error loading faculty projects:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFacultyProjects();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Faculty Innovation Workspace
            </h1>
            <Badge variant="outline" className="text-emerald-700 border-emerald-600/40">
              {currentUser?.displayName || 'Faculty Mentor'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mentorship Console: Oversee student software/hardware engineering, milestone verification, and partner co-development.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Supervised Projects</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">PostgreSQL active</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Prototypes in Lab</span>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.filter((p) => p.status === 'prototype').length}
          </div>
          <span className="text-[10px] text-blue-600">Testing & calibration</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Field Pilots</span>
          <div className="text-2xl font-bold font-mono text-purple-600 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.filter((p) => p.status === 'pilot').length}
          </div>
          <span className="text-[10px] text-purple-600">Village sites</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium block">Completed</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.filter((p) => p.status === 'completed').length}
          </div>
          <span className="text-[10px] text-emerald-600">Deployed solutions</span>
        </div>
      </div>

      {/* Projects List */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-emerald-600" />
            Supervised Engineering Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
          ) : projects.length === 0 ? (
            <EmptyState
              type="no-projects"
              title="0 Supervised Projects"
              description="No research projects assigned yet. Validated challenges assigned by the Government will appear here."
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
                    Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
