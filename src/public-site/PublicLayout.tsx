import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              JH
            </div>
            <div>
              <div className="font-bold text-base leading-tight tracking-tight">
                Jharkhand Innovate
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                From Local Problems to Real Solutions
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-emerald-700 font-bold' : 'hover:text-slate-900')}>
              Home
            </NavLink>
            <NavLink to="/how-it-works" className={({ isActive }) => (isActive ? 'text-emerald-700 font-bold' : 'hover:text-slate-900')}>
              How It Works
            </NavLink>
            <NavLink to="/challenges" className={({ isActive }) => (isActive ? 'text-emerald-700 font-bold' : 'hover:text-slate-900')}>
              State Challenges
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => (isActive ? 'text-emerald-700 font-bold' : 'hover:text-slate-900')}>
              University Projects
            </NavLink>
            <NavLink to="/impact" className={({ isActive }) => (isActive ? 'text-emerald-700 font-bold' : 'hover:text-slate-900')}>
              Verified Impact
            </NavLink>
            <NavLink to="/partners" className={({ isActive }) => (isActive ? 'text-emerald-700 font-bold' : 'hover:text-slate-900')}>
              Ecosystem
            </NavLink>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/citizen')}
              className="text-xs h-8 hidden sm:flex border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              Citizen App (/citizen)
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs h-8 font-bold gap-1 shadow-sm"
            >
              Enter Hub (/app) <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-xs">
                JH
              </div>
              Jharkhand Innovation Hub
            </div>
            <p className="text-[11px] leading-relaxed">
              Official Smart India Hackathon 2026 flagship platform. Bridging grassroots citizens, district magistrates, state university engineering teams, and corporate CSR partners.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Platforms</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => navigate('/citizen')} className="hover:text-white">Citizen Report App (/citizen)</button></li>
              <li><button onClick={() => navigate('/app')} className="hover:text-white">Common Innovation Website (/app)</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white">Quick Demo Persona Switcher</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Participating Cadres</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Government of Jharkhand</li>
              <li>Birsa Institute of Technology (BIT Sindri)</li>
              <li>NIT Jamshedpur & Ranchi University</li>
              <li>Corporate & Startup Incubation Ecosystem</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">SIH 2026 Evaluation</h4>
            <p className="text-[11px]">
              Built with ONE shared backend, ONE database, ONE AI engine, and strict role-based access control.
            </p>
            <span className="text-[10px] text-emerald-400 font-mono block pt-1">
              STATUS: PRODUCTION READY
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>© 2026 Jharkhand Innovation Hub • All Rights Reserved.</div>
          <div className="font-mono">Smart India Hackathon 2026 Finalist System</div>
        </div>
      </footer>
    </div>
  );
};
