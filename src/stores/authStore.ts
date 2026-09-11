import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, ThemeMode } from '@/types';
import { authService } from '@/lib/supabase/authService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/supabaseClient';

interface AuthState {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: ThemeMode;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  setTheme: (theme: ThemeMode) => void;
  logout: () => Promise<void>;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentRole: 'citizen',
      isAuthenticated: false,
      isLoading: true,
      theme: 'light',

      setUser: (user) =>
        set({
          currentUser: user,
          isAuthenticated: !!user,
          currentRole: user?.role || 'citizen',
          isLoading: false,
        }),

      setRole: (role) => {
        const user = get().currentUser;
        if (user) {
          set({ currentRole: role, currentUser: { ...user, role } });
        } else {
          set({ currentRole: role });
        }
      },

      setTheme: (theme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
        set({ theme });
      },

      logout: async () => {
        try {
          await authService.signOut();
        } catch (e) {
          console.warn('Sign out error:', e);
        }
        set({
          currentUser: null,
          isAuthenticated: false,
          currentRole: 'citizen',
          isLoading: false,
        });
      },

      initializeAuth: () => {
        // If Supabase is not configured, skip network call
        if (!isSupabaseConfigured()) {
          set({ isLoading: false });
          return () => {};
        }

        // Check current session
        supabase.auth.getSession()
          .then(async ({ data: { session } }) => {
            if (session?.user) {
              const profile = await authService.getProfile(session.user.id);
              if (profile) {
                set({
                  currentUser: profile,
                  currentRole: profile.role,
                  isAuthenticated: true,
                  isLoading: false,
                });
                return;
              }
            }
            set({ isLoading: false });
          })
          .catch((err) => {
            console.warn('Supabase auth session check failed:', err);
            set({ isLoading: false });
          });

        // Listen to auth changes
        const { data: { subscription } } = authService.onAuthStateChange((user) => {
          if (user) {
            set({
              currentUser: user,
              currentRole: user.role,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              currentUser: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      },
    }),
    {
      name: 'jih-auth-storage',
      partialize: (state) => ({
        currentRole: state.currentRole,
        theme: state.theme,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
