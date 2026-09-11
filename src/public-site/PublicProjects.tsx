import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '@/lib/supabase/projectsService';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, FolderKanban } from 'lucide-react';

export const PublicProjects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    projectsService
      .getProjects()
      .then(setProjects)
      .catch((e) => {
        console.error('Failed to load projects:', e);
        setError('Failed to load projects. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          State Academic R&D Engineering Projects
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Explore research and software/hardware prototypes underway in Jharkhand engineering institutions.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-sm text-slate-500">Loading projects…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No projects yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            R&D projects are created once challenges are validated and assigned to universities.
          </p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Card
              key={p.id}
              onClick={() => navigate(`/app/projects/${p.id}`)}
              className="cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-purple-600" />
              <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {p.status}
                    </Badge>
                    <span className="text-xs font-bold font-mono text-emerald-600">
                      {p.progress}% Ready
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <Progress value={p.progress} indicatorColor="bg-emerald-600" className="h-2" />
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    {p.district && (
                      <span>District: <strong>{p.district}</strong></span>
                    )}
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      Open Project &rarr;
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
