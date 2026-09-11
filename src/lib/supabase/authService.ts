import { supabase } from './supabaseClient';
import { User, UserRole } from '@/types';

export const authService = {
  async signIn(email: string, password: string):Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) return { user: null, error: null };

      const profile = await this.getProfile(data.user.id);
      return { user: profile, error: null };
    } catch (err: any) {
      return { user: null, error: err };
    }
  },

  async signUp(
    email: string,
    password: string,
    metadata: {
      fullName: string;
      role: UserRole;
      district: string;
      phone?: string;
    }
  ): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
            role: metadata.role.toUpperCase(),
            district: metadata.district,
            phone: metadata.phone,
          },
        },
      });

      if (error) throw error;
      if (!data.user) return { user: null, error: null };

      // Ensure profile exists in profiles table
      const { data: profileRow } = await (supabase.from('profiles') as any)
        .upsert({
          auth_user_id: data.user.id,
          email,
          full_name: metadata.fullName,
          role: metadata.role.toUpperCase(),
          district: metadata.district,
          phone: metadata.phone,
        })
        .select()
        .single();

      return {
        user: {
          id: profileRow?.id || data.user.id,
          email: data.user.email || email,
          displayName: metadata.fullName,
          role: metadata.role,
          district: metadata.district,
          phone: metadata.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        error: null,
      };
    } catch (err: any) {
      return { user: null, error: err };
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getProfile(authUserId: string): Promise<User | null> {
    const { data, error } = await (supabase.from('profiles') as any)
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      displayName: data.full_name,
      photoURL: data.avatar_url || undefined,
      role: (data.role?.toLowerCase() as UserRole) || 'citizen',
      organizationId: data.organization_id || undefined,
      district: data.district || undefined,
      skills: data.skills || [],
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      innovationPoints: data.innovation_points || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    await (supabase.from('profiles') as any)
      .update({
        full_name: updates.displayName,
        bio: updates.bio,
        district: updates.district,
        skills: updates.skills,
        avatar_url: updates.photoURL,
        phone: updates.phone,
      })
      .eq('id', userId);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getProfile(session.user.id);
        if (profile) {
          callback(profile);
          return;
        }
        // Fallback user representation from session
        const rawRole = (session.user.user_metadata?.role?.toLowerCase() as UserRole) || 'citizen';
        callback({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email || 'User',
          role: rawRole,
          district: session.user.user_metadata?.district || 'Ranchi',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        callback(null);
      }
    });
  },
};
