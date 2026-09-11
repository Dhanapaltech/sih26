import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Building2,
  School,
  GraduationCap,
  Briefcase,
  Smartphone,
  ArrowRight,
} from 'lucide-react';

const STAKEHOLDER_ROLES = [
  {
    icon: Smartphone,
    color: '#059669',
    title: 'Citizen Reporter',
    subtitle: '/citizen PWA',
    description:
      'Residents across 24 districts document real civic challenges — water contamination, road damage, crop disease — with GPS evidence through a mobile-first installable app.',
  },
  {
    icon: Building2,
    color: '#2563EB',
    title: 'Government',
    subtitle: 'District Command Center',
    description:
      'District Magistrates and State Officers validate AI-scored challenges, allocate budget codes, and assign them to partner universities for academic engineering.',
  },
  {
    icon: School,
    color: '#7C3AED',
    title: 'University',
    subtitle: 'Academic R&D Hub',
    description:
      'BIT Sindri, IIT ISM Dhanbad, NIT Jamshedpur, and 12+ partner institutions accept challenges under MOU, form engineering cells, and manage prototype incubation.',
  },
  {
    icon: GraduationCap,
    color: '#F97316',
    title: 'Faculty Mentor',
    subtitle: 'Principal Investigator',
    description:
      'Faculty members act as Principal Investigators — defining milestones, recruiting AI-matched student teams, and guiding prototype development to field-ready solutions.',
  },
  {
    icon: Users,
    color: '#F59E0B',
    title: 'Student Innovator',
    subtitle: 'Engineering Cell',
    description:
      'Students join project teams based on AI skill-matching scores. They earn Innovation Points, complete Kanban tasks, and receive blockchain-verifiable State Innovation Certificates.',
  },
  {
    icon: Briefcase,
    color: '#DC2626',
    title: 'Industry & Startup',
    subtitle: 'CSR Co-Sponsor',
    description:
      'Corporate partners provide hardware kits, cloud credits, pilot sites, and mentorship under CSR mandates — tracked transparently through the industry partnership portal.',
  },
];

const TECH_STACK = [
  { label: 'Frontend', value: 'React 19 + TypeScript + Vite' },
  { label: 'Styling', value: 'Tailwind CSS v4 + Lucide React' },
  { label: 'Backend', value: 'Supabase PostgreSQL + RLS' },
  { label: 'Realtime', value: 'Supabase Realtime Channels' },
  { label: 'AI Engine', value: 'Edge Functions + Local NLP' },
  { label: 'Maps', value: 'Interactive SVG + Geolocation' },
  { label: 'PWA', value: 'Service Worker + Web Manifest' },
  { label: 'Auth', value: 'Supabase Auth + RBAC' },
];

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">
      {/* Hero */}
      <div className="text-center space-y-4">
        <Badge className="bg-emerald-800 text-white text-[10px]">SMART INDIA HACKATHON 2026</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          About Jharkhand Innovation Hub
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          <em>"From Local Problems to Real Solutions."</em> — A unified civic-engineering ecosystem
          built to close the gap between rural communities and university laboratories.
        </p>
      </div>

      {/* Mission */}
      <Card className="border-emerald-600/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        <CardContent className="p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Our Mission</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            A Statewide Platform Engineering Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Jharkhand Innovation Hub connects two interfaces on a single shared backend: a{' '}
            <strong className="text-white">Citizen Report App (/citizen)</strong> — a mobile-first
            PWA for citizens to document civic problems with GPS and photo evidence — and a{' '}
            <strong className="text-white">Common Innovation Workbench (/app)</strong> — a
            role-adaptive professional platform for Government Officers, Universities, Faculty, Students,
            and Industry CSR Partners. Every stakeholder sees the same live Supabase data, driving a
            10-stage pipeline from problem to measurable impact.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'Districts Covered', value: '24' },
              { label: 'Partner Universities', value: '15+' },
              { label: 'Pipeline Stages', value: '10' },
              { label: 'Stakeholder Roles', value: '7' },
            ].map((s) => (
              <div key={s.label} className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
                <div className="text-2xl font-bold font-mono text-emerald-400">{s.value}</div>
                <div className="text-[10px] text-slate-300 uppercase font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Roles */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Who Uses Jharkhand Innovation Hub?
          </h2>
          <p className="text-xs text-slate-500">
            Seven distinct stakeholder cadres, each with a purpose-built role interface.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAKEHOLDER_ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.title} className="border-slate-200 dark:border-slate-800 overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${role.color}18`, color: role.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{role.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{role.subtitle}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SIH 2026 Demo Case Study */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-400">
            SIH 2026 FLAGSHIP DEMO CASE
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Unsafe Drinking Water in Sikaripara Panchayat, Dumka
          </h2>
        </div>
        <Card className="border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {[
                {
                  step: '01',
                  actor: 'Citizen — Rahul Mahto',
                  action:
                    'Reports severe fluoride and arsenic contamination from handpumps affecting 2,400 villagers in Sikaripara. Submits photos and GPS coordinates via the /citizen app.',
                },
                {
                  step: '02',
                  actor: 'AI Engine',
                  action:
                    'Categorizes into Water Management, assigns High Priority (8.7/10), detects 2 similar groundwater reports nearby, and recommends an AI + IoT Water Quality Monitoring System.',
                },
                {
                  step: '03',
                  actor: 'Government — District Magistrate',
                  action:
                    'Validates the challenge and assigns it to Birsa Institute of Technology (BIT Sindri) under the MOU framework.',
                },
                {
                  step: '04',
                  actor: 'Faculty — Dr. Anita Verma (BIT Sindri)',
                  action:
                    'Acts as Principal Investigator for project proj-001, defines 5 milestones, and invites Amit Oraon (95% IoT skill match) and 7 other engineers.',
                },
                {
                  step: '05',
                  actor: 'Industry — DemoTech Solutions',
                  action:
                    'Sponsors 15 solar-powered ESP32 telemetry sensor pods with Rs.5L CSR funding through the Industry Partnership portal.',
                },
                {
                  step: '06',
                  actor: 'Citizen Impact',
                  action:
                    'Rahul Mahto and 2,400 villagers receive safe water alerts. Waterborne illness incidents decline by 64%. Impact recorded in the platform.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.actor}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tech Stack */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Technology Stack</h2>
          <p className="text-xs text-slate-500">Production-grade architecture powering a real civic innovation platform.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TECH_STACK.map((t) => (
            <div
              key={t.label}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1"
            >
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">{t.label}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-3">
        <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
          Experience the full innovation lifecycle
        </h4>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="sm"
            onClick={() => navigate('/citizen/report')}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs gap-1.5"
          >
            File a Challenge as Citizen <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/how-it-works')}
            className="text-xs"
          >
            See the 10-Stage Pipeline →
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/login')}
            className="text-xs"
          >
            Sign In with Demo Role
          </Button>
        </div>
      </div>
    </div>
  );
};
