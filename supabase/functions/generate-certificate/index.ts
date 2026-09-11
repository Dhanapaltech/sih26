// Supabase Edge Function: generate-certificate
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { studentId, projectId, universityId, role, impactSummary } = await req.json();

    if (!studentId || !projectId || !universityId) {
      return new Response(
        JSON.stringify({ error: "studentId, projectId, and universityId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique verification code
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certCode = `JH-CERT-2026-${randomHex}`;
    const verificationUrl = `${supabaseUrl}/certificates/verify/${certCode}`;

    const { data: cert, error } = await supabase
      .from("certificates")
      .insert({
        certificate_code: certCode,
        student_id: studentId,
        project_id: projectId,
        university_id: universityId,
        role: role || "Student Lead Innovator",
        completion_date: new Date().toISOString().split("T")[0],
        impact_summary: impactSummary || "Successfully delivered societal pilot deployment in Jharkhand.",
        verification_url: verificationUrl,
        is_valid: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ certificate: cert, verificationUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate certificate" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
