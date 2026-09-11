import React from 'react';
import { ChallengeStatus } from '@/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: ChallengeStatus;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showDot = true,
}) => {
  const { bg, text, dot } = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border border-transparent ${bg} ${text} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />}
      {label}
    </span>
  );
};
