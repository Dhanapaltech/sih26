import React from 'react';
import { AIAnalysis } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Sparkles, Brain, Cpu, Users, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AIAnalysisResultProps {
  analysis: AIAnalysis;
}

export const AIAnalysisResult: React.FC<AIAnalysisResultProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/30 border border-emerald-400/30 backdrop-blur-md">
            <Brain className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight">AI Multi-Modal Synthesis Complete</h3>
              <Badge variant="demo" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                {analysis.engine === 'external' ? 'Gemini AI API' : 'AI-Assisted Analysis'}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Natural language intent mapped to academic research disciplines and industrial capabilities.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] uppercase text-emerald-300 font-semibold block">Confidence</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{analysis.confidence}%</span>
          </div>
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] uppercase text-amber-300 font-semibold block">Severity</span>
            <span className="text-lg font-bold font-mono text-amber-400">{analysis.severityScore}/10</span>
          </div>
        </div>
      </div>

      {/* Primary Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Classification & Domain
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {analysis.category}
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              {analysis.subcategory}
            </Badge>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Suggested Priority:</span>
              <PriorityBadge priority={analysis.priority} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Target Demographic Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {analysis.estimatedPeopleAffected.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">citizens directly affected</span>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              Estimated timeline: {analysis.impactPrediction.timeToSolve}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              Grant bracket: {analysis.impactPrediction.costEstimate}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Recommended Solution Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {analysis.recommendedSolution}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Architecture: {analysis.solutionType}
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {analysis.impactPrediction.sdgGoals.slice(0, 2).map((sdg, i) => (
                <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                  {sdg}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Skills & Academic Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Synthesized Skills & Tech Stack
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              Team Requirements
            </Badge>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-xs text-slate-500 mb-3">
              Students and research scholars possessing the following competencies are automatically ranked for recruitment:
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Optimal University & Lab Matches
            </CardTitle>
            <Badge variant="info" className="text-[10px]">
              AI Ranked
            </Badge>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2.5">
            {analysis.universityMatches.map((univ, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {univ.universityName}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({univ.departments.join(', ')})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {univ.reasons[0] || 'Proximity and lab facilities'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {univ.matchScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">Fit Score</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
