import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Priority, ChallengeStatus, UserRole } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('en-IN');
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getPriorityColor(priority: Priority): { bg: string; text: string; border: string } {
  switch (priority) {
    case 'critical':
      return { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
    case 'high':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
    case 'medium':
      return { bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' };
    case 'low':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
    default:
      return { bg: 'bg-slate-50 dark:bg-slate-900', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800' };
  }
}

export function getStatusColor(status: ChallengeStatus): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'submitted':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' };
    case 'ai_analyzed':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' };
    case 'government_review':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' };
    case 'validated':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' };
    case 'university_matched':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' };
    case 'project_created':
      return { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' };
    case 'prototype':
      return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' };
    case 'pilot':
      return { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' };
    case 'deployed':
      return { bg: 'bg-green-100 dark:bg-green-950/60', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-600' };
    case 'impact_measured':
      return { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-400', dot: 'bg-teal-500' };
    case 'rejected':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' };
    case 'duplicate':
      return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-500' };
    default:
      return { bg: 'bg-slate-50 dark:bg-slate-900', text: 'text-slate-700 dark:text-slate-400', dot: 'bg-slate-500' };
  }
}

export function getStatusLabel(status: ChallengeStatus): string {
  switch (status) {
    case 'submitted': return 'Submitted';
    case 'ai_analyzed': return 'AI Analyzed';
    case 'government_review': return 'Gov Review';
    case 'validated': return 'Validated';
    case 'university_matched': return 'Univ Matched';
    case 'project_created': return 'Project Active';
    case 'prototype': return 'Prototype Ready';
    case 'pilot': return 'In Pilot Test';
    case 'deployed': return 'Deployed';
    case 'impact_measured': return 'Impact Measured';
    case 'rejected': return 'Rejected';
    case 'duplicate': return 'Duplicate';
    default: return status;
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'citizen': return 'Citizen';
    case 'government': return 'Government Official';
    case 'university': return 'University Admin';
    case 'faculty': return 'Faculty Mentor';
    case 'student': return 'Student Innovator';
    case 'industry': return 'Industry Partner';
    case 'startup': return 'Startup';
    case 'admin': return 'System Admin';
    default: return role;
  }
}

export function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case 'citizen': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'government': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
    case 'university': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    case 'faculty': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
    case 'student': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case 'industry': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    case 'startup': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
    case 'admin': return 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900';
    default: return 'bg-slate-100 text-slate-800';
  }
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}
