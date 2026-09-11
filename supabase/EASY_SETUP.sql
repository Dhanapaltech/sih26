-- ==============================================================================
-- Jharkhand Innovation Hub - Complete One-Click Database Setup
-- File: supabase/EASY_SETUP.sql
-- ==============================================================================

-- 1. EXTENSIONS & SEQUENCES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SEQUENCE IF NOT EXISTS challenge_code_seq START 100;
CREATE SEQUENCE IF NOT EXISTS project_code_seq START 100;

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'GOVERNMENT', 'UNIVERSITY', 'FACULTY', 'STUDENT', 'INDUSTRY', 'STARTUP', 'ADMIN')),
    organization_id UUID,
    district TEXT DEFAULT 'Ranchi',
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    innovation_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed baseline profiles
INSERT INTO public.profiles (id, full_name, email, role, district)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Rahul Mahto', 'rahul.mahto@demo.jhinnovate.in', 'CITIZEN', 'Dumka'),
    ('00000000-0000-0000-0000-000000000002', 'Dr. Priya Singh', 'priya.singh@demo.jhinnovate.in', 'FACULTY', 'Ranchi'),
    ('00000000-0000-0000-0000-000000000003', 'Admin Officer', 'admin@jhinnovate.in', 'ADMIN', 'Ranchi')
ON CONFLICT (id) DO NOTHING;

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

-- Seed top Jharkhand universities
INSERT INTO public.universities (id, name, short_name, district, type, departments, website)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'Birla Institute of Technology, Mesra', 'BIT Mesra', 'Ranchi', 'deemed', ARRAY['Computer Science', 'Civil Engineering', 'Bio-Technology', 'Renewable Energy'], 'https://www.bitmesra.ac.in'),
    ('11111111-1111-1111-1111-111111111102', 'National Institute of Technology, Jamshedpur', 'NIT Jamshedpur', 'East Singhbhum', 'nit', ARRAY['Metallurgy', 'Mechanical', 'Electrical', 'Computer Engineering'], 'http://www.nitjsr.ac.in'),
    ('11111111-1111-1111-1111-111111111103', 'Indian Institute of Technology (ISM) Dhanbad', 'IIT (ISM) Dhanbad', 'Dhanbad', 'iit', ARRAY['Mining Engineering', 'Environmental Engineering', 'Data Science'], 'https://www.iitism.ac.in'),
    ('11111111-1111-1111-1111-111111111104', 'Birsa Agricultural University', 'BAU Ranchi', 'Ranchi', 'state', ARRAY['Agronomy', 'Horticulture', 'Soil Science', 'Agricultural Engineering'], 'https://www.bauranchi.org')
ON CONFLICT (id) DO NOTHING;

-- 4. CHALLENGES
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_code TEXT UNIQUE NOT NULL DEFAULT ('CHL-2026-' || LPAD(nextval('challenge_code_seq')::TEXT, 5, '0')),
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    urgency TEXT NOT NULL DEFAULT 'medium',
    current_situation TEXT,
    expected_improvement TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    priority TEXT DEFAULT 'medium',
    ai_score NUMERIC(3, 1),
    government_note TEXT,
    validated_at TIMESTAMPTZ,
    assigned_university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    assigned_department TEXT,
    project_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CHALLENGE_MEDIA
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

-- 6. CHALLENGE_AI_ANALYSIS
CREATE TABLE IF NOT EXISTS public.challenge_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL UNIQUE REFERENCES public.challenges(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subcategory TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    priority_score NUMERIC(3, 1) NOT NULL DEFAULT 7.5,
    severity TEXT DEFAULT 'moderate',
    summary TEXT,
    affected_population_estimate INTEGER,
    required_skills TEXT[] DEFAULT '{}',
    recommended_solution TEXT,
    solution_type TEXT,
    technology_suggestions TEXT[] DEFAULT '{}',
    risk_factors TEXT[] DEFAULT '{}',
    impact_potential TEXT DEFAULT 'high',
    confidence NUMERIC(4, 2) DEFAULT 0.95,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CHALLENGE_TIMELINE
CREATE TABLE IF NOT EXISTS public.challenge_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code TEXT UNIQUE NOT NULL DEFAULT ('PRJ-2026-' || LPAD(nextval('project_code_seq')::TEXT, 5, '0')),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    progress NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    health TEXT NOT NULL DEFAULT 'good',
    risk TEXT NOT NULL DEFAULT 'low',
    delay_probability NUMERIC(4, 2) DEFAULT 0.05,
    collaboration_score NUMERIC(4, 2) DEFAULT 9.0,
    impact_potential TEXT NOT NULL DEFAULT 'high',
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    budget JSONB DEFAULT '{estimated: 500000, allocated: 300000, spent: 120000, currency: INR}'::jsonb,
    location TEXT,
    district TEXT DEFAULT 'Ranchi',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. MILESTONES
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    target_progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. MESSAGES & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AUDIT LOGS & PARTNERSHIPS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    industry_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'proposed',
    support_type TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. IMPACT METRICS & SOLUTIONS
CREATE TABLE IF NOT EXISTS public.solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'prototype',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit TEXT,
    beneficiaries_count INTEGER DEFAULT 0,
    villages_count INTEGER DEFAULT 0,
    cost_savings_inr NUMERIC(15, 2) DEFAULT 0.00,
    jobs_created INTEGER DEFAULT 0,
    measured_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed SIH 2026 Impact Metrics
INSERT INTO public.impact_metrics (metric_name, metric_value, unit, beneficiaries_count, villages_count, cost_savings_inr, jobs_created)
VALUES 
    ('Citizens Impacted', 85000, 'persons', 85000, 342, 184000000.00, 1240),
    ('Clean Water Systems Deployed', 128, 'units', 32000, 114, 45000000.00, 320),
    ('Solar Micro-Grids Installed', 86, 'grids', 24500, 98, 72000000.00, 480)
ON CONFLICT DO NOTHING;

-- Seed Sample Demo Challenges
INSERT INTO public.challenges (id, challenge_code, citizen_id, title, description, category, subcategory, district, village, people_affected, urgency, status, priority, ai_score)
VALUES
    ('22222222-2222-2222-2222-222222222201', 'CHL-2026-00001', '00000000-0000-0000-0000-000000000001', 'High Fluoride and Iron Contamination in Deep Wells', 'Over 3,500 villagers across 4 tolas of Kathikund lack clean drinking water. Deep borewells have high fluoride content causing dental and skeletal fluorosis among children.', 'Water & Sanitation', 'Fluoride Contamination', 'Dumka', 'Kathikund', 3500, 'critical', 'validated', 'critical', 9.4),
    ('22222222-2222-2222-2222-222222222202', 'CHL-2026-00002', '00000000-0000-0000-0000-000000000001', 'Solar Cold Storage for Mahua and Forest Produce', 'Local tribal collectors lose 35-40% of forest produce like Mahua flowers and Kendu leaves during peak harvesting due to lack of decentralized cold storage.', 'Agriculture & Forest', 'Post-Harvest Cold Chain', 'Khunti', 'Torpa', 1800, 'high', 'project_created', 'high', 8.8),
    ('22222222-2222-2222-2222-222222222203', 'CHL-2026-00003', '00000000-0000-0000-0000-000000000001', 'Early Flash Flood Warning for Tribal Hamlets along Koel River', 'Unmonitored mountain stream runoff damages mud houses during monsoons. Need solar-powered IoT water level telemetry with vernacular sirens.', 'Disaster Management', 'Flash Flood Telemetry', 'West Singhbhum', 'Manoharpur', 2400, 'high', 'submitted', 'high', 9.1)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Demo Projects
INSERT INTO public.projects (id, project_code, challenge_id, university_id, faculty_id, created_by, title, description, status, progress, health, risk, district)
VALUES
    ('33333333-3333-3333-3333-333333333301', 'PRJ-2026-00001', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Low-Cost Nano-Adsorbent Fluoride Filtration Unit', 'Indigenous activated alumina and hydroxyapatite filtration column designed for tribal rural installations requiring zero electricity.', 'active', 65.0, 'good', 'low', 'Dumka')
ON CONFLICT (id) DO NOTHING;

-- 14. ROW LEVEL SECURITY (RLS) POLICIES - OPEN AND SECURE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for seamless demo and operational use
DO 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles', 'universities', 'challenges', 'challenge_media', 
        'challenge_ai_analysis', 'challenge_timeline', 'projects', 
        'tasks', 'milestones', 'messages', 'notifications', 
        'audit_logs', 'partnerships', 'solutions', 'impact_metrics'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS Public access on %I ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY Public access on %I ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END ;

-- 15. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('challenge-media', 'challenge-media', true),
    ('project-files', 'project-files', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 16. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
