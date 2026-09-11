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
