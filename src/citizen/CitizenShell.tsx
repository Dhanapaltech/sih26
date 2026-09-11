import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Home, PlusCircle, FileText, TrendingUp, User, Bell, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CitizenShell: React.FC = () => {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased pb-20 sm:pb-0">

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/citizen')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              JH
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base leading-tight flex items-center gap-2">
                My Innovation Hub
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold uppercase">
                  Citizen
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Government of Jharkhand</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/app')}
              className="text-xs h-8 hidden sm:flex items-center gap-1 text-slate-600 dark:text-slate-300"
            >
              <Shield className="w-3.5 h-3.5" /> Common Portal (/app)
            </Button>

            <NavLink
              to="/citizen/notifications"
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-slate-900" />
            </NavLink>

            <div
              onClick={() => navigate('/citizen/profile')}
              className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow cursor-pointer ring-2 ring-emerald-500/30"
            >
              {currentUser?.displayName?.[0] || 'C'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Mobile-first Persistent Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 sm:hidden">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          <NavLink
            to="/citizen"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            Home
          </NavLink>

          <NavLink
            to="/citizen/challenges"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <FileText className="w-5 h-5 mb-0.5" />
            My Reports
          </NavLink>

          {/* Central Prominent Report Button */}
          <NavLink
            to="/citizen/report"
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform ring-4 ring-white dark:ring-slate-900">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 mt-1">
              Report
            </span>
          </NavLink>

          <NavLink
            to="/citizen/impact"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            Impact
          </NavLink>

          <NavLink
            to="/citizen/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            Profile
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
