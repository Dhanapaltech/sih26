-- ==============================================================================
-- Jharkhand Innovation Hub - Initial Database Schema Migration
-- Migration: 20260911000001_initial_schema.sql
-- Description: Creates the 31 core normalized tables, sequences, foreign keys, and indexes
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing if re-running
-- Drop views/tables in reverse order if needed

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('CITIZEN', 'GOVERNMENT', 'UNIVERSITY', 'FACULTY', 'STUDENT', 'INDUSTRY', 'STARTUP', 'ADMIN')),
    organization_id UUID,
    district TEXT,
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    innovation_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('government', 'university', 'industry', 'startup', 'ngo')),
    district TEXT,
    state TEXT DEFAULT 'Jharkhand',
    website TEXT,
    description TEXT,
    logo TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. UNIVERSITIES
CREATE TABLE IF NOT EXISTS public.universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    district TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('central', 'state', 'deemed', 'private', 'iit', 'nit')),
    departments TEXT[] DEFAULT '{}',
    website TEXT,
    ranking INTEGER,
    total_students INTEGER DEFAULT 0,
    logo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    head_faculty_name TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FACULTY_PROFILES
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    designation TEXT,
    research_areas TEXT[] DEFAULT '{}',
    expertise TEXT[] DEFAULT '{}',
    available_slots INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STUDENT_PROFILES
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    year INTEGER CHECK (year BETWEEN 1 AND 5),
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    experience TEXT,
    portfolio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDUSTRY_PROFILES
CREATE TABLE IF NOT EXISTS public.industry_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    organization_type TEXT NOT NULL CHECK (organization_type IN ('corporate', 'msme', 'startup', 'csr_foundation', 'ngo')),
    expertise TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    support_types TEXT[] DEFAULT '{}', -- funding, hardware, cloud, mentorship, pilot_site
    location TEXT,
    website TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence for Challenge Code (e.g. CHL-2026-00001)
CREATE SEQUENCE IF NOT EXISTS challenge_code_seq START 1;

-- 8. CHALLENGES
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_code TEXT UNIQUE NOT NULL,
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    district TEXT NOT NULL,
    village TEXT,
    town TEXT,
    location_text TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    people_affected INTEGER NOT NULL DEFAULT 1,
    urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    current_situation TEXT,
    expected_improvement TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'ai_analyzed', 'government_review', 'validated', 
        'university_matched', 'project_created', 'prototype', 'pilot', 
        'deployed', 'impact_measured', 'rejected', 'duplicate'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    ai_score NUMERIC(3, 1),
    government_note TEXT,
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    assigned_department TEXT,
    project_id UUID,
    duplicate_of UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CHALLENGE_MEDIA
CREATE TABLE IF NOT EXISTS public.challenge_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CHALLENGE_AI_ANALYSIS
CREATE TABLE IF NOT EXISTS public.challenge_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL UNIQUE REFERENCES public.challenges(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subcategory TEXT,
    priority TEXT NOT NULL,
    priority_score NUMERIC(3, 1) NOT NULL,
    severity TEXT,
    summary TEXT,
    affected_population_estimate INTEGER,
    required_skills TEXT[] DEFAULT '{}',
    recommended_solution TEXT,
    solution_type TEXT,
    technology_suggestions TEXT[] DEFAULT '{}',
    risk_factors TEXT[] DEFAULT '{}',
    impact_potential TEXT,
    confidence NUMERIC(4, 2) DEFAULT 0.95,
    impact_prediction JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CHALLENGE_DUPLICATES
CREATE TABLE IF NOT EXISTS public.challenge_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    matched_challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    similarity_score NUMERIC(4, 2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'flagged' CHECK (status IN ('flagged', 'confirmed_duplicate', 'false_positive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. UNIVERSITY_MATCHES
CREATE TABLE IF NOT EXISTS public.university_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    match_score NUMERIC(4, 2) NOT NULL,
    matching_reasons TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. FACULTY_MATCHES
CREATE TABLE IF NOT EXISTS public.faculty_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(4, 2) NOT NULL,
    matching_reasons TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence for Project Code (e.g. PRJ-2026-00001)
CREATE SEQUENCE IF NOT EXISTS project_code_seq START 1;

-- 16. PROJECTS (Must precede student/industry matches referencing project_id)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code TEXT UNIQUE NOT NULL,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE RESTRICT,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE RESTRICT,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN (
        'planning', 'active', 'prototype', 'testing', 'pilot', 'deployed', 'completed', 'paused'
    )),
    progress NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (progress BETWEEN 0 AND 100),
    health TEXT NOT NULL DEFAULT 'good' CHECK (health IN ('excellent', 'good', 'fair', 'at_risk', 'critical')),
    risk TEXT NOT NULL DEFAULT 'low' CHECK (risk IN ('low', 'medium', 'high')),
    delay_probability NUMERIC(4, 2) DEFAULT 0.05,
    collaboration_score NUMERIC(4, 2) DEFAULT 9.0,
    impact_potential TEXT NOT NULL DEFAULT 'high' CHECK (impact_potential IN ('low', 'medium', 'high', 'very_high')),
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    actual_end_date DATE,
    budget JSONB DEFAULT '{"estimated": 0, "allocated": 0, "spent": 0, "currency": "INR"}'::jsonb,
    location TEXT,
    district TEXT,
    tags TEXT[] DEFAULT '{}',
    ai_recommendation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint to challenges.project_id now that projects exists
ALTER TABLE public.challenges 
    ADD CONSTRAINT fk_challenges_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- 14. STUDENT_MATCHES
CREATE TABLE IF NOT EXISTS public.student_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(4, 2) NOT NULL,
    matching_reasons TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. INDUSTRY_MATCHES
CREATE TABLE IF NOT EXISTS public.industry_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES public.industry_profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(4, 2) NOT NULL,
    matching_reasons TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PROJECT_MEMBERS
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('CITIZEN', 'GOVERNMENT', 'UNIVERSITY', 'FACULTY', 'STUDENT', 'INDUSTRY', 'STARTUP', 'ADMIN')),
    project_role TEXT NOT NULL, -- e.g. "Principal Investigator", "Lead IoT Engineer", "Field Coordinator"
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 18. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
    deadline TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    attachments TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. MILESTONES
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    deadline DATE,
    target_date DATE,
    progress NUMERIC(5, 2) DEFAULT 0.00 CHECK (progress BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
    deliverables TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. PROPOSALS
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    budget NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. PARTNERSHIPS
CREATE TABLE IF NOT EXISTS public.partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    industry_id UUID REFERENCES public.industry_profiles(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    support_types TEXT[] DEFAULT '{}',
    funding_amount NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected')),
    description TEXT,
    contact_person TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. FUNDING
CREATE TABLE IF NOT EXISTS public.funding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    grant_type TEXT NOT NULL CHECK (grant_type IN ('state_r&d', 'csr_grant', 'incubation_fund', 'industry_contract', 'seed_fund')),
    disbursed_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. PROJECT_FILES
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    read_by UUID[] DEFAULT '{}',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. SOLUTIONS
CREATE TABLE IF NOT EXISTS public.solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'prototype' CHECK (status IN ('prototype', 'testing', 'pilot', 'deployed', 'verified', 'resolved')),
    deployed_at TIMESTAMPTZ,
    patent_id TEXT,
    startup_id UUID,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. PILOT_TESTS
CREATE TABLE IF NOT EXISTS public.pilot_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    solution_id UUID REFERENCES public.solutions(id) ON DELETE SET NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    test_metrics JSONB DEFAULT '{}'::jsonb,
    feedback TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. IMPACT_METRICS
CREATE TABLE IF NOT EXISTS public.impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    solution_id UUID REFERENCES public.solutions(id) ON DELETE CASCADE,
    people_impacted INTEGER NOT NULL DEFAULT 0,
    villages_impacted INTEGER NOT NULL DEFAULT 0,
    jobs_created INTEGER NOT NULL DEFAULT 0,
    cost_savings NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    environmental_improvement TEXT,
    service_improvement TEXT,
    deployment_date DATE,
    evidence TEXT,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_audit', 'verified', 'disputed')),
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 29. CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_code TEXT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    impact_summary TEXT NOT NULL,
    verification_url TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    certificate_file_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 31. CHALLENGE_TIMELINE
CREATE TABLE IF NOT EXISTS public.challenge_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'SUBMITTED', 'AI_ANALYZED', 'UNDER_REVIEW', 'VALIDATED',
        'UNIVERSITY_ASSIGNED', 'PROJECT_CREATED', 'FACULTY_ASSIGNED',
        'STUDENTS_JOINED', 'INDUSTRY_JOINED', 'PROTOTYPE', 'PILOT',
        'DEPLOYED', 'IMPACT_MEASURED', 'REJECTED'
    )),
    message TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_district ON public.challenges(district);
CREATE INDEX IF NOT EXISTS idx_challenges_citizen ON public.challenges(citizen_id);
CREATE INDEX IF NOT EXISTS idx_challenges_priority ON public.challenges(priority);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_university ON public.projects(university_id);
CREATE INDEX IF NOT EXISTS idx_projects_faculty ON public.projects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_messages_project ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_timeline_challenge ON public.challenge_timeline(challenge_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
