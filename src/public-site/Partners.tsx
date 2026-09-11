import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, Briefcase, Loader2 } from 'lucide-react';

interface UniversityRow {
  id: string;
  name: string;
  short_name: string;
  district: string;
  type: string;
  ranking: number | null;
  active_projects: number | null;
  total_students: number | null;
}

interface IndustryRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
  district: string | null;
}

export const Partners: React.FC = () => {
  const [universities, setUniversities] = useState<UniversityRow[]>([]);
  const [industry, setIndustry] = useState<IndustryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: univs }, { data: orgs }] = await Promise.all([
          supabase
            .from('universities')
            .select('id, name, short_name, district, type, ranking, active_projects, total_students')
            .order('ranking'),
          supabase
            .from('organizations')
            .select('id, name, type, description, district')
            .eq('type', 'industry')
            .order('name'),
        ]);
        setUniversities((univs as any) || []);
        setIndustry((orgs as any) || []);
      } catch (e) {
        console.warn('Failed to load partners:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-3">
        <Badge className="bg-emerald-800 text-white text-[10px]">INNOVATION COALITION</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          Participating Universities &amp; Industry Partners
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          State-wide institutional alliance driving grassroots technology transfer across Jharkhand.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-sm text-slate-500">Loading partners…</span>
        </div>
      )}

      {/* Universities */}
      {!loading && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-600" /> Academic &amp; Engineering Universities
          </h3>
          {universities.length === 0 ? (
            <p className="text-sm text-slate-500">No universities registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {universities.map((u) => (
                <Card key={u.id} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="text-[10px] uppercase">{u.type}</Badge>
                      {u.ranking && (
                        <span className="text-xs font-mono font-bold text-emerald-600">Rank #{u.ranking}</span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{u.name}</h4>
                    <div className="text-xs text-slate-500">District: {u.district}</div>
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      Active Projects: <strong>{u.active_projects ?? 0}</strong>
                      {u.total_students ? ` • Students: ${u.total_students.toLocaleString()}` : ''}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Industry Partners */}
      {!loading && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" /> CSR &amp; Corporate Co-Sponsors
          </h3>
          {industry.length === 0 ? (
            <p className="text-sm text-slate-500">No industry partners registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industry.map((p) => (
                <Card key={p.id} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-5 space-y-2">
                    <Badge variant="outline" className="text-[10px] uppercase">{p.type}</Badge>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                    {p.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                    )}
                    {p.district && (
                      <p className="text-[11px] text-slate-400">District: {p.district}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
