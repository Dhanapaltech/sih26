// Generated / Handcrafted Supabase Database Schema Types for TypeScript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          role: 'CITIZEN' | 'GOVERNMENT' | 'UNIVERSITY' | 'FACULTY' | 'STUDENT' | 'INDUSTRY' | 'STARTUP' | 'ADMIN';
          organization_id: string | null;
          district: string | null;
          avatar_url: string | null;
          bio: string | null;
          skills: string[];
          innovation_points: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          role: 'CITIZEN' | 'GOVERNMENT' | 'UNIVERSITY' | 'FACULTY' | 'STUDENT' | 'INDUSTRY' | 'STARTUP' | 'ADMIN';
          organization_id?: string | null;
          district?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          skills?: string[];
          innovation_points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          type: 'government' | 'university' | 'industry' | 'startup' | 'ngo';
          district: string | null;
          state: string;
          website: string | null;
          description: string | null;
          logo: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'government' | 'university' | 'industry' | 'startup' | 'ngo';
          district?: string | null;
          state?: string;
          website?: string | null;
          description?: string | null;
          logo?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      universities: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          district: string;
          type: 'central' | 'state' | 'deemed' | 'private' | 'iit' | 'nit';
          departments: string[];
          website: string | null;
          ranking: number | null;
          total_students: number;
          logo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          district: string;
          type: 'central' | 'state' | 'deemed' | 'private' | 'iit' | 'nit';
          departments?: string[];
          website?: string | null;
          ranking?: number | null;
          total_students?: number;
          logo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['universities']['Insert']>;
      };
      departments: {
        Row: {
          id: string;
          university_id: string;
          name: string;
          code: string | null;
          head_faculty_name: string | null;
          contact_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          university_id: string;
          name: string;
          code?: string | null;
          head_faculty_name?: string | null;
          contact_email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['departments']['Insert']>;
      };
      faculty_profiles: {
        Row: {
          id: string;
          profile_id: string;
          university_id: string | null;
          department: string;
          designation: string | null;
          research_areas: string[];
          expertise: string[];
          available_slots: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          university_id?: string | null;
          department: string;
          designation?: string | null;
          research_areas?: string[];
          expertise?: string[];
          available_slots?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['faculty_profiles']['Insert']>;
      };
      student_profiles: {
        Row: {
          id: string;
          profile_id: string;
          university_id: string | null;
          department: string;
          year: number | null;
          skills: string[];
          interests: string[];
          experience: string | null;
          portfolio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          university_id?: string | null;
          department: string;
          year?: number | null;
          skills?: string[];
          interests?: string[];
          experience?: string | null;
          portfolio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>;
      };
      industry_profiles: {
        Row: {
          id: string;
          profile_id: string;
          company_name: string;
          organization_type: 'corporate' | 'msme' | 'startup' | 'csr_foundation' | 'ngo';
          expertise: string[];
          technologies: string[];
          support_types: string[];
          location: string | null;
          website: string | null;
          contact_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          company_name: string;
          organization_type: 'corporate' | 'msme' | 'startup' | 'csr_foundation' | 'ngo';
          expertise?: string[];
          technologies?: string[];
          support_types?: string[];
          location?: string | null;
          website?: string | null;
          contact_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['industry_profiles']['Insert']>;
      };
      challenges: {
        Row: {
          id: string;
          challenge_code: string;
          citizen_id: string;
          title: string;
          description: string;
          category: string;
          subcategory: string | null;
          district: string;
          village: string | null;
          town: string | null;
          location_text: string | null;
          latitude: number | null;
          longitude: number | null;
          people_affected: number;
          urgency: 'low' | 'medium' | 'high' | 'critical';
          current_situation: string | null;
          expected_improvement: string | null;
          status:
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
          priority: 'low' | 'medium' | 'high' | 'critical' | null;
          ai_score: number | null;
          government_note: string | null;
          validated_at: string | null;
          validated_by: string | null;
          assigned_university_id: string | null;
          assigned_department: string | null;
          project_id: string | null;
          duplicate_of: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          challenge_code?: string;
          citizen_id: string;
          title: string;
          description: string;
          category: string;
          subcategory?: string | null;
          district: string;
          village?: string | null;
          town?: string | null;
          location_text?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          people_affected?: number;
          urgency?: 'low' | 'medium' | 'high' | 'critical';
          current_situation?: string | null;
          expected_improvement?: string | null;
          status?:
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
          priority?: 'low' | 'medium' | 'high' | 'critical' | null;
          ai_score?: number | null;
          government_note?: string | null;
          validated_at?: string | null;
          validated_by?: string | null;
          assigned_university_id?: string | null;
          assigned_department?: string | null;
          project_id?: string | null;
          duplicate_of?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>;
      };
      challenge_media: {
        Row: {
          id: string;
          challenge_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenge_media']['Insert']>;
      };
      challenge_ai_analysis: {
        Row: {
          id: string;
          challenge_id: string;
          category: string;
          subcategory: string | null;
          priority: string;
          priority_score: number;
          severity: string | null;
          summary: string | null;
          affected_population_estimate: number | null;
          required_skills: string[];
          recommended_solution: string | null;
          solution_type: string | null;
          technology_suggestions: string[];
          risk_factors: string[];
          impact_potential: string | null;
          confidence: number;
          impact_prediction: Json;
          processed_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          category: string;
          subcategory?: string | null;
          priority: string;
          priority_score: number;
          severity?: string | null;
          summary?: string | null;
          affected_population_estimate?: number | null;
          required_skills?: string[];
          recommended_solution?: string | null;
          solution_type?: string | null;
          technology_suggestions?: string[];
          risk_factors?: string[];
          impact_potential?: string | null;
          confidence?: number;
          impact_prediction?: Json;
          processed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenge_ai_analysis']['Insert']>;
      };
      challenge_duplicates: {
        Row: {
          id: string;
          challenge_id: string;
          matched_challenge_id: string;
          similarity_score: number;
          reason: string | null;
          status: 'flagged' | 'confirmed_duplicate' | 'false_positive';
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          matched_challenge_id: string;
          similarity_score: number;
          reason?: string | null;
          status?: 'flagged' | 'confirmed_duplicate' | 'false_positive';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenge_duplicates']['Insert']>;
      };
      university_matches: {
        Row: {
          id: string;
          challenge_id: string;
          university_id: string;
          match_score: number;
          matching_reasons: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          university_id: string;
          match_score: number;
          matching_reasons?: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['university_matches']['Insert']>;
      };
      faculty_matches: {
        Row: {
          id: string;
          challenge_id: string;
          faculty_id: string;
          match_score: number;
          matching_reasons: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          faculty_id: string;
          match_score: number;
          matching_reasons?: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['faculty_matches']['Insert']>;
      };
      student_matches: {
        Row: {
          id: string;
          project_id: string | null;
          student_id: string;
          match_score: number;
          matching_reasons: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          student_id: string;
          match_score: number;
          matching_reasons?: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['student_matches']['Insert']>;
      };
      industry_matches: {
        Row: {
          id: string;
          project_id: string | null;
          industry_id: string;
          match_score: number;
          matching_reasons: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          industry_id: string;
          match_score: number;
          matching_reasons?: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['industry_matches']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          project_code: string;
          challenge_id: string;
          university_id: string;
          faculty_id: string;
          created_by: string;
          title: string;
          description: string | null;
          status: 'planning' | 'active' | 'prototype' | 'testing' | 'pilot' | 'deployed' | 'completed' | 'paused';
          progress: number;
          health: 'excellent' | 'good' | 'fair' | 'at_risk' | 'critical';
          risk: 'low' | 'medium' | 'high';
          delay_probability: number;
          collaboration_score: number;
          impact_potential: 'low' | 'medium' | 'high' | 'very_high';
          start_date: string | null;
          target_date: string | null;
          actual_end_date: string | null;
          budget: Json;
          location: string | null;
          district: string | null;
          tags: string[];
          ai_recommendation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_code?: string;
          challenge_id: string;
          university_id: string;
          faculty_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          status?: 'planning' | 'active' | 'prototype' | 'testing' | 'pilot' | 'deployed' | 'completed' | 'paused';
          progress?: number;
          health?: 'excellent' | 'good' | 'fair' | 'at_risk' | 'critical';
          risk?: 'low' | 'medium' | 'high';
          delay_probability?: number;
          collaboration_score?: number;
          impact_potential?: 'low' | 'medium' | 'high' | 'very_high';
          start_date?: string | null;
          target_date?: string | null;
          actual_end_date?: string | null;
          budget?: Json;
          location?: string | null;
          district?: string | null;
          tags?: string[];
          ai_recommendation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          project_role: string;
          status: 'active' | 'pending' | 'inactive';
          joined_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: string;
          project_role: string;
          status?: 'active' | 'pending' | 'inactive';
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_members']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          created_by: string;
          priority: 'low' | 'medium' | 'high' | 'critical';
          status: 'todo' | 'in_progress' | 'review' | 'completed';
          deadline: string | null;
          completed_at: string | null;
          attachments: string[];
          tags: string[];
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          created_by: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'todo' | 'in_progress' | 'review' | 'completed';
          deadline?: string | null;
          completed_at?: string | null;
          attachments?: string[];
          tags?: string[];
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          deadline: string | null;
          target_date: string | null;
          progress: number;
          status: 'pending' | 'in_progress' | 'completed' | 'delayed';
          deliverables: string[];
          created_by: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          deadline?: string | null;
          target_date?: string | null;
          progress?: number;
          status?: 'pending' | 'in_progress' | 'completed' | 'delayed';
          deliverables?: string[];
          created_by: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['milestones']['Insert']>;
      };
      proposals: {
        Row: {
          id: string;
          challenge_id: string;
          university_id: string;
          title: string;
          content: string;
          budget: number;
          status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          university_id: string;
          title: string;
          content: string;
          budget?: number;
          status?: 'submitted' | 'under_review' | 'accepted' | 'rejected';
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['proposals']['Insert']>;
      };
      partnerships: {
        Row: {
          id: string;
          project_id: string;
          industry_id: string | null;
          company_name: string;
          support_types: string[];
          funding_amount: number;
          status: 'pending' | 'active' | 'completed' | 'rejected';
          description: string | null;
          contact_person: string | null;
          contact_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          industry_id?: string | null;
          company_name: string;
          support_types?: string[];
          funding_amount?: number;
          status?: 'pending' | 'active' | 'completed' | 'rejected';
          description?: string | null;
          contact_person?: string | null;
          contact_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['partnerships']['Insert']>;
      };
      funding: {
        Row: {
          id: string;
          project_id: string;
          source_name: string;
          amount: number;
          currency: string;
          grant_type: 'state_r&d' | 'csr_grant' | 'incubation_fund' | 'industry_contract' | 'seed_fund';
          disbursed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_name: string;
          amount?: number;
          currency?: string;
          grant_type: 'state_r&d' | 'csr_grant' | 'incubation_fund' | 'industry_contract' | 'seed_fund';
          disbursed_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['funding']['Insert']>;
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size?: number | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_files']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          message: string;
          attachments: string[];
          read_by: string[];
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          message: string;
          attachments?: string[];
          read_by?: string[];
          is_system?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          entity_type: string | null;
          entity_id: string | null;
          is_read: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          entity_type?: string | null;
          entity_id?: string | null;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      solutions: {
        Row: {
          id: string;
          project_id: string;
          challenge_id: string;
          title: string;
          description: string;
          type: string;
          status: 'prototype' | 'testing' | 'pilot' | 'deployed' | 'verified' | 'resolved';
          deployed_at: string | null;
          patent_id: string | null;
          startup_id: string | null;
          is_open: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          challenge_id: string;
          title: string;
          description: string;
          type: string;
          status?: 'prototype' | 'testing' | 'pilot' | 'deployed' | 'verified' | 'resolved';
          deployed_at?: string | null;
          patent_id?: string | null;
          startup_id?: string | null;
          is_open?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['solutions']['Insert']>;
      };
      pilot_tests: {
        Row: {
          id: string;
          project_id: string;
          solution_id: string | null;
          location: string;
          district: string;
          start_date: string;
          end_date: string | null;
          test_metrics: Json;
          feedback: string | null;
          status: 'active' | 'completed' | 'failed' | 'paused';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          solution_id?: string | null;
          location: string;
          district: string;
          start_date?: string;
          end_date?: string | null;
          test_metrics?: Json;
          feedback?: string | null;
          status?: 'active' | 'completed' | 'failed' | 'paused';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pilot_tests']['Insert']>;
      };
      impact_metrics: {
        Row: {
          id: string;
          project_id: string | null;
          challenge_id: string | null;
          solution_id: string | null;
          people_impacted: number;
          villages_impacted: number;
          jobs_created: number;
          cost_savings: number;
          environmental_improvement: string | null;
          service_improvement: string | null;
          deployment_date: string | null;
          evidence: string | null;
          verification_status: 'unverified' | 'pending_audit' | 'verified' | 'disputed';
          measured_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          challenge_id?: string | null;
          solution_id?: string | null;
          people_impacted?: number;
          villages_impacted?: number;
          jobs_created?: number;
          cost_savings?: number;
          environmental_improvement?: string | null;
          service_improvement?: string | null;
          deployment_date?: string | null;
          evidence?: string | null;
          verification_status?: 'unverified' | 'pending_audit' | 'verified' | 'disputed';
          measured_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['impact_metrics']['Insert']>;
      };
      certificates: {
        Row: {
          id: string;
          certificate_code: string;
          student_id: string;
          project_id: string;
          university_id: string;
          role: string;
          completion_date: string;
          impact_summary: string;
          verification_url: string | null;
          is_valid: boolean;
          certificate_file_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          certificate_code: string;
          student_id: string;
          project_id: string;
          university_id: string;
          role: string;
          completion_date?: string;
          impact_summary: string;
          verification_url?: string | null;
          is_valid?: boolean;
          certificate_file_path?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_role?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      challenge_timeline: {
        Row: {
          id: string;
          challenge_id: string;
          event_type:
            | 'SUBMITTED'
            | 'AI_ANALYZED'
            | 'UNDER_REVIEW'
            | 'VALIDATED'
            | 'UNIVERSITY_ASSIGNED'
            | 'PROJECT_CREATED'
            | 'FACULTY_ASSIGNED'
            | 'STUDENTS_JOINED'
            | 'INDUSTRY_JOINED'
            | 'PROTOTYPE'
            | 'PILOT'
            | 'DEPLOYED'
            | 'IMPACT_MEASURED'
            | 'REJECTED';
          message: string;
          actor_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          event_type:
            | 'SUBMITTED'
            | 'AI_ANALYZED'
            | 'UNDER_REVIEW'
            | 'VALIDATED'
            | 'UNIVERSITY_ASSIGNED'
            | 'PROJECT_CREATED'
            | 'FACULTY_ASSIGNED'
            | 'STUDENTS_JOINED'
            | 'INDUSTRY_JOINED'
            | 'PROTOTYPE'
            | 'PILOT'
            | 'DEPLOYED'
            | 'IMPACT_MEASURED'
            | 'REJECTED';
          message: string;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenge_timeline']['Insert']>;
      };
    };
    Functions: {
      get_state_analytics: {
        Args: Record<string, never>;
        Returns: {
          totalChallenges: number;
          validatedChallenges: number;
          underReviewChallenges: number;
          activeProjects: number;
          deployedSolutions: number;
          universities: number;
          industryPartners: number;
          impactedCitizens: number;
        };
      };
      get_district_challenge_counts: {
        Args: Record<string, never>;
        Returns: {
          district_name: string;
          challenge_count: number;
          project_count: number;
          solution_count: number;
        }[];
      };
      search_global: {
        Args: { query_text: string };
        Returns: {
          challenges: Json[];
          projects: Json[];
          universities: Json[];
        };
      };
    };
  };
}
