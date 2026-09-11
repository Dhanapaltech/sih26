import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Challenge, ChallengeStatus, Priority } from '@/types';
import { storageService } from './storageService';
import { aiService } from './aiService';
import { demoEngine } from '@/lib/demo/demoEngine';

export interface ChallengeFilters {
  category?: string;
  district?: string;
  status?: string;
  search?: string;
  citizenId?: string;
}

export const challengesService = {
  async getChallenges(filters: ChallengeFilters = {}): Promise<Challenge[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('challenges')
          .select(`
            *,
            citizen:profiles!citizen_id(full_name, email),
            media:challenge_media(id, file_name, file_path, file_type),
            assigned_university:universities!assigned_university_id(name, short_name)
          `)
          .order('created_at', { ascending: false });

        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters.district && filters.district !== 'all') {
          query = query.eq('district', filters.district);
        }
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.citizenId) {
          query = query.eq('citizen_id', filters.citizenId);
        }
        if (filters.search && filters.search.trim()) {
          const q = filters.search.trim();
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,district.ilike.%${q}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          const supabaseChallenges = (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            subcategory: row.subcategory || undefined,
            district: row.district,
            village: row.village || undefined,
            location: row.latitude && row.longitude ? {
              lat: Number(row.latitude),
              lng: Number(row.longitude),
              address: row.location_text || `${row.village ? row.village + ', ' : ''}${row.district}`,
            } : undefined,
            peopleAffected: row.people_affected,
            urgency: (row.urgency as Priority) || 'medium',
            currentSituation: row.current_situation || undefined,
            expectedImprovement: row.expected_improvement || undefined,
            status: (row.status as ChallengeStatus) || 'submitted',
            citizenId: row.citizen_id,
            citizenName: row.citizen?.full_name || 'Citizen',
            photos: (row.media || [])
              .filter((m: any) => m.file_type?.startsWith('image'))
              .map((m: any) => storageService.getPublicUrl('challenge-media', m.file_path)),
            documents: (row.media || [])
              .filter((m: any) => !m.file_type?.startsWith('image'))
              .map((m: any) => storageService.getPublicUrl('challenge-media', m.file_path)),
            governmentNote: row.government_note || undefined,
            validatedAt: row.validated_at || undefined,
            validatedBy: row.validated_by || undefined,
            assignedUniversityId: row.assigned_university_id || undefined,
            assignedDepartment: row.assigned_department || undefined,
            projectId: row.project_id || undefined,
            priority: (row.priority as Priority) || 'medium',
            aiScore: row.ai_score ? Number(row.ai_score) : undefined,
            duplicateOf: row.duplicate_of || undefined,
            submittedAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          const localChallenges = demoEngine.getChallenges();
          const map = new Map<string, Challenge>();
          for (const c of supabaseChallenges) map.set(c.id, c);
          for (const c of localChallenges) if (!map.has(c.id)) map.set(c.id, c);
          return Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase getChallenges error, using local civic fallback:', err);
      }
    }

    let list = demoEngine.getChallenges();
    if (filters.category && filters.category !== 'all') {
      list = list.filter((c) => c.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.district && filters.district !== 'all') {
      list = list.filter((c) => c.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters.citizenId) {
      list = list.filter((c) => c.citizenId === filters.citizenId);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getChallengeById(id: string): Promise<Challenge | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select(`
            *,
            citizen:profiles!citizen_id(full_name, email, phone),
            media:challenge_media(*),
            assigned_university:universities!assigned_university_id(id, name, short_name),
            ai_analysis:challenge_ai_analysis(*),
            timeline:challenge_timeline(*)
          `)
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const row = data as any;
          return {
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            subcategory: row.subcategory || undefined,
            district: row.district,
            village: row.village || undefined,
            location: row.latitude && row.longitude ? {
              lat: Number(row.latitude),
              lng: Number(row.longitude),
              address: row.location_text || `${row.village ? row.village + ', ' : ''}${row.district}`,
            } : undefined,
            peopleAffected: row.people_affected,
            urgency: (row.urgency as Priority) || 'medium',
            currentSituation: row.current_situation || undefined,
            expectedImprovement: row.expected_improvement || undefined,
            status: (row.status as ChallengeStatus) || 'submitted',
            citizenId: row.citizen_id,
            citizenName: row.citizen?.full_name || 'Citizen',
            photos: (row.media || [])
              .filter((m: any) => m.file_type?.startsWith('image'))
              .map((m: any) => storageService.getPublicUrl('challenge-media', m.file_path)),
            documents: (row.media || [])
              .filter((m: any) => !m.file_type?.startsWith('image'))
              .map((m: any) => storageService.getPublicUrl('challenge-media', m.file_path)),
            governmentNote: row.government_note || undefined,
            validatedAt: row.validated_at || undefined,
            validatedBy: row.validated_by || undefined,
            assignedUniversityId: row.assigned_university_id || undefined,
            assignedDepartment: row.assigned_department || undefined,
            projectId: row.project_id || undefined,
            priority: (row.priority as Priority) || 'medium',
            aiScore: row.ai_score ? Number(row.ai_score) : undefined,
            duplicateOf: row.duplicate_of || undefined,
            submittedAt: row.created_at,
            updatedAt: row.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase getChallengeById error, using demoEngine fallback:', err);
      }
    }

    return demoEngine.getChallengeById(id) || null;
  },

  async createChallenge(
    challengeData: {
      citizenId: string;
      title: string;
      description: string;
      category: string;
      subcategory?: string;
      district: string;
      village?: string;
      locationText?: string;
      latitude?: number;
      longitude?: number;
      peopleAffected: number;
      urgency: Priority;
      currentSituation?: string;
      expectedImprovement?: string;
    },
    files: File[] = []
  ): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        // 1. Insert challenge row
        const validCitizenId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeData.citizenId || '')
          ? challengeData.citizenId
          : '00000000-0000-0000-0000-000000000001';

        const { data: newChallenge, error: insertError } = await (supabase.from('challenges') as any)
          .insert({
            citizen_id: validCitizenId,
            title: challengeData.title,
            description: challengeData.description,
            category: challengeData.category,
            subcategory: challengeData.subcategory,
            district: challengeData.district,
            village: challengeData.village,
            location_text: challengeData.locationText,
            latitude: challengeData.latitude,
            longitude: challengeData.longitude,
            people_affected: challengeData.peopleAffected,
            urgency: challengeData.urgency,
            current_situation: challengeData.currentSituation,
            expected_improvement: challengeData.expectedImprovement,
            status: 'submitted',
            priority: challengeData.urgency,
          })
          .select()
          .single();

        if (!insertError && newChallenge?.id) {
          const challengeId = newChallenge.id;

          // 2. Upload media files to Supabase Storage
          for (const file of files) {
            try {
              const uploadResult = await storageService.uploadFile('challenge-media', challengeId, file);
              await (supabase.from('challenge_media') as any).insert({
                challenge_id: challengeId,
                file_name: uploadResult.fileName,
                file_path: uploadResult.filePath,
                file_type: uploadResult.fileType,
                file_size: uploadResult.fileSize,
                uploaded_by: challengeData.citizenId,
              });
            } catch (uploadErr) {
              console.warn('Failed to upload challenge media file:', uploadErr);
            }
          }

          // 3. Trigger AI Analysis
          try {
            await aiService.analyzeChallenge({
              title: challengeData.title,
              description: challengeData.description,
              district: challengeData.district,
              peopleAffected: challengeData.peopleAffected,
              urgency: challengeData.urgency,
              challengeId,
            });
          } catch (aiErr) {
            console.warn('AI analysis execution warning:', aiErr);
          }

          // 4. Log Audit Log
          try {
            await (supabase.from('audit_logs') as any).insert({
              actor_id: challengeData.citizenId,
              actor_role: 'CITIZEN',
              action: 'CHALLENGE_CREATED',
              entity: 'challenges',
              entity_id: challengeId,
              metadata: { title: challengeData.title, district: challengeData.district },
            });
          } catch (auditErr) {
            console.warn('Audit log insert warning:', auditErr);
          }

          // 5. Store in persistent local civic store as well
          const createdChallenge: Challenge = {
            id: challengeId,
            title: challengeData.title,
            description: challengeData.description,
            category: challengeData.category,
            subcategory: challengeData.subcategory,
            district: challengeData.district,
            village: challengeData.village,
            location: (challengeData.latitude && challengeData.longitude) ? {
              lat: challengeData.latitude,
              lng: challengeData.longitude,
              address: challengeData.locationText || `${challengeData.village ? challengeData.village + ', ' : ''}${challengeData.district}`,
            } : undefined,
            peopleAffected: challengeData.peopleAffected,
            urgency: challengeData.urgency,
            currentSituation: challengeData.currentSituation,
            expectedImprovement: challengeData.expectedImprovement,
            status: 'submitted',
            citizenId: challengeData.citizenId,
            citizenName: 'Rahul Mahto',
            photos: [],
            documents: [],
            priority: challengeData.urgency,
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          demoEngine.addChallenge(createdChallenge);

          return challengeId;
        }
      } catch (err) {
        console.warn('Supabase createChallenge error, saving to DemoEngine:', err);
      }
    }

    // Demo / Offline Fallback Save
    const challengeId = `ch-${Date.now()}`;
    const photos: string[] = [];
    const documents: string[] = [];

    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        if (file.type.startsWith('image')) {
          photos.push(url);
        } else {
          documents.push(url);
        }
      } catch {
        // Safe in non-browser environments
      }
    }

    const demoChallenge: Challenge = {
      id: challengeId,
      title: challengeData.title,
      description: challengeData.description,
      category: challengeData.category,
      subcategory: challengeData.subcategory,
      district: challengeData.district,
      village: challengeData.village,
      location: (challengeData.latitude && challengeData.longitude) ? {
        lat: challengeData.latitude,
        lng: challengeData.longitude,
        address: challengeData.locationText || `${challengeData.village ? challengeData.village + ', ' : ''}${challengeData.district}`,
      } : undefined,
      peopleAffected: challengeData.peopleAffected,
      urgency: challengeData.urgency,
      currentSituation: challengeData.currentSituation,
      expectedImprovement: challengeData.expectedImprovement,
      status: 'submitted',
      citizenId: challengeData.citizenId,
      citizenName: 'Rahul Mahto',
      photos,
      documents,
      priority: challengeData.urgency,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
    };

    demoEngine.addChallenge(demoChallenge);

    // Also trigger AI analysis in background for demo challenge
    aiService.analyzeChallenge({
      title: challengeData.title,
      description: challengeData.description,
      district: challengeData.district,
      peopleAffected: challengeData.peopleAffected,
      urgency: challengeData.urgency,
      challengeId,
    }).then((res) => {
      if (res?.analysis) {
        demoChallenge.aiScore = res.analysis.severityScore;
        demoChallenge.aiAnalysisId = res.analysis.id;
      }
    }).catch((e) => console.warn('Demo AI background analysis:', e));

    return challengeId;
  },

  async validateChallenge(id: string, governmentNote?: string, officerId?: string): Promise<void> {
    demoEngine.updateChallengeStatus(id, 'validated', {
      governmentNote: governmentNote || 'Validated by Department of Higher & Technical Education',
      validatedAt: new Date().toISOString(),
      validatedBy: officerId || 'demo-govt-1',
    });

    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('challenges') as any)
          .update({
            status: 'validated',
            validated_at: new Date().toISOString(),
            validated_by: officerId,
            government_note: governmentNote || 'Validated by Department of Higher & Technical Education',
          })
          .eq('id', id);

        await (supabase.from('audit_logs') as any).insert({
          actor_id: officerId,
          actor_role: 'GOVERNMENT',
          action: 'CHALLENGE_VALIDATED',
          entity: 'challenges',
          entity_id: id,
          metadata: { note: governmentNote },
        });
      } catch (err) {
        console.warn('Supabase validateChallenge warning:', err);
      }
    }
  },

  async rejectChallenge(id: string, reason?: string, officerId?: string): Promise<void> {
    demoEngine.updateChallengeStatus(id, 'rejected', {
      governmentNote: reason || 'Does not meet state innovation criteria',
    });

    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('challenges') as any)
          .update({
            status: 'rejected',
            government_note: reason || 'Does not meet state innovation criteria',
          })
          .eq('id', id);

        await (supabase.from('audit_logs') as any).insert({
          actor_id: officerId,
          actor_role: 'GOVERNMENT',
          action: 'CHALLENGE_REJECTED',
          entity: 'challenges',
          entity_id: id,
          metadata: { reason },
        });
      } catch (err) {
        console.warn('Supabase rejectChallenge warning:', err);
      }
    }
  },

  async assignUniversity(challengeId: string, universityId: string, department?: string, officerId?: string): Promise<void> {
    demoEngine.updateChallengeStatus(challengeId, 'university_matched', {
      assignedUniversityId: universityId,
      assignedDepartment: department,
    });

    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('challenges') as any)
          .update({
            status: 'university_matched',
            assigned_university_id: universityId,
            assigned_department: department,
          })
          .eq('id', challengeId);

        await (supabase.from('challenge_timeline') as any).insert({
          challenge_id: challengeId,
          event_type: 'UNIVERSITY_ASSIGNED',
          message: `Assigned to university R&D cell (${department || 'General Engineering'}).`,
          actor_id: officerId,
        });
      } catch (err) {
        console.warn('Supabase assignUniversity warning:', err);
      }
    }
  },
};
