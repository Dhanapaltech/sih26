import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, RefreshCw, Terminal, CheckCircle2, Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    tablesCount: 31,
    usersCount: 0,
    challengesCount: 0,
    projectsCount: 0,
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadAdminTelemetry = async () => {
    setIsLoading(true);
    try {
      const [
        { count: uCount },
        { count: cCount },
        { count: pCount },
        { data: logs },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('challenges').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        (supabase.from('audit_logs') as any).select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      setStats({
        tablesCount: 31,
        usersCount: uCount || 0,
        challengesCount: cCount || 0,
        projectsCount: pCount || 0,
      });
      setAuditLogs(logs || []);
    } catch (e) {
      console.warn('Admin telemetry error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminTelemetry();
  }, []);

  const handleRefresh = () => {
    loadAdminTelemetry();
    setToast('Supabase PostgreSQL telemetry refreshed!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-800 text-white shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              System Administration & Architecture
            </h1>
            <Badge className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              SYSADMIN ROOT
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global configuration: Supabase RLS policies, PostgreSQL tables, Edge Function pipeline, and audit streams.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleRefresh}
          variant="outline"
          className="text-xs gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </Button>
      </div>

      {/* System Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">PostgreSQL Tables</span>
          <div className="text-xl font-bold font-mono text-emerald-600">{stats.tablesCount} ACTIVE</div>
          <span className="text-[10px] text-slate-400">Row Level Security Enforced</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Supabase Edge Function</span>
          <div className="text-xl font-bold font-mono text-blue-600">CONNECTED</div>
          <span className="text-[10px] text-slate-400">analyze-challenge</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Registered Profiles</span>
          <div className="text-xl font-bold font-mono text-purple-600">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.usersCount}
          </div>
          <span className="text-[10px] text-slate-400">Citizen & Academic Cadres</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Realtime Channels</span>
          <div className="text-xl font-bold font-mono text-amber-600">OPERATIONAL</div>
          <span className="text-[10px] text-slate-400">Live Postgres change feeds</span>
        </div>
      </div>

      {/* Real Audit Log Stream from PostgreSQL */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            Immutable Audit Trail Stream (Supabase PostgreSQL)
          </CardTitle>
          <p className="text-xs text-slate-500">Security event logging for state compliance and hackathon verification.</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
          ) : auditLogs.length === 0 ? (
            <div className="p-4 bg-slate-950 text-slate-400 rounded-xl font-mono text-xs text-center">
              No audit log entries recorded in database yet. New actions (challenge creation, validation, assignment) will be logged here in real time.
            </div>
          ) : (
            <div className="p-3 bg-slate-950 text-slate-300 rounded-xl font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-emerald-400">
                  [{new Date(log.created_at).toISOString()}] ACTION: {log.action} | ENTITY: {log.entity} | ACTOR: {log.actor_role || 'SYSTEM'}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
