import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import { PublicLayout } from './public-site/PublicLayout';
import { Landing } from './public-site/Landing';
import { About } from './public-site/About';
import { HowItWorks } from './public-site/HowItWorks';
import { PublicChallenges } from './public-site/PublicChallenges';
import { PublicProjects } from './public-site/PublicProjects';
import { PublicImpact } from './public-site/PublicImpact';
import { Partners } from './public-site/Partners';

// Auth
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import { useAuthStore } from './stores/authStore';

// Citizen App
import { CitizenShell } from './citizen/CitizenShell';
import { CitizenDashboard } from './citizen/CitizenDashboard';
import { CitizenReportForm } from './citizen/CitizenReportForm';
import { CitizenChallenges } from './citizen/CitizenChallenges';
import { CitizenChallengeDetail } from './citizen/CitizenChallengeDetail';
import { CitizenImpact } from './citizen/CitizenImpact';
import { CitizenNotifications } from './citizen/CitizenNotifications';
import { CitizenProfile } from './citizen/CitizenProfile';

// Common Innovation App
import { AppShell } from './app/AppShell';
import { RoleDashboard } from './app/RoleDashboard';
import { ChallengesPage } from './app/challenges/ChallengesPage';
import { ChallengeDetail } from './app/challenges/ChallengeDetail';
import { ProjectsPage } from './app/projects/ProjectsPage';
import { ProjectWorkspace } from './app/projects/ProjectWorkspace';
import { AIEnginePage } from './app/ai-engine/AIEnginePage';
import { AnalyticsPage } from './app/analytics/AnalyticsPage';
import { ImpactDashboard } from './app/impact/ImpactDashboard';
import { MessagesPage } from './app/messages/MessagesPage';
import { NotificationsPage } from './app/notifications/NotificationsPage';
import { ProfilePage } from './app/profile/ProfilePage';

export function App() {
  React.useEffect(() => {
    const unsubscribe = useAuthStore.getState().initializeAuth();
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="challenges" element={<PublicChallenges />} />
          <Route path="projects" element={<PublicProjects />} />
          <Route path="impact" element={<PublicImpact />} />
          <Route path="partners" element={<Partners />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen Report App Routes */}
        <Route path="/citizen" element={<CitizenShell />}>
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<CitizenReportForm />} />
          <Route path="challenges" element={<CitizenChallenges />} />
          <Route path="challenges/:id" element={<CitizenChallengeDetail />} />
          <Route path="impact" element={<CitizenImpact />} />
          <Route path="notifications" element={<CitizenNotifications />} />
          <Route path="profile" element={<CitizenProfile />} />
        </Route>

        {/* Common Innovation Platform Routes (Role-Based Access Control) */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<RoleDashboard />} />
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectWorkspace />} />
          <Route path="ai-engine" element={<AIEnginePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="impact" element={<ImpactDashboard />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
