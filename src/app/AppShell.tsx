import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { analyticsService } from '@/lib/supabase/analyticsService';
import { notificationsService } from '@/lib/supabase/notificationsService';
import { GlobalSearchResult, Notification } from '@/types';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Building2,
  School,
  GraduationCap,
  Users,
  Briefcase,
  Rocket,
  FolderKanban,
  Target,
  Brain,
  MessageSquare,
  Bell,
  BarChart3,
  TrendingUp,
  Search,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Send,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { currentUser, currentRole, logout, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `Hello ${currentUser?.displayName || 'Innovator'}! I am JH AI, your regional innovation assistant. Ask me about civic challenge telemetry, university research capacity, or project status.`,
    },
  ]);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real Search via Supabase
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await analyticsService.globalSearch(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Real Notifications
  useEffect(() => {
    if (!currentUser?.id) return;
    notificationsService.getNotifications(currentUser.id).then(setNotifications);

    const unsubscribe = notificationsService.subscribeToUserNotifications(currentUser.id, (n) => {
      setNotifications((prev) => [n, ...prev]);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Role-specific navigation links
  const getNavItems = () => {
    switch (currentRole) {
      case 'government':
        return [
          { label: 'Command Center', path: '/app', icon: Building2 },
          { label: 'All Challenges', path: '/app/challenges', icon: Target },
          { label: 'State Projects', path: '/app/projects', icon: FolderKanban },
          { label: 'AI Innovation Engine', path: '/app/ai-engine', icon: Brain },
          { label: 'Executive Analytics', path: '/app/analytics', icon: BarChart3 },
          { label: 'Statewide Impact', path: '/app/impact', icon: TrendingUp },
          { label: 'Messages & Dispatch', path: '/app/messages', icon: MessageSquare },
        ];
      case 'university':
        return [
          { label: 'University Hub', path: '/app', icon: School },
          { label: 'Open Challenges', path: '/app/challenges', icon: Target },
          { label: 'Campus Projects', path: '/app/projects', icon: FolderKanban },
          { label: 'AI Matching Engine', path: '/app/ai-engine', icon: Brain },
          { label: 'Research Analytics', path: '/app/analytics', icon: BarChart3 },
          { label: 'Team Messages', path: '/app/messages', icon: MessageSquare },
        ];
      case 'faculty':
        return [
          { label: 'Faculty Workspace', path: '/app', icon: GraduationCap },
          { label: 'Assigned Challenges', path: '/app/challenges', icon: Target },
          { label: 'My Research Projects', path: '/app/projects', icon: FolderKanban },
          { label: 'AI Engine', path: '/app/ai-engine', icon: Brain },
          { label: 'Team Discussion', path: '/app/messages', icon: MessageSquare },
        ];
      case 'student':
        return [
          { label: 'Student Hub', path: '/app', icon: Users },
          { label: 'Browse Challenges', path: '/app/challenges', icon: Target },
          { label: 'My Project Teams', path: '/app/projects', icon: FolderKanban },
          { label: 'AI Skill Matcher', path: '/app/ai-engine', icon: Brain },
          { label: 'Team Messages', path: '/app/messages', icon: MessageSquare },
        ];
      case 'industry':
      case 'startup':
        return [
          { label: 'Industry Hub', path: '/app', icon: Briefcase },
          { label: 'State Challenges', path: '/app/challenges', icon: Target },
          { label: 'Incubation Projects', path: '/app/projects', icon: Rocket },
          { label: 'CSR Co-Sponsorship', path: '/app/ai-engine', icon: Brain },
          { label: 'Direct Messaging', path: '/app/messages', icon: MessageSquare },
        ];
      default:
        return [
          { label: 'Admin Command', path: '/app', icon: Shield },
          { label: 'System Challenges', path: '/app/challenges', icon: Target },
          { label: 'All Projects', path: '/app/projects', icon: FolderKanban },
          { label: 'AI Engine Architecture', path: '/app/ai-engine', icon: Brain },
          { label: 'Comprehensive Analytics', path: '/app/analytics', icon: BarChart3 },
          { label: 'Impact Dashboard', path: '/app/impact', icon: TrendingUp },
          { label: 'System Messages', path: '/app/messages', icon: MessageSquare },
        ];
    }
  };

  const navItems = getNavItems();

  const handleSendAiMessage = () => {
    if (!aiMessage.trim()) return;
    const userQ = aiMessage;
    setAiChat((prev) => [...prev, { sender: 'user', text: userQ }]);
    setAiMessage('');

    setTimeout(() => {
      let reply = 'Our AI synthesis algorithms have ingested this inquiry from Supabase.';
      const lower = userQ.toLowerCase();
      if (lower.includes('water') || lower.includes('dumka')) {
        reply = 'Dumka District water quality challenges are indexed in Supabase. BIT Sindri and IIT ISM Dhanbad research labs are assigned to local fluoride filtration pilots.';
      } else if (lower.includes('student') || lower.includes('skill')) {
        reply = 'Student engineering cells are allocated based on verified proficiencies: IoT embedded hardware, telemetry, and web development.';
      } else if (lower.includes('industry') || lower.includes('csr') || lower.includes('funding')) {
        reply = 'Industry CSR partnerships can be proposed directly through the Industry Innovation Hub for hardware and cloud sponsorship.';
      } else {
        reply = `Status for ${currentRole}: All monitored state districts are active. Recommended action: Review open validation queues in the Challenges repository.`;
      }
      setAiChat((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 select-none">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                JH
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                  Jharkhand Hub
                </h1>
                <p className="text-[10px] text-emerald-400 font-mono">Real-Time Innovation</p>
              </div>
            </div>
          </div>

          {/* User Profile Card in Sidebar */}
          <div className="p-3 border-b border-slate-800">
            <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">ACTIVE CADRE</span>
                <RoleBadge role={currentRole} />
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/20">
                  {currentUser?.displayName?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser?.displayName || 'Active Innovator'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser?.district || 'Jharkhand'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path + item.label}
                  to={item.path}
                  end={item.path === '/app'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
            <button
              onClick={() => navigate('/citizen')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Citizen App (/citizen)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-rose-950/40 text-rose-400 text-xs transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <aside className="relative flex flex-col w-72 bg-slate-900 text-slate-100 h-full shadow-2xl animate-in slide-in-from-left-full duration-200">
              {/* Brand Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    JH
                  </div>
                  <div>
                    <h1 className="font-bold text-sm tracking-tight text-white leading-tight">Jharkhand Hub</h1>
                    <p className="text-[10px] text-emerald-400 font-mono">Real-Time Innovation</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-3 border-b border-slate-800">
                <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">ACTIVE CADRE</span>
                    <RoleBadge role={currentRole} />
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/20">
                      {currentUser?.displayName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{currentUser?.displayName || 'Active Innovator'}</div>
                      <div className="text-[10px] text-slate-400 truncate">{currentUser?.district || 'Jharkhand'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path + item.label}
                      to={item.path}
                      end={item.path === '/app'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
                <button
                  onClick={() => { navigate('/citizen'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Citizen App (/citizen)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-rose-950/40 text-rose-400 text-xs transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
            {/* Left: Mobile hamburger & breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="hidden sm:inline">Jharkhand Innovation Hub</span>
                <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {location.pathname.split('/')[2] || 'Command Center'}
                </span>
              </div>
            </div>

            {/* Center: Search Trigger (Ctrl+K) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 hover:border-slate-400 transition-colors w-64 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Search challenges, projects...</span>
              <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-900 border px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiAssistantOpen(true)}
                className="h-8 text-xs gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-100 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask JH AI</span>
              </Button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => navigate('/app/notifications')}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>

              {/* User Avatar */}
              <div
                onClick={() => navigate('/app/profile')}
                className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer ring-2 ring-emerald-500/20"
              >
                {currentUser?.displayName?.[0] || 'U'}
              </div>
            </div>
          </header>

          {/* Main View Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                autoFocus
                placeholder="Search challenges, projects, universities in Supabase..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-transparent text-sm focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xs cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="text-center py-6 text-xs text-slate-400">Searching PostgreSQL...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {searchQuery ? 'No records match your query in Supabase.' : 'Type to search statewide innovation repository...'}
                </div>
              ) : (
                searchResults.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (r.type === 'challenge') navigate(`/app/challenges/${r.id}`);
                      else if (r.type === 'project') navigate(`/app/projects/${r.id}`);
                      setSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{r.title}</div>
                      {r.subtitle && <div className="text-[10px] text-slate-400">{r.subtitle}</div>}
                    </div>
                    {r.badge && <Badge variant="outline" className="text-[10px]">{r.badge}</Badge>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Assistant Drawer */}
      {aiAssistantOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-600/30 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-3 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">✨ Ask JH AI — Regional Intelligence</span>
            </div>
            <button
              onClick={() => setAiAssistantOpen(false)}
              className="text-slate-300 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 h-72 overflow-y-auto space-y-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/50">
            {aiChat.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white ml-6'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 mr-6 shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 bg-white dark:bg-slate-900">
            <input
              type="text"
              placeholder="Ask about challenges, students, projects..."
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
              className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <Button
              size="sm"
              onClick={handleSendAiMessage}
              className="h-8 w-8 p-0 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
