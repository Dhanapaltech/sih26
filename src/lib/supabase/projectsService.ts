import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Project, Task, Milestone, Message, ProjectMember } from '@/types';
import { demoEngine } from '@/lib/demo/demoEngine';

export const projectsService = {
  async getProjects(filters: { status?: string; universityId?: string; search?: string } = {}): Promise<Project[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('projects')
          .select(`
            *,
            university:universities!university_id(name, short_name),
            faculty:profiles!faculty_id(full_name, email),
            challenge:challenges!challenge_id(title, category, district)
          `)
          .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.universityId) {
          query = query.eq('university_id', filters.universityId);
        }
        if (filters.search && filters.search.trim()) {
          const q = filters.search.trim();
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,district.ilike.%${q}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          const supabaseProjects = (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            challengeId: row.challenge_id,
            universityId: row.university_id,
            facultyId: row.faculty_id,
            departmentId: row.department_id || undefined,
            status: row.status,
            progress: Number(row.progress) || 0,
            health: row.health || 'good',
            risk: row.risk || 'low',
            delayProbability: Number(row.delay_probability) || 0.05,
            collaborationScore: Number(row.collaboration_score) || 9.0,
            impactPotential: row.impact_potential || 'high',
            description: row.description || undefined,
            timeline: {
              startDate: row.start_date || new Date().toISOString(),
              expectedEndDate: row.target_date || new Date().toISOString(),
              actualEndDate: row.actual_end_date || undefined,
            },
            budget: row.budget || { estimated: 0, allocated: 0, spent: 0, currency: 'INR' },
            location: row.location || undefined,
            district: row.district || undefined,
            tags: row.tags || [],
            aiRecommendation: row.ai_recommendation || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          // Merge locally stored real projects if any
          const localProjects = demoEngine.getProjects();
          const map = new Map<string, Project>();
          for (const p of supabaseProjects) map.set(p.id, p);
          for (const p of localProjects) if (!map.has(p.id)) map.set(p.id, p);
          return Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase getProjects error, using local fallback:', err);
      }
    }

    let list = demoEngine.getProjects();
    if (filters.status && filters.status !== 'all') {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters.universityId) {
      list = list.filter((p) => p.universityId === filters.universityId);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    return list;
  },

  async createProject(projectData: {
    title: string;
    description?: string;
    challengeId?: string;
    universityId?: string;
    facultyId?: string;
    status?: Project['status'];
    district?: string;
    budget?: { estimated: number; allocated: number; spent: number; currency: string };
    targetDate?: string;
    tags?: string[];
  }): Promise<Project> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('projects') as any)
          .insert({
            title: projectData.title,
            description: projectData.description,
            challenge_id: projectData.challengeId,
            university_id: projectData.universityId,
            faculty_id: projectData.facultyId,
            status: projectData.status || 'planning',
            district: projectData.district || 'Ranchi',
            budget: projectData.budget || { estimated: 500000, allocated: 300000, spent: 0, currency: 'INR' },
            target_date: projectData.targetDate,
            tags: projectData.tags || [],
          })
          .select()
          .single();

        if (!error && data) {
          const newProj: Project = {
            id: data.id,
            title: data.title,
            challengeId: data.challenge_id,
            universityId: data.university_id,
            facultyId: data.faculty_id,
            status: data.status,
            progress: Number(data.progress) || 0,
            health: 'good',
            risk: 'low',
            delayProbability: 0.05,
            collaborationScore: 9.0,
            impactPotential: 'high',
            description: data.description,
            timeline: {
              startDate: data.start_date || new Date().toISOString(),
              expectedEndDate: data.target_date || new Date().toISOString(),
            },
            budget: data.budget || { estimated: 0, allocated: 0, spent: 0, currency: 'INR' },
            district: data.district,
            tags: data.tags || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          demoEngine.addProject(newProj);
          return newProj;
        }
      } catch (err) {
        console.warn('Supabase createProject error, persisting locally:', err);
      }
    }

    // Local / Offline fallback project creation
    const newProj: Project = {
      id: `prj-${Date.now()}`,
      title: projectData.title,
      description: projectData.description,
      challengeId: projectData.challengeId,
      universityId: projectData.universityId || '11111111-1111-1111-1111-111111111101',
      facultyId: projectData.facultyId || '00000000-0000-0000-0000-000000000002',
      status: projectData.status || 'planning',
      progress: 5,
      health: 'good',
      risk: 'low',
      delayProbability: 0.05,
      collaborationScore: 9.0,
      impactPotential: 'high',
      timeline: {
        startDate: new Date().toISOString(),
        expectedEndDate: projectData.targetDate || new Date(Date.now() + 180 * 86400000).toISOString(),
      },
      budget: projectData.budget || { estimated: 500000, allocated: 300000, spent: 25000, currency: 'INR' },
      district: projectData.district || 'Ranchi',
      tags: projectData.tags || ['Innovation', 'Rural Solutions'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoEngine.addProject(newProj);

    if (projectData.challengeId) {
      demoEngine.updateChallengeStatus(projectData.challengeId, 'project_created', {
        projectId: newProj.id,
      });
    }

    return newProj;
  },

  async getProjectById(id: string): Promise<Project | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            university:universities!university_id(name, short_name),
            faculty:profiles!faculty_id(full_name, email),
            challenge:challenges!challenge_id(id, title, category, district, people_affected, status)
          `)
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const row = data as any;
          return {
            id: row.id,
            title: row.title,
            challengeId: row.challenge_id,
            universityId: row.university_id,
            facultyId: row.faculty_id,
            departmentId: row.department_id || undefined,
            status: row.status,
            progress: Number(row.progress) || 0,
            health: row.health || 'good',
            risk: row.risk || 'low',
            delayProbability: Number(row.delay_probability) || 0.05,
            collaborationScore: Number(row.collaboration_score) || 9.0,
            impactPotential: row.impact_potential || 'high',
            description: row.description || undefined,
            timeline: {
              startDate: row.start_date || new Date().toISOString(),
              expectedEndDate: row.target_date || new Date().toISOString(),
              actualEndDate: row.actual_end_date || undefined,
            },
            budget: row.budget || { estimated: 0, allocated: 0, spent: 0, currency: 'INR' },
            location: row.location || undefined,
            district: row.district || undefined,
            tags: row.tags || [],
            aiRecommendation: row.ai_recommendation || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase getProjectById error, using demoEngine fallback:', err);
      }
    }

    return demoEngine.getProjectById(id) || null;
  },

  async updateProjectProgress(id: string, increment: number): Promise<void> {
    const { data: proj } = await (supabase.from('projects') as any).select('progress').eq('id', id).single();
    const current = Number(proj?.progress) || 0;
    const next = Math.min(100, current + increment);

    await (supabase.from('projects') as any)
      .update({ progress: next, updated_at: new Date().toISOString() })
      .eq('id', id);
  },

  // ---------------- Tasks ----------------
  async getTasks(projectId: string): Promise<Task[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('tasks') as any)
          .select(`
            *,
            assignee:profiles!assigned_to(full_name)
          `)
          .eq('project_id', projectId)
          .order('order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((t: any) => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            description: t.description || undefined,
            status: t.status,
            priority: t.priority,
            assigneeId: t.assigned_to || undefined,
            assigneeName: t.assignee?.full_name || undefined,
            createdById: t.created_by,
            dueDate: t.deadline || undefined,
            completedAt: t.completed_at || undefined,
            attachments: t.attachments || [],
            tags: t.tags || [],
            order: t.order || 0,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getTasks error, using demoEngine fallback:', err);
      }
    }

    return demoEngine.getTasks(projectId);
  },

  async createTask(task: {
    projectId: string;
    title: string;
    description?: string;
    assignedTo?: string;
    createdBy: string;
    priority?: string;
  }): Promise<Task> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('tasks') as any)
          .insert({
            project_id: task.projectId,
            title: task.title,
            description: task.description,
            assigned_to: task.assignedTo,
            created_by: task.createdBy,
            priority: task.priority || 'medium',
            status: 'todo',
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            projectId: data.project_id,
            title: data.title,
            description: data.description || undefined,
            status: data.status,
            priority: data.priority,
            assigneeId: data.assigned_to || undefined,
            createdById: data.created_by,
            order: data.order || 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase createTask error, using demoEngine fallback:', err);
      }
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: 'todo',
      priority: (task.priority as any) || 'medium',
      assigneeId: task.assignedTo,
      createdById: task.createdBy,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    demoEngine.addTask(newTask);
    return newTask;
  },

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    demoEngine.updateTaskStatus(taskId, status);

    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('tasks') as any)
          .update({
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          })
          .eq('id', taskId);
      } catch (err) {
        console.warn('Supabase updateTaskStatus error:', err);
      }
    }
  },

  // ---------------- Milestones ----------------
  async getMilestones(projectId: string): Promise<Milestone[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('milestones') as any)
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((m: any) => ({
            id: m.id,
            projectId: m.project_id,
            title: m.name,
            description: m.description || undefined,
            progress: Number(m.progress) || 0,
            targetDate: m.target_date || m.deadline || new Date().toISOString(),
            completedAt: m.completed_at || undefined,
            status: m.status,
            createdById: m.created_by,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getMilestones error, using demoEngine fallback:', err);
      }
    }

    return demoEngine.getMilestones(projectId);
  },

  async updateMilestoneProgress(milestoneId: string, progress: number): Promise<void> {
    demoEngine.updateMilestoneProgress(milestoneId, progress);

    if (isSupabaseConfigured()) {
      try {
        const status = progress >= 100 ? 'completed' : 'in_progress';
        await (supabase.from('milestones') as any)
          .update({
            progress,
            status,
            completed_at: progress >= 100 ? new Date().toISOString() : null,
          })
          .eq('id', milestoneId);
      } catch (err) {
        console.warn('Supabase updateMilestoneProgress error:', err);
      }
    }
  },

  // ---------------- Messages (Realtime) ----------------
  async getMessages(projectId: string): Promise<Message[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('messages') as any)
          .select(`
            *,
            sender:profiles!sender_id(full_name, role)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((m: any) => ({
            id: m.id,
            projectId: m.project_id,
            senderId: m.sender_id,
            senderName: m.sender?.full_name || 'Team Member',
            senderRole: (m.sender?.role?.toLowerCase() as any) || 'student',
            text: m.message,
            attachments: m.attachments || [],
            isSystem: m.is_system || false,
            createdAt: m.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getMessages error, using demoEngine fallback:', err);
      }
    }

    return demoEngine.getMessages(projectId);
  },

  async sendMessage(projectId: string, senderId: string, text: string): Promise<Message> {
    const demoMsg: Message = {
      id: `msg-${Date.now()}`,
      projectId,
      senderId,
      senderName: 'Team Member',
      senderRole: 'student',
      text,
      createdAt: new Date().toISOString(),
    };
    demoEngine.addMessage(demoMsg);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('messages') as any)
          .insert({
            project_id: projectId,
            sender_id: senderId,
            message: text,
          })
          .select(`
            *,
            sender:profiles!sender_id(full_name, role)
          `)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            projectId: data.project_id,
            senderId: data.sender_id,
            senderName: data.sender?.full_name || 'Team Member',
            senderRole: (data.sender?.role?.toLowerCase() as any) || 'student',
            text: data.message,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Supabase sendMessage error, using demoEngine fallback:', err);
      }
    }

    return demoMsg;
  },

  subscribeToProjectMessages(projectId: string, onNewMessage: (msg: Message) => void) {
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          const newRow = payload.new as any;
          const { data: sender } = await (supabase.from('profiles') as any)
            .select('full_name, role')
            .eq('id', newRow.sender_id)
            .single();

          onNewMessage({
            id: newRow.id,
            projectId: newRow.project_id,
            senderId: newRow.sender_id,
            senderName: sender?.full_name || 'Member',
            senderRole: (sender?.role?.toLowerCase() as any) || 'student',
            text: newRow.message,
            createdAt: newRow.created_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
