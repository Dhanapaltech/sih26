import React from 'react';
import { UserRole } from '@/types';
import { getRoleLabel, getRoleBadgeClass } from '@/lib/utils';
import { Shield, Building2, GraduationCap, School, Users, Briefcase, Rocket, UserCheck } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  className = '',
  showIcon = true,
}) => {
  const badgeClass = getRoleBadgeClass(role);
  const label = getRoleLabel(role);

  const renderIcon = () => {
    switch (role) {
      case 'government': return <Building2 className="w-3.5 h-3.5" />;
      case 'university': return <School className="w-3.5 h-3.5" />;
      case 'faculty': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'student': return <Users className="w-3.5 h-3.5" />;
      case 'industry': return <Briefcase className="w-3.5 h-3.5" />;
      case 'startup': return <Rocket className="w-3.5 h-3.5" />;
      case 'admin': return <Shield className="w-3.5 h-3.5" />;
      case 'citizen':
      default: return <UserCheck className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${badgeClass} ${className}`}
    >
      {showIcon && renderIcon()}
      {label}
    </span>
  );
};
