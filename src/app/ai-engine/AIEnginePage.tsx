import React, { useState } from 'react';
import { aiService } from '@/lib/supabase/aiService';
import { AIAnalysis } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIAnalysisResult } from '@/components/ai/AIAnalysisResult';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  Building,
  GraduationCap,
  Users,
  Briefcase,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const AIEnginePage: React.FC = () => {
  const [inputTitle, setInputTitle] = useState(
    'Groundwater contamination and high fluoride levels in rural handpumps of Dumka'
  );
  const [inputDesc, setInputDesc] = useState(
    'Villagers suffer from tooth fluorosis and joint pain due to deep borewells pulling untreated mineral deposits. Need low-cost IoT telemetry and automated community warning.'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [result, setResult] = useState<AIAnalysis | null>(null);

  const PIPELINE_STEPS = [
    { name: 'Problem Understanding', icon: Brain, desc: 'Semantic intent & entity extraction' },
    { name: 'Classification', icon: Layers, desc: 'Mapping to Jharkhand civic priority domains' },
    { name: 'Priority Calculation', icon: AlertTriangle, desc: 'Severity, affected population & urgency formula' },
    { name: 'Duplicate Detection', icon: Search, desc: 'Vector and keyword similarity search in Supabase' },
    { name: 'University Matching', icon: Building, desc: 'Scoring state labs & engineering departments' },
    { name: 'Faculty Matching', icon: GraduationCap, desc: 'Locating Principal Investigators with domain expertise' },
    { name: 'Student Matching', icon: Users, desc: 'Parsing student skills: IoT, Embedded, AI/ML, Web' },
    { name: 'Industry Matching', icon: Briefcase, desc: 'Matching CSR mandates: Hardware, cloud grants' },
    { name: 'Solution Recommendation', icon: Lightbulb, desc: 'Synthesizing technical architecture blueprint' },
    { name: 'Impact Prediction', icon: TrendingUp, desc: 'Estimating citizen reach, budget & UN SDG alignments' },
    { name: 'Project Risk Prediction', icon: Cpu, desc: 'Estimating completion probability & delay risks' },
  ];

  const handleRunPipeline = async () => {
    setIsProcessing(true);
    setResult(null);

    // Pipeline visualization step through
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setActiveStep(i);
      await new Promise((r) => setTimeout(r, 120));
    }

    try {
      const res = await aiService.analyzeChallenge({
        title: inputTitle,
        description: inputDesc,
        district: 'Dumka',
        peopleAffected: 2400,
        urgency: 'high',
      });
      setResult(res.analysis);
    } catch (e) {
      console.warn('AI pipeline error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              AI Innovation Engine & Pipeline
            </h1>
            <Badge className="bg-emerald-800 text-white text-[10px]">
              SUPABASE EDGE FUNCTION
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end 11-step cognitive pipeline: Neural categorization, duplicate vector checks, and academic matching.
          </p>
        </div>
      </div>

      {/* Interactive Input Form */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-600" />
            Input Problem Text for Neural Synthesis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Problem Headline</label>
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Problem Description</label>
            <textarea
              rows={3}
              value={inputDesc}
              onChange={(e) => setInputDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs"
            />
          </div>
          <Button
            onClick={handleRunPipeline}
            disabled={isProcessing}
            size="sm"
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isProcessing ? 'Executing 11-Stage Pipeline...' : 'Run Pipeline'}
          </Button>
        </CardContent>
      </Card>

      {/* 11-Stage Pipeline Flow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          const isDone = activeStep > idx || result !== null;

          return (
            <div
              key={step.name}
              className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 scale-105 shadow-md'
                  : isDone
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isDone || isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                )}
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight pt-1">{step.name}</div>
              <p className="text-[10px] text-slate-500 line-clamp-2">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* AI Pipeline Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <AIAnalysisResult analysis={result} />
        </div>
      )}
    </div>
  );
};
