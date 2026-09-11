import React from 'react';
import { DuplicateMatch } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AlertCircle, ExternalLink, PlusCircle, ArrowRight } from 'lucide-react';

interface DuplicateDetectionProps {
  duplicates: DuplicateMatch[];
  onViewExisting?: (challengeId: string) => void;
  onAddEvidence?: (challengeId: string) => void;
  onContinueAsNew?: () => void;
}

export const DuplicateDetection: React.FC<DuplicateDetectionProps> = ({
  duplicates,
  onViewExisting,
  onAddEvidence,
  onContinueAsNew,
}) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <Card className="border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div>
            <CardTitle className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Similar Community Challenges Found
            </CardTitle>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Our AI semantic scanner identified related reports already filed nearby.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="space-y-2">
          {duplicates.map((dup) => (
            <div
              key={dup.challengeId}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {dup.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                    {dup.similarity}% match
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>District: <strong>{dup.district}</strong></span>
                  <span>•</span>
                  <StatusBadge status={dup.status} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => onViewExisting?.(dup.challengeId)}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                  onClick={() => onAddEvidence?.(dup.challengeId)}
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Evidence
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Is your report uniquely different?
          </span>
          <Button
            onClick={onContinueAsNew}
            size="sm"
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs gap-1 shadow-sm"
          >
            Continue as New Challenge <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
