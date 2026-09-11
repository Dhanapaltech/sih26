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
