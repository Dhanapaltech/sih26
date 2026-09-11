import React, { useEffect, useState } from 'react';
import { JHARKHAND_DISTRICTS } from '@/lib/constants';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Target, CheckCircle } from 'lucide-react';

interface DistrictStats {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  challenges: number;
  projects: number;
  solutions: number;
  citizens: number;
}

interface JharkhandMapProps {
  onDistrictSelect?: (district: DistrictStats) => void;
  selectedDistrictId?: string;
}

export const JharkhandMap: React.FC<JharkhandMapProps> = ({
  onDistrictSelect,
  selectedDistrictId = 'dumka',
}) => {
  const [hovered, setHovered] = useState<DistrictStats | null>(null);
  const [districts, setDistricts] = useState<DistrictStats[]>(() =>
    JHARKHAND_DISTRICTS.map((d) => ({ ...d, challenges: 0, projects: 0, solutions: 0, citizens: 0 }))
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [{ data: chData }, { data: projData }] = await Promise.all([
          supabase.from('challenges').select('district'),
          supabase.from('projects').select('district, status'),
        ]);

        const chMap = new Map<string, number>();
        (chData || []).forEach((r: any) => {
          if (r.district) chMap.set(r.district, (chMap.get(r.district) || 0) + 1);
        });

        const projMap = new Map<string, number>();
        const solMap = new Map<string, number>();
        (projData || []).forEach((r: any) => {
          if (r.district) {
            projMap.set(r.district, (projMap.get(r.district) || 0) + 1);
            if (r.status === 'deployed') {
              solMap.set(r.district, (solMap.get(r.district) || 0) + 1);
            }
          }
        });

        setDistricts(
          JHARKHAND_DISTRICTS.map((d) => ({
            ...d,
            challenges: chMap.get(d.name) || 0,
            projects: projMap.get(d.name) || 0,
            solutions: solMap.get(d.name) || 0,
            citizens: 0, // will be populated from impact_metrics in a future enhancement
          }))
        );
      } catch (e) {
        console.warn('JharkhandMap: could not load live stats', e);
      }
    };

    loadStats();
  }, []);

  const selected = districts.find((d) => d.id === selectedDistrictId) || districts[0];

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Jharkhand District Innovation Index
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Click any district to inspect grassroots challenges and active university prototypes.
          </p>
        </div>
        <Badge variant="outline" className="text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400">
          15 Districts Monitored
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Map canvas / grid layout */}
          <div className="lg:col-span-2 relative bg-slate-900 rounded-2xl p-6 min-h-[380px] flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Ambient background decoration */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="flex justify-between items-center z-10 text-slate-400 text-xs font-mono">
              <span>STATE OF JHARKHAND — SPATIAL CADRE</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                LIVE SUPABASE DATA
              </span>
            </div>

            {/* Grid of Districts representing spatial topography */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 my-auto py-4 z-10">
              {districts.map((d) => {
                const isSel = selected?.id === d.id;
                const isHov = hovered?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onDistrictSelect?.(d)}
                    onMouseEnter={() => setHovered(d)}
                    onMouseLeave={() => setHovered(null)}
                    className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[82px] cursor-pointer ${
                      isSel
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg scale-105 z-20 ring-2 ring-emerald-300/50'
                        : isHov
                        ? 'bg-slate-800 text-slate-100 border-slate-600 scale-102 z-10'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold truncate tracking-tight">{d.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isSel ? 'bg-white/20 text-white' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        {d.challenges} ch
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75 mt-2 flex items-center justify-between">
                      <span>{d.projects} Proj</span>
                      <span className="text-emerald-300 font-mono">{d.solutions} sol</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 z-10 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-600" /> Active Grid
                </span>
              </div>
              <span className="text-slate-500">Coordinate system: WGS84 Reference Grid</span>
            </div>
          </div>

          {/* Selected District Spotlight panel */}
          {selected && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    District Profile
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50">{selected.name}</h4>
                </div>
                <Badge className="bg-emerald-800 text-white font-mono text-xs">
                  Pop: {(selected.population / 100000).toFixed(1)} Lakh
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    Challenges
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selected.challenges}</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {selected.challenges > 0 ? 'Live data' : 'No data yet'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    Projects
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selected.projects}</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Active R&D</span>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Dominant Priority Focus:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">Water &amp; Rural Health</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  Innovation pipeline connects district panchayats to Jharkhand state universities with real-time challenge tracking.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700/60 pt-3">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {selected.solutions} Deployed Solutions
                </span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {selected.projects} University Projects
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
