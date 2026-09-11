import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Loader2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<{ name: string; challenges: number }[]>([]);
  const [districtData, setDistrictData] = useState<{ name: string; challenges: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const { data: challenges } = await (supabase.from('challenges') as any)
          .select('category, district, status');

        if (challenges && challenges.length > 0) {
          setTotalCount(challenges.length);

          // Category distribution
          const catMap = new Map<string, number>();
          challenges.forEach((c: any) => {
            const cat = c.category || 'Other';
            catMap.set(cat, (catMap.get(cat) || 0) + 1);
          });
          const cData = Array.from(catMap.entries()).map(([name, count]) => ({
            name: name.split(' ')[0],
            challenges: count,
          }));
          setCategoryData(cData);

          // District distribution
          const distMap = new Map<string, number>();
          challenges.forEach((c: any) => {
            const dist = c.district || 'Unknown';
            distMap.set(dist, (distMap.get(dist) || 0) + 1);
          });
          const dData = Array.from(distMap.entries())
            .map(([name, count]) => ({ name, challenges: count }))
            .sort((a, b) => b.challenges - a.challenges)
            .slice(0, 8);
          setDistrictData(dData);

          // Status breakdown
          const statusMap = new Map<string, number>();
          challenges.forEach((c: any) => {
            const st = c.status || 'submitted';
            statusMap.set(st, (statusMap.get(st) || 0) + 1);
          });

          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#065f46'];
          let colorIdx = 0;
          const sData = Array.from(statusMap.entries()).map(([name, val]) => ({
            name: name.replace('_', ' '),
            value: val,
            color: colors[colorIdx++ % colors.length],
          }));
          setStatusData(sData);
        } else {
          setTotalCount(0);
          setCategoryData([]);
          setDistrictData([]);
          setStatusData([]);
        }
      } catch (err) {
        console.warn('Analytics loading error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Executive State Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Live aggregations from PostgreSQL: Domain distributions, district telemetry, and pipeline throughput.
        </p>
      </div>

      {isLoading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        </div>
      ) : totalCount === 0 ? (
        <EmptyState
          title="0 Challenges Recorded"
          description="Analytics charts will populate dynamically as citizens report problems across Jharkhand districts."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Domain Breakdown */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Challenges by Sector Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="challenges" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* District Breakdown */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Top Districts by Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="challenges" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="border-slate-200 dark:border-slate-800 md:col-span-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                Challenge Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex flex-col sm:flex-row items-center justify-around gap-4">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {statusData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="capitalize font-semibold">{item.name}:</span>
                    <span className="font-mono text-slate-500">{item.value} challenges</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
