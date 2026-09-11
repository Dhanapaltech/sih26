-- ==============================================================================
-- JHARKHAND INNOVATION HUB - COMPLETE DATABASE SETUP
-- Generated for project: mmkokgdwvwhwgblnyitd
-- Paste this entire script into your Supabase SQL Editor and click RUN
-- ==============================================================================

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


-- ==============================================================================
-- Jharkhand Innovation Hub - Triggers, Functions, Storage & RLS Migration
-- Migration: 20260911000002_triggers_and_rls.sql
-- Description: Automates sequential code generators, user profile creation,
--              timeline audit trails, storage buckets, and secure Row Level Security.
-- ==============================================================================

-- 1. FUNCTION: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE OR REPLACE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_challenges_updated_at
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_milestones_updated_at
    BEFORE UPDATE ON public.milestones
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. FUNCTION: Generate Sequential Challenge Code (CHL-2026-00001)
CREATE OR REPLACE FUNCTION public.set_challenge_code()
RETURNS TRIGGER AS $$
DECLARE
    seq_val BIGINT;
    year_str TEXT;
BEGIN
    IF NEW.challenge_code IS NULL OR NEW.challenge_code = '' THEN
        seq_val := nextval('public.challenge_code_seq');
        year_str := TO_CHAR(NOW(), 'YYYY');
        NEW.challenge_code := 'CHL-' || year_str || '-' || LPAD(seq_val::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_challenge_code
    BEFORE INSERT ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION public.set_challenge_code();

-- 3. FUNCTION: Generate Sequential Project Code (PRJ-2026-00001)
CREATE OR REPLACE FUNCTION public.set_project_code()
RETURNS TRIGGER AS $$
DECLARE
    seq_val BIGINT;
    year_str TEXT;
BEGIN
    IF NEW.project_code IS NULL OR NEW.project_code = '' THEN
        seq_val := nextval('public.project_code_seq');
        year_str := TO_CHAR(NOW(), 'YYYY');
        NEW.project_code := 'PRJ-' || year_str || '-' || LPAD(seq_val::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_project_code
    BEFORE INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.set_project_code();

-- 4. FUNCTION: Auto-create Profile on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_full_name TEXT;
    user_district TEXT;
    user_phone TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'CITIZEN');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'displayName', split_part(NEW.email, '@', 1));
    user_district := COALESCE(NEW.raw_user_meta_data->>'district', 'Ranchi');
    user_phone := NEW.phone;

    INSERT INTO public.profiles (
        auth_user_id,
        email,
        full_name,
        role,
        district,
        phone
    ) VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        UPPER(user_role),
        user_district,
        user_phone
    ) ON CONFLICT (auth_user_id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        district = EXCLUDED.district;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to hook into auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. FUNCTION & TRIGGER: Auto-create Challenge Timeline on Challenge Creation / Status Change
CREATE OR REPLACE FUNCTION public.track_challenge_timeline()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.challenge_timeline (challenge_id, event_type, message, actor_id)
        VALUES (NEW.id, 'SUBMITTED', 'Challenge submitted by citizen and queued for regional AI synthesis.', NEW.citizen_id);
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.challenge_timeline (challenge_id, event_type, message, actor_id)
        VALUES (
            NEW.id, 
            CASE 
                WHEN NEW.status = 'ai_analyzed' THEN 'AI_ANALYZED'
                WHEN NEW.status = 'government_review' THEN 'UNDER_REVIEW'
                WHEN NEW.status = 'validated' THEN 'VALIDATED'
                WHEN NEW.status = 'university_matched' THEN 'UNIVERSITY_ASSIGNED'
                WHEN NEW.status = 'project_created' THEN 'PROJECT_CREATED'
                WHEN NEW.status = 'prototype' THEN 'PROTOTYPE'
                WHEN NEW.status = 'pilot' THEN 'PILOT'
                WHEN NEW.status = 'deployed' THEN 'DEPLOYED'
                WHEN NEW.status = 'impact_measured' THEN 'IMPACT_MEASURED'
                WHEN NEW.status = 'rejected' THEN 'REJECTED'
                ELSE 'UNDER_REVIEW'
            END,
            'Challenge transitioned from ' || OLD.status || ' to ' || NEW.status,
            COALESCE(NEW.validated_by, NEW.citizen_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_challenge_timeline
    AFTER INSERT OR UPDATE OF status ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION public.track_challenge_timeline();

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('challenge-media', 'challenge-media', true),
    ('project-files', 'project-files', false),
    ('documents', 'documents', false),
    ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to fetch current authenticated user profile
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS public.profiles AS $$
    SELECT * FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all 31 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_duplicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_timeline ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view public profiles
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

-- Public can view limited university / faculty / student profiles
CREATE POLICY "Profiles viewable by public" ON public.profiles
    FOR SELECT TO anon
    USING (role IN ('UNIVERSITY', 'FACULTY', 'STUDENT'));

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- Insert handled by auth trigger or user themselves
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth_user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 2. UNIVERSITIES & DEPARTMENTS & ORGANIZATIONS
-- ------------------------------------------------------------------------------
CREATE POLICY "Universities viewable by all" ON public.universities
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Departments viewable by all" ON public.departments
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Organizations viewable by all" ON public.organizations
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin manage universities" ON public.universities
    FOR ALL TO authenticated
    USING ((public.get_current_profile()).role = 'ADMIN');

-- ------------------------------------------------------------------------------
-- 3. CHALLENGES POLICIES
-- ------------------------------------------------------------------------------
-- Citizens can insert challenges with their own profile ID
CREATE POLICY "Citizen can create challenges" ON public.challenges
    FOR INSERT TO authenticated
    WITH CHECK (
        citizen_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    );

-- Citizens can view their own challenges; Public can view validated/active challenges; Gov/Admin can view all
CREATE POLICY "Challenge view policy" ON public.challenges
    FOR SELECT TO authenticated
    USING (
        citizen_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR status IN ('validated', 'university_matched', 'project_created', 'prototype', 'pilot', 'deployed', 'impact_measured')
        OR (public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY')
    );

CREATE POLICY "Public challenge view policy" ON public.challenges
    FOR SELECT TO anon
    USING (status IN ('validated', 'university_matched', 'project_created', 'prototype', 'pilot', 'deployed', 'impact_measured'));

-- Citizens can update own challenge if still in submitted state
CREATE POLICY "Citizen update submitted challenge" ON public.challenges
    FOR UPDATE TO authenticated
    USING (
        citizen_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        AND status = 'submitted'
    );

-- Government and Admin can update challenge status, assign university, validate
CREATE POLICY "Government and Admin update challenges" ON public.challenges
    FOR UPDATE TO authenticated
    USING ((public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN'));

-- ------------------------------------------------------------------------------
-- 4. CHALLENGE MEDIA POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Media viewable with challenge access" ON public.challenge_media
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Uploader can insert challenge media" ON public.challenge_media
    FOR INSERT TO authenticated
    WITH CHECK (
        uploaded_by = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    );

-- ------------------------------------------------------------------------------
-- 5. CHALLENGE AI ANALYSIS & DUPLICATES
-- ------------------------------------------------------------------------------
CREATE POLICY "AI Analysis viewable by authorized users" ON public.challenge_ai_analysis
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.challenges c 
            WHERE c.id = challenge_ai_analysis.challenge_id
            AND (
                c.citizen_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
                OR (public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY')
            )
        )
    );

CREATE POLICY "Service and Edge function insert AI Analysis" ON public.challenge_ai_analysis
    FOR ALL TO authenticated
    USING ((public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'CITIZEN'));

CREATE POLICY "Duplicates view policy" ON public.challenge_duplicates
    FOR SELECT TO authenticated
    USING ((public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY'));

-- ------------------------------------------------------------------------------
-- 6. MATCHES POLICIES (University, Faculty, Student, Industry)
-- ------------------------------------------------------------------------------
CREATE POLICY "University matches viewable" ON public.university_matches
    FOR SELECT TO authenticated
    USING ((public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY'));

CREATE POLICY "Faculty matches viewable" ON public.faculty_matches
    FOR SELECT TO authenticated
    USING ((public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY'));

CREATE POLICY "Student matches viewable" ON public.student_matches
    FOR SELECT TO authenticated
    USING ((public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY', 'STUDENT'));

CREATE POLICY "Industry matches viewable" ON public.industry_matches
    FOR SELECT TO authenticated
    USING ((public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY', 'INDUSTRY', 'STARTUP'));

-- ------------------------------------------------------------------------------
-- 7. PROJECTS & PROJECT MEMBERS POLICIES
-- ------------------------------------------------------------------------------
-- View projects: public can view deployed/active; members and gov can view all
CREATE POLICY "Project view policy" ON public.projects
    FOR SELECT TO authenticated
    USING (
        status IN ('prototype', 'testing', 'pilot', 'deployed', 'completed')
        OR created_by = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR faculty_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.project_members pm 
            WHERE pm.project_id = projects.id 
            AND pm.user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        )
        OR (public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY')
    );

CREATE POLICY "Public project view policy" ON public.projects
    FOR SELECT TO anon
    USING (status IN ('prototype', 'testing', 'pilot', 'deployed', 'completed'));

-- University / Faculty / Admin can create projects
CREATE POLICY "Authorized cadres create projects" ON public.projects
    FOR INSERT TO authenticated
    WITH CHECK ((public.get_current_profile()).role IN ('UNIVERSITY', 'FACULTY', 'ADMIN', 'GOVERNMENT'));

-- Faculty mentor and project members can update project
CREATE POLICY "Project updates" ON public.projects
    FOR UPDATE TO authenticated
    USING (
        faculty_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR created_by = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR (public.get_current_profile()).role IN ('ADMIN', 'GOVERNMENT', 'UNIVERSITY')
    );

-- Project Members View
CREATE POLICY "Project members view policy" ON public.project_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Project members manage policy" ON public.project_members
    FOR ALL TO authenticated
    USING ((public.get_current_profile()).role IN ('UNIVERSITY', 'FACULTY', 'ADMIN'));

-- ------------------------------------------------------------------------------
-- 8. TASKS & MILESTONES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Tasks view policy" ON public.tasks
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = tasks.project_id
            AND pm.user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        )
        OR (public.get_current_profile()).role IN ('GOVERNMENT', 'ADMIN', 'UNIVERSITY', 'FACULTY')
    );

CREATE POLICY "Tasks insert policy" ON public.tasks
    FOR INSERT TO authenticated
    WITH CHECK ((public.get_current_profile()).role IN ('FACULTY', 'UNIVERSITY', 'STUDENT', 'ADMIN'));

CREATE POLICY "Tasks update policy" ON public.tasks
    FOR UPDATE TO authenticated
    USING (
        assigned_to = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR created_by = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR (public.get_current_profile()).role IN ('FACULTY', 'UNIVERSITY', 'ADMIN')
    );

CREATE POLICY "Milestones view policy" ON public.milestones
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Milestones manage policy" ON public.milestones
    FOR ALL TO authenticated
    USING ((public.get_current_profile()).role IN ('FACULTY', 'UNIVERSITY', 'ADMIN'));

-- ------------------------------------------------------------------------------
-- 9. MESSAGES (REALTIME PROJECT DISCUSSION)
-- ------------------------------------------------------------------------------
CREATE POLICY "Messages view policy" ON public.messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = messages.project_id
            AND pm.user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        )
        OR (public.get_current_profile()).role IN ('FACULTY', 'UNIVERSITY', 'ADMIN', 'GOVERNMENT')
    );

CREATE POLICY "Messages insert policy" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    );

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "User can view own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "User can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 11. TIMELINE, SOLUTIONS, IMPACT, AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE POLICY "Timeline viewable by all" ON public.challenge_timeline
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Solutions viewable by all" ON public.solutions
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Impact metrics viewable by all" ON public.impact_metrics
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Certificates viewable by all" ON public.certificates
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Audit logs viewable by admin and gov" ON public.audit_logs
    FOR SELECT TO authenticated
    USING ((public.get_current_profile()).role IN ('ADMIN', 'GOVERNMENT'));

CREATE POLICY "Audit logs insertable" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- STORAGE POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public Avatars Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated Users Upload Avatar" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public Challenge Media Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'challenge-media');

CREATE POLICY "Citizen Upload Challenge Media" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'challenge-media');

CREATE POLICY "Project Files Access" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'project-files');

CREATE POLICY "Project Members Upload Files" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "Public Certificates Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'certificates');


-- ==============================================================================
-- Jharkhand Innovation Hub - Analytics Views & Search RPC Migration
-- Migration: 20260911000003_analytics_views.sql
-- Description: Aggregates real PostgreSQL data for dashboards, district telemetry,
--              full-text search, and baseline Jharkhand university entities.
-- ==============================================================================

-- 1. RPC: State Command Center Analytics Aggregator
CREATE OR REPLACE FUNCTION public.get_state_analytics()
RETURNS JSONB AS $$
DECLARE
    total_challenges INT;
    validated_challenges INT;
    under_review_challenges INT;
    active_projects INT;
    deployed_solutions INT;
    total_universities INT;
    total_industry_partners INT;
    total_impacted_citizens BIGINT;
    result JSONB;
BEGIN
    SELECT COUNT(*) INTO total_challenges FROM public.challenges;
    
    SELECT COUNT(*) INTO validated_challenges 
    FROM public.challenges 
    WHERE status IN ('validated', 'university_matched', 'project_created', 'prototype', 'pilot', 'deployed', 'impact_measured');
    
    SELECT COUNT(*) INTO under_review_challenges 
    FROM public.challenges 
    WHERE status IN ('submitted', 'ai_analyzed', 'government_review');
    
    SELECT COUNT(*) INTO active_projects 
    FROM public.projects 
    WHERE status IN ('active', 'prototype', 'testing', 'pilot');
    
    SELECT COUNT(*) INTO deployed_solutions 
    FROM public.solutions 
    WHERE status IN ('deployed', 'verified', 'resolved');
    
    SELECT COUNT(*) INTO total_universities FROM public.universities;
    
    SELECT COUNT(*) INTO total_industry_partners 
    FROM public.profiles 
    WHERE role IN ('INDUSTRY', 'STARTUP');
    
    SELECT COALESCE(SUM(people_impacted), 0) INTO total_impacted_citizens 
    FROM public.impact_metrics 
    WHERE verification_status = 'verified';

    result := jsonb_build_object(
        'totalChallenges', total_challenges,
        'validatedChallenges', validated_challenges,
        'underReviewChallenges', under_review_challenges,
        'activeProjects', active_projects,
        'deployedSolutions', deployed_solutions,
        'universities', total_universities,
        'industryPartners', total_industry_partners,
        'impactedCitizens', total_impacted_citizens
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. RPC: District Telemetry Aggregator
CREATE OR REPLACE FUNCTION public.get_district_challenge_counts()
RETURNS TABLE (
    district_name TEXT,
    challenge_count BIGINT,
    project_count BIGINT,
    solution_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.district AS district_name,
        COUNT(DISTINCT c.id) AS challenge_count,
        COUNT(DISTINCT p.id) AS project_count,
        COUNT(DISTINCT s.id) AS solution_count
    FROM public.challenges c
    LEFT JOIN public.projects p ON p.district = c.district
    LEFT JOIN public.solutions s ON s.challenge_id = c.id
    GROUP BY c.district;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. RPC: Global Multi-Entity Search
CREATE OR REPLACE FUNCTION public.search_global(query_text TEXT)
RETURNS JSONB AS $$
DECLARE
    challenges_json JSONB;
    projects_json JSONB;
    universities_json JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO challenges_json FROM (
        SELECT id, title, district, category, status, priority
        FROM public.challenges
        WHERE title ILIKE '%' || query_text || '%'
           OR description ILIKE '%' || query_text || '%'
           OR district ILIKE '%' || query_text || '%'
        LIMIT 5
    ) t;

    SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) INTO projects_json FROM (
        SELECT id, title, project_code, status, progress, district
        FROM public.projects
        WHERE title ILIKE '%' || query_text || '%'
           OR description ILIKE '%' || query_text || '%'
        LIMIT 5
    ) p;

    SELECT COALESCE(jsonb_agg(u), '[]'::jsonb) INTO universities_json FROM (
        SELECT id, name, short_name, district, type
        FROM public.universities
        WHERE name ILIKE '%' || query_text || '%'
           OR short_name ILIKE '%' || query_text || '%'
           OR district ILIKE '%' || query_text || '%'
        LIMIT 5
    ) u;

    RETURN jsonb_build_object(
        'challenges', challenges_json,
        'projects', projects_json,
        'universities', universities_json
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. BASELINE SEED DATA FOR JHARKHAND UNIVERSITIES
INSERT INTO public.universities (id, name, short_name, district, type, departments, website, ranking, total_students)
VALUES 
    ('b1000000-0000-0000-0000-000000000001', 'Birsa Institute of Technology Sindri', 'BIT Sindri', 'Dhanbad', 'state', ARRAY['Computer Science', 'Environmental Engineering', 'Mechanical', 'Electrical', 'Mining'], 'https://www.bitsindri.ac.in', 1, 4500),
    ('b1000000-0000-0000-0000-000000000002', 'Indian Institute of Technology (ISM) Dhanbad', 'IIT ISM', 'Dhanbad', 'iit', ARRAY['Computer Science & Eng', 'Environmental Science', 'Electronics', 'Mining & Geo'], 'https://www.iitism.ac.in', 14, 8500),
    ('b1000000-0000-0000-0000-000000000003', 'National Institute of Technology Jamshedpur', 'NIT Jamshedpur', 'East Singhbhum', 'nit', ARRAY['Civil & Water Eng', 'Computer Applications', 'Metallurgy', 'Robotics'], 'https://www.nitjsr.ac.in', 75, 5200),
    ('b1000000-0000-0000-0000-000000000004', 'Birsa Agricultural University', 'BAU Ranchi', 'Ranchi', 'state', ARRAY['Agronomy', 'Horticulture', 'Soil Science & Water Mgmt', 'Veterinary Science'], 'https://www.bauranchi.org', 28, 2800),
    ('b1000000-0000-0000-0000-000000000005', 'Birla Institute of Technology Mesra', 'BIT Mesra', 'Ranchi', 'deemed', ARRAY['Remote Sensing', 'Bio-Technology', 'Computer Science', 'Urban Planning'], 'https://www.bitmesra.ac.in', 53, 6200),
    ('b1000000-0000-0000-0000-000000000006', 'Ranchi University', 'RU Ranchi', 'Ranchi', 'state', ARRAY['Physics & Materials', 'Sociology & Tribal Studies', 'Botany', 'Chemistry'], 'https://www.ranchiuniversity.ac.in', 110, 18000),
    ('b1000000-0000-0000-0000-000000000007', 'Sido Kanhu Murmu University', 'SKMU Dumka', 'Dumka', 'state', ARRAY['Rural Technology', 'Water Management', 'Botany', 'Tribal Studies'], 'https://www.skmu.ac.in', 145, 12000),
    ('b1000000-0000-0000-0000-000000000008', 'Kolhan University', 'KU Chaibasa', 'West Singhbhum', 'state', ARRAY['Environmental Studies', 'Forestry', 'Computer Science', 'Commerce'], 'https://www.kolhanuniversity.ac.in', 160, 14000)
ON CONFLICT (id) DO NOTHING;
