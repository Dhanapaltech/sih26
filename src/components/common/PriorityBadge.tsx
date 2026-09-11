import React from 'react';
import { Priority } from '@/types';
import { getPriorityColor } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className = '',
  showIcon = true,
}) => {
  const { bg, text, border } = getPriorityColor(priority);

  const renderIcon = () => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
      case 'high':
        return <AlertCircle className="w-3.5 h-3.5 shrink-0" />;
      case 'medium':
        return <Clock className="w-3.5 h-3.5 shrink-0" />;
      case 'low':
        return <CheckCircle className="w-3.5 h-3.5 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${bg} ${text} ${border} ${className}`}
    >
      {showIcon && renderIcon()}
      {priority}
    </span>
  );
};
