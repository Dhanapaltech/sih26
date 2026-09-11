import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { GovernmentDashboard } from './dashboards/GovernmentDashboard';
import { UniversityDashboard } from './dashboards/UniversityDashboard';
import { FacultyDashboard } from './dashboards/FacultyDashboard';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { IndustryDashboard } from './dashboards/IndustryDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export const RoleDashboard: React.FC = () => {
  const { currentRole } = useAuthStore();

  switch (currentRole) {
    case 'government':
      return <GovernmentDashboard />;
    case 'university':
      return <UniversityDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'industry':
    case 'startup':
      return <IndustryDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'citizen':
    default:
      // If a citizen lands in /app, show Government view or redirect
      return <GovernmentDashboard />;
  }
};
