// Jharkhand Innovation Hub - Core Types

export type UserRole =
  | 'citizen'
  | 'government'
  | 'university'
  | 'faculty'
  | 'student'
  | 'industry'
  | 'startup'
  | 'admin';

export type ChallengeStatus =
  | 'submitted'
  | 'ai_analyzed'
  | 'government_review'
  | 'validated'
  | 'university_matched'
  | 'project_created'
  | 'prototype'
  | 'pilot'
  | 'deployed'
  | 'impact_measured'
  | 'rejected'
  | 'duplicate';

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'prototype'
  | 'testing'
  | 'pilot'
  | 'deployed'
  | 'completed'
  | 'paused';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type NotificationType =
  | 'challenge_submitted'
  | 'ai_analysis_completed'
  | 'challenge_validated'
  | 'university_assigned'
  | 'student_invited'
  | 'industry_joined'
  | 'milestone_completed'
  | 'prototype_ready'
  | 'pilot_started'
  | 'solution_deployed'
  | 'impact_updated'
  | 'message_received'
  | 'system';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  organizationId?: string;
  universityId?: string;
  department?: string;
  district?: string;
  skills?: string[];
  bio?: string;
  phone?: string;
  innovationPoints?: number;
  badges?: string[];
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: 'government' | 'university' | 'industry' | 'startup' | 'ngo';
  district?: string;
  state?: string;
  website?: string;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  isDemo?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  district: string;
  village?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  peopleAffected: number;
  urgency: Priority;
  currentSituation?: string;
  expectedImprovement?: string;
  status: ChallengeStatus;
  citizenId: string;
  citizenName: string;
  photos?: string[];
  videos?: string[];
  documents?: string[];
  aiAnalysisId?: string;
  governmentNote?: string;
  validatedAt?: string;
  validatedBy?: string;
  assignedUniversityId?: string;
  assignedDepartment?: string;
  projectId?: string;
  priority?: Priority;
  aiScore?: number;
  duplicateOf?: string;
  submittedAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface AIAnalysis {
  id: string;
  challengeId: string;
  category: string;
  subcategory: string;
  priority: Priority;
  severityScore: number;
  estimatedPeopleAffected: number;
  requiredSkills: string[];
  recommendedSolution: string;
  solutionType: string;
  keywords: string[];
  confidence: number;
  duplicates: DuplicateMatch[];
  universityMatches: UniversityMatch[];
  industryMatches: IndustryMatch[];
  impactPrediction: {
    reach: number;
    timeToSolve: string;
    costEstimate: string;
    sdgGoals: string[];
  };
  processedAt: string;
  engine: 'external' | 'local';
  isDemo?: boolean;
}

export interface DuplicateMatch {
  challengeId: string;
  title: string;
  similarity: number;
  district: string;
  status: ChallengeStatus;
}

export interface UniversityMatch {
  universityId: string;
  universityName: string;
  matchScore: number;
  reasons: string[];
  departments: string[];
}

export interface IndustryMatch {
  industryId: string;
  companyName: string;
  matchScore: number;
  reasons: string[];
  supportTypes: string[];
}

export interface StudentMatch {
  studentId: string;
  studentName: string;
  matchScore: number;
  skills: string[];
  role: string;
  university: string;
}

export interface Project {
  id: string;
  title: string;
  challengeId: string;
  universityId: string;
  facultyId: string;
  departmentId?: string;
  status: ProjectStatus;
  progress: number;
  health: 'excellent' | 'good' | 'fair' | 'at_risk' | 'critical';
  risk: 'low' | 'medium' | 'high';
  delayProbability: number;
  collaborationScore: number;
  impactPotential: 'low' | 'medium' | 'high' | 'very_high';
  description?: string;
  objectives?: string[];
  timeline: {
    startDate: string;
    expectedEndDate: string;
    actualEndDate?: string;
  };
  budget?: {
    estimated: number;
    allocated: number;
    spent: number;
    currency: string;
  };
  location?: string;
  district?: string;
  tags?: string[];
  aiRecommendation?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  projectRole: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  assigneeName?: string;
  createdById: string;
  dueDate?: string;
  completedAt?: string;
  attachments?: string[];
  comments?: TaskComment[];
  tags?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  progress: number;
  targetDate: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  attachments?: string[];
  isSystem?: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Solution {
  id: string;
  projectId: string;
  challengeId: string;
  title: string;
  description: string;
  type: string;
  deployedAt?: string;
  impactMetrics?: ImpactMetrics;
  patentId?: string;
  startupId?: string;
  isOpen?: boolean;
  createdAt: string;
}

export interface ImpactMetrics {
  id: string;
  projectId?: string;
  challengeId?: string;
  solutionId?: string;
  citizensImpacted: number;
  villagesImpacted: number;
  jobsCreated: number;
  costSavings: number;
  environmentScore?: number;
  sdgGoals: string[];
  testimonials?: string[];
  measuredAt: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  university: string;
  projectId: string;
  projectTitle: string;
  projectRole: string;
  completedAt: string;
  impactSummary: string;
  issueDate: string;
  isValid: boolean;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorName: string;
  role: UserRole;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Partnership {
  id: string;
  projectId: string;
  industryId: string;
  companyName: string;
  supportTypes: string[];
  fundingAmount?: number;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  description?: string;
  contactPerson?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  district: string;
  type: 'central' | 'state' | 'deemed' | 'private' | 'iit' | 'nit';
  departments: string[];
  website?: string;
  ranking?: number;
  activeProjects?: number;
  totalStudents?: number;
  logo?: string;
  isDemo?: boolean;
}

export interface JharkhandDistrict {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  challenges?: number;
  projects?: number;
  solutions?: number;
  citizens?: number;
}

// Demo/UI types
export interface DemoState {
  isDemo: boolean;
  currentRole: UserRole;
  currentUser: User | null;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface GlobalSearchResult {
  type: 'challenge' | 'project' | 'university' | 'student' | 'faculty' | 'industry' | 'solution';
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
}
