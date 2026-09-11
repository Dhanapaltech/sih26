import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Static process description — describes the platform workflow (not demo data)
const PLATFORM_STAGES = [
  { id: 'citizen', label: 'Citizen Reports', icon: '👤', color: '#166534', description: 'A citizen identifies and submits a real local problem — water contamination, road access, crop disease — with GPS coordinates and photo evidence.' },
  { id: 'ai', label: 'AI Analysis', icon: '🤖', color: '#2563EB', description: 'The AI engine classifies the challenge by domain, assigns a priority score (1–10), detects duplicates, and matches relevant university departments.' },
  { id: 'government', label: 'Government Validation', icon: '🏛️', color: '#7C3AED', description: 'District officials or state officers review the AI assessment, validate the challenge, allocate a budget code, and assign it to a partner university.' },
  { id: 'university', label: 'University Accepts', icon: '🎓', color: '#059669', description: 'The university formally accepts the challenge under MOU, selects the appropriate engineering or science department, and opens a project workspace.' },
  { id: 'faculty', label: 'Faculty Creates Project', icon: '👩‍🏫', color: '#F97316', description: 'A faculty member acts as Principal Investigator, defines project milestones, and invites AI-matched students from the talent pool.' },
  { id: 'students', label: 'Students Join', icon: '👨‍💻', color: '#F59E0B', description: 'Students apply or are invited based on AI skill-matching scores. They collaborate in a shared project workspace with tasks, milestones, and live chat.' },
  { id: 'industry', label: 'Industry Supports', icon: '🏭', color: '#DC2626', description: 'Corporate CSR partners contribute hardware, funding, or mentorship. Industry proposals are evaluated and approved by the university team.' },
  { id: 'prototype', label: 'Prototype Built', icon: '🔧', color: '#0EA5E9', description: 'Students build the prototype in university labs with faculty guidance. Progress is tracked in real-time with milestone approvals required at each stage.' },
  { id: 'pilot', label: 'Pilot Testing', icon: '🚀', color: '#8B5CF6', description: 'The working prototype is tested in the actual field location. Sensor data, usage metrics, and community feedback are captured in the platform.' },
  { id: 'deployment', label: 'Solution Deployed', icon: '📡', color: '#166534', description: 'After successful pilot verification, the solution is scaled statewide. Community members are trained and the deployment is officially recorded.' },
  { id: 'impact', label: 'Impact Measured', icon: '📊', color: '#059669', description: 'Real-world outcomes — citizens benefited, cost savings, jobs created — are captured as verifiable impact metrics visible to the public.' },
  { id: 'certificate', label: 'Certificates Issued', icon: '🏆', color: '#F59E0B', description: 'Students receive blockchain-verifiable certificates with QR codes documenting their contribution, skills demonstrated, and measurable social impact.' },
];

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <Badge className="bg-emerald-800 text-white text-[10px]">TRANSPARENT PROCESS</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          How Jharkhand Innovate Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          An end-to-end lifecycle taking citizen voice through scientific research, industry co-sponsorship, and field deployment.
        </p>
      </div>

      <div className="space-y-4">
        {PLATFORM_STAGES.map((stage, idx) => (
          <Card key={stage.id} className="border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardContent className="p-4 sm:p-5 flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
              >
                {stage.icon}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">STAGE {idx + 1}</span>
                  <Badge variant="outline" className="text-[10px]">Audited Step</Badge>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {stage.label}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-3">
        <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
          Ready to experience the workflow firsthand?
        </h4>
        <div className="flex justify-center gap-3">
          <Button
            size="sm"
            onClick={() => navigate('/citizen/report')}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs"
          >
            File a Challenge as Citizen
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
