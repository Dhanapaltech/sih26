import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { projectsService } from '@/lib/supabase/projectsService';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Project } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Briefcase,
  Handshake,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';

export const IndustryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [companyName, setCompanyName] = useState(currentUser?.displayName || '');
  const [supportType, setSupportType] = useState('Hardware & Cloud Credits');
  const [fundingAmount, setFundingAmount] = useState('500000');
  const [proposalNotes, setProposalNotes] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        const data = await projectsService.getProjects();
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].id);
      } catch (err) {
        console.warn('Error loading projects for industry:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleProposePartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      await (supabase.from('partnerships') as any).insert({
        project_id: selectedProjectId,
        company_name: companyName,
        support_types: [supportType],
        funding_amount: Number(fundingAmount) || 0,
        description: proposalNotes,
        status: 'pending',
      });

      setSubmittedNotice('Partnership proposal submitted successfully to Supabase!');
      setPartnerModalOpen(false);
      setTimeout(() => setSubmittedNotice(null), 3500);
    } catch (err: any) {
      console.warn('Failed to submit partnership:', err);
    }
  };

  return (
    <div className="space-y-6">
      {submittedNotice && (
        <div className="p-4 rounded-xl bg-emerald-800 text-white shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {submittedNotice}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Industry & Startup Innovation Hub
            </h1>
            <Badge variant="outline" className="text-emerald-700 border-emerald-600/40">
              {currentUser?.displayName || 'Industry Partner'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Corporate Social Responsibility (CSR) & Incubation: Provide hardware kits, cloud credits, pilot sites, and mentorship.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setPartnerModalOpen(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs gap-1.5 self-start cursor-pointer"
        >
          <Handshake className="w-4 h-4" /> Propose New Partnership / CSR Grant
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Projects Seeking Support</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Statewide pipeline</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Active Prototypes</span>
          <div className="text-2xl font-bold font-mono text-purple-600">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.filter((p) => p.status === 'prototype').length}
          </div>
          <span className="text-[10px] text-purple-600 font-medium">Ready for pilot testing</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Field Deployments</span>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : projects.filter((p) => p.status === 'deployed').length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Operational in districts</span>
        </div>
      </div>

      {/* Projects Repository */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Discover Eligible Projects for Sponsorship & CSR Co-Development
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
          ) : projects.length === 0 ? (
            <EmptyState
              type="no-projects"
              title="0 Projects Seeking CSR Support"
              description="No projects currently active. As academic engineering teams begin incubation, sponsorship opportunities will appear here."
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
                    <p className="text-xs text-slate-500">{p.district} • Status: {p.status}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs gap-1 cursor-pointer">
                    Inspect Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partnership Proposal Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Propose Partnership / CSR Sponsorship</h3>
              <button onClick={() => setPartnerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProposePartnership} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Target Engineering Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full h-9 rounded-lg border px-3 bg-white dark:bg-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-9 rounded-lg border px-3 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Support Category</label>
                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  className="w-full h-9 rounded-lg border px-3 bg-white dark:bg-slate-800"
                >
                  <option value="Hardware & Cloud Credits">Hardware & Cloud Credits</option>
                  <option value="Financial CSR Grant">Financial CSR Grant</option>
                  <option value="Technical Mentorship">Technical Mentorship</option>
                  <option value="Pilot Testing Site">Pilot Testing Site</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Funding / Value Allocation (INR)</label>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="w-full h-9 rounded-lg border px-3 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Proposal Scope & Notes</label>
                <textarea
                  rows={3}
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  placeholder="Details of hardware, engineering mentorship, or pilot facilities to offer..."
                  className="w-full rounded-lg border p-2 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPartnerModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-800 text-white font-bold">
                  Submit Proposal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
