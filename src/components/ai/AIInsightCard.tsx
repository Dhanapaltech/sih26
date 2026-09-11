import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  insight: string;
  type?: 'recommendation' | 'warning' | 'opportunity' | 'risk';
  confidence?: number;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  insight,
  type = 'recommendation',
  confidence = 92,
  actionLabel,
  onAction,
  className = '',
}) => {
  const getTheme = () => {
    switch (type) {
      case 'warning':
      case 'risk':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          bg: 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        };
      case 'opportunity':
        return {
          icon: <Zap className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/20',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        };
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
        };
    }
  };

  const theme = getTheme();

  return (
    <Card className={`overflow-hidden border ${theme.bg} ${className}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0">
              {theme.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h4>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}>
                  {confidence}% confidence
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> AI-assisted
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight}
              </p>
            </div>
          </div>
          {actionLabel && (
            <Button
              onClick={onAction}
              size="sm"
              variant="ghost"
              className="text-emerald-700 dark:text-emerald-400 text-xs shrink-0 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50"
            >
              {actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
