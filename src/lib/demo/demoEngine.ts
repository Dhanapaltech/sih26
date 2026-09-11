import { UserRole, Challenge, Project, Task, Milestone, Message, Notification } from '@/types';
import { DEMO_USERS, DEMO_CHALLENGES, DEMO_PROJECTS, DEMO_TASKS, DEMO_MILESTONES, DEMO_MESSAGES, DEMO_NOTIFICATIONS } from './demoData';
import { analyzeChallenge } from '@/lib/ai/localAI';

const STORAGE_KEYS = {
  CHALLENGES: 'jh_civic_challenges',
  PROJECTS: 'jh_civic_projects',
  TASKS: 'jh_civic_tasks',
};

function loadStored<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage save error:', e);
  }
}

class DemoEngine {
  private challenges: Challenge[] = loadStored<Challenge>(STORAGE_KEYS.CHALLENGES, DEMO_CHALLENGES);
  private projects: Project[] = loadStored<Project>(STORAGE_KEYS.PROJECTS, []);
  private tasks: Task[] = loadStored<Task>(STORAGE_KEYS.TASKS, []);
  private milestones: Milestone[] = [];
  private messages: Message[] = [];
  private notifications: Notification[] = [];

  public getChallenges(): Challenge[] {
    // Refresh from localStorage in case another tab or submit happened
    this.challenges = loadStored<Challenge>(STORAGE_KEYS.CHALLENGES, this.challenges);
    return this.challenges;
  }

  public getChallengeById(id: string): Challenge | undefined {
    return this.getChallenges().find(c => c.id === id);
  }

  public addChallenge(challenge: Challenge): Challenge {
    this.challenges = [challenge, ...this.challenges.filter(c => c.id !== challenge.id)];
    saveStored(STORAGE_KEYS.CHALLENGES, this.challenges);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jh_challenge_created', { detail: challenge }));
    }
    return challenge;
  }

  public updateChallengeStatus(id: string, status: Challenge['status'], extra?: Partial<Challenge>): Challenge | undefined {
    const idx = this.challenges.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.challenges[idx] = { ...this.challenges[idx], status, ...extra, updatedAt: new Date().toISOString() };
      saveStored(STORAGE_KEYS.CHALLENGES, this.challenges);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jh_challenge_updated', { detail: this.challenges[idx] }));
      }
      return this.challenges[idx];
    }
    return undefined;
  }

  public getProjects(): Project[] {
    this.projects = loadStored<Project>(STORAGE_KEYS.PROJECTS, this.projects);
    return this.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  public addProject(project: Project): Project {
    this.projects = [project, ...this.projects.filter(p => p.id !== project.id)];
    saveStored(STORAGE_KEYS.PROJECTS, this.projects);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jh_project_created', { detail: project }));
    }
    return project;
  }

  public updateProjectProgress(id: string, increment: number): Project | undefined {
    const proj = this.projects.find(p => p.id === id);
    if (proj) {
      proj.progress = Math.min(100, proj.progress + increment);
      proj.updatedAt = new Date().toISOString();
      return proj;
    }
    return undefined;
  }

  public getTasks(projectId?: string): Task[] {
    return projectId ? this.tasks.filter(t => t.projectId === projectId) : this.tasks;
  }

  public addTask(task: Task): Task {
    this.tasks = [task, ...this.tasks];
    return task;
  }

  public updateTaskStatus(taskId: string, status: Task['status']): Task | undefined {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date().toISOString();
      return task;
    }
    return undefined;
  }

  public getMilestones(projectId?: string): Milestone[] {
    return projectId ? this.milestones.filter(m => m.projectId === projectId) : this.milestones;
  }

  public updateMilestoneProgress(milestoneId: string, progress: number): Milestone | undefined {
    const m = this.milestones.find(item => item.id === milestoneId);
    if (m) {
      m.progress = progress;
      if (progress >= 100) {
        m.status = 'completed';
        m.completedAt = new Date().toISOString();
      } else {
        m.status = 'in_progress';
      }
      m.updatedAt = new Date().toISOString();
      return m;
    }
    return undefined;
  }

  public getMessages(projectId: string): Message[] {
    return this.messages.filter(m => m.projectId === projectId);
  }

  public addMessage(message: Message): Message {
    this.messages.push(message);
    return message;
  }

  public getNotifications(userId?: string): Notification[] {
    return userId ? this.notifications.filter(n => n.userId === userId) : this.notifications;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
  }

  public markAllNotificationsAsRead(userId?: string): void {
    this.notifications.forEach(n => {
      if (!userId || n.userId === userId) n.isRead = true;
    });
  }

  public simulateAI(title: string, description: string, peopleAffected = 2400, district = 'Dumka') {
    return analyzeChallenge(title, description, peopleAffected, 'high', district, this.challenges);
  }

  public resetDemoData() {
    this.challenges = [...DEMO_CHALLENGES];
    this.projects = [...DEMO_PROJECTS];
    this.tasks = [...DEMO_TASKS];
    this.milestones = [...DEMO_MILESTONES];
    this.messages = [...DEMO_MESSAGES];
    this.notifications = [...DEMO_NOTIFICATIONS];
  }
}

export const demoEngine = new DemoEngine();
