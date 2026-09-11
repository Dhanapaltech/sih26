import { supabase, isSupabaseConfigured } from './supabaseClient';
import { GlobalSearchResult, JharkhandDistrict } from '@/types';
import { JHARKHAND_DISTRICTS } from '@/lib/demo/demoData';

export interface StateAnalytics {
  totalChallenges: number;
  validatedChallenges: number;
  underReviewChallenges: number;
  activeProjects: number;
  deployedSolutions: number;
  universities: number;
  industryPartners: number;
  impactedCitizens: number;
}

export const analyticsService = {
  async getStateAnalytics(): Promise<StateAnalytics> {
    if (isSupabaseConfigured()) {
      try {
        // First try RPC
        const { data, error } = await (supabase.rpc('get_state_analytics') as any);
        if (!error && data) {
          return {
            totalChallenges: Number(data.totalChallenges) || 0,
            validatedChallenges: Number(data.validatedChallenges) || 0,
            underReviewChallenges: Number(data.underReviewChallenges) || 0,
            activeProjects: Number(data.activeProjects) || 0,
            deployedSolutions: Number(data.deployedSolutions) || 0,
            universities: Number(data.universities) || 0,
            industryPartners: Number(data.industryPartners) || 0,
            impactedCitizens: Number(data.impactedCitizens) || 0,
          };
        }
      } catch (e) {
        console.warn('RPC get_state_analytics not available, querying tables directly:', e);
      }

      // Direct table counting fallback
      try {
        const [
          { count: chCount },
          { count: valCount },
          { count: projCount },
          { count: solCount },
          { count: univCount },
          { count: indCount },
        ] = await Promise.all([
          supabase.from('challenges').select('*', { count: 'exact', head: true }),
          supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'validated'),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('solutions').select('*', { count: 'exact', head: true }),
          supabase.from('universities').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'INDUSTRY'),
        ]);

        if (chCount && chCount > 0) {
          return {
            totalChallenges: chCount || 0,
            validatedChallenges: valCount || 0,
            underReviewChallenges: (chCount || 0) - (valCount || 0),
            activeProjects: projCount || 0,
            deployedSolutions: solCount || 0,
            universities: univCount || 0,
            industryPartners: indCount || 0,
            impactedCitizens: 85000,
          };
        }
      } catch (err) {
        console.warn('Direct count failed, falling back to demo state analytics:', err);
      }
    }

    // SIH 2026 Rich State Telemetry Fallback
    return {
      totalChallenges: 52,
      validatedChallenges: 38,
      underReviewChallenges: 14,
      activeProjects: 26,
      deployedSolutions: 18,
      universities: 8,
      industryPartners: 14,
      impactedCitizens: 85000,
    };
  },

  async getDistrictTelemetry(): Promise<JharkhandDistrict[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data: counts } = await (supabase.from('challenges') as any)
          .select('district, id');

        if (counts && counts.length > 0) {
          const districtMap = new Map<string, number>();
          counts.forEach((r: any) => {
            if (r.district) {
              districtMap.set(r.district, (districtMap.get(r.district) || 0) + 1);
            }
          });

          return JHARKHAND_DISTRICTS.map((d) => ({
            ...d,
            challenges: districtMap.get(d.name) || d.challenges,
          }));
        }
      } catch (err) {
        console.warn('District telemetry query failed, using demo districts:', err);
      }
    }

    return JHARKHAND_DISTRICTS;
  },

  async globalSearch(query: string): Promise<GlobalSearchResult[]> {
    if (!query.trim()) return [];
    try {
      const q = query.trim();
      const [{ data: chs }, { data: projs }, { data: univs }] = await Promise.all([
        supabase.from('challenges').select('id, title, district, category').ilike('title', `%${q}%`).limit(4),
        supabase.from('projects').select('id, title, status, project_code').ilike('title', `%${q}%`).limit(4),
        supabase.from('universities').select('id, name, district').ilike('name', `%${q}%`).limit(4),
      ]);

      const results: GlobalSearchResult[] = [];

      (chs || []).forEach((c: any) => {
        results.push({
          type: 'challenge',
          id: c.id,
          title: c.title,
          subtitle: `${c.category} • ${c.district}`,
          badge: 'Challenge',
        });
      });

      (projs || []).forEach((p: any) => {
        results.push({
          type: 'project',
          id: p.id,
          title: p.title,
          subtitle: p.project_code,
          badge: p.status,
        });
      });

      (univs || []).forEach((u: any) => {
        results.push({
          type: 'university',
          id: u.id,
          title: u.name,
          subtitle: u.district,
          badge: 'University',
        });
      });

      return results;
    } catch (e) {
      console.warn('Global search error:', e);
      return [];
    }
  },
};
