import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, Search, Bell, MessageSquare, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-challenges' | 'no-projects' | 'no-messages' | 'no-notifications' | 'no-data';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const getDefaults = () => {
    switch (type) {
      case 'no-challenges':
        return {
          icon: <FolderOpen className="w-12 h-12 text-slate-400" />,
          title: 'No Challenges Found',
          description: 'No community challenges match your current filters or search query.',
        };
      case 'no-projects':
        return {
          icon: <Search className="w-12 h-12 text-slate-400" />,
          title: 'No Active Projects',
          description: 'There are currently no research or prototype projects in this view.',
        };
      case 'no-messages':
        return {
          icon: <MessageSquare className="w-12 h-12 text-slate-400" />,
          title: 'No Conversations Yet',
          description: 'Send a message to kick off collaboration with your assigned team members.',
        };
      case 'no-notifications':
        return {
          icon: <Bell className="w-12 h-12 text-slate-400" />,
          title: 'You are all caught up!',
          description: 'No new activity or alerts waiting for your review.',
        };
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-slate-400" />,
          title: 'No Records Available',
          description: 'No items currently exist in this category.',
        };
    }
  };

  const defaults = getDefaults();

  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}
    >
      <div className="p-3 mb-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
        {defaults.icon}
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title || defaults.title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {description || defaults.description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
