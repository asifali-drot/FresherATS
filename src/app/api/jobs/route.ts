export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveTier } from "@/lib/adminUtils";

// Helper: Perform ATS scan using OpenRouter
async function performAtsScan(resumeText: string, jdText: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an ATS resume expert. Analyze the resume against the job description and respond with valid JSON only (no markdown code fence), in this exact shape:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence assessment>",
  "suggestions": ["<improvement 1>", "<improvement 2>", ...],
  "matchedKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...]
}`,
        },
        {
          role: "user",
          content: `Job Description:\n${jdText}\n\nResume:\n${resumeText.slice(0, 12000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("AI Error: Try again shortly.");
  }

  const result = await response.json();
  const rawContent = result?.choices?.[0]?.message?.content?.trim() || "";
  return JSON.parse(rawContent);
}

// GET: List all job applications
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("job_applications")
      .select("*, contacts:job_contacts(*), reminders:job_reminders(*)")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// POST: Create a new job application
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user tier
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .single();
    const tier = await getEffectiveTier(supabase, user.id);
    void sub; // sub no longer needed directly

    // Enforce Free plan: max 5 jobs
    if (tier === "free") {
      const { count } = await supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if ((count ?? 0) >= 5) {
        return NextResponse.json(
          { error: "Free plan limit reached: 5 job applications. Upgrade to Starter for unlimited tracking." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const {
      company_name,
      job_title,
      job_url,
      jd_text,
      salary,
      location,
      status,
      excitement_rating,
      applied_date,
      notes
    } = body;

    if (!company_name || !job_title) {
      return NextResponse.json({ error: "Company name and job title are required" }, { status: 400 });
    }

    let match_score = null;
    let matched_keywords = [];
    let missing_keywords = [];

    // Trigger auto-scan if JD is present — Starter+ only (Free plan has no keyword matching)
    if (jd_text && jd_text.trim().length > 0 && tier !== "free") {
      try {
        const { data: resumes } = await supabase
          .from("analyses")
          .select("resume_text, optimized_resume")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (resumes && resumes.length > 0) {
          const latestResume = resumes[0].optimized_resume || resumes[0].resume_text || "";
          if (latestResume) {
            const scanResult = await performAtsScan(latestResume, jd_text);
            match_score = scanResult.score || 0;
            matched_keywords = scanResult.matchedKeywords || [];
            missing_keywords = scanResult.missingKeywords || [];
          }
        }
      } catch (scanErr) {
        console.error("Auto scan failed:", scanErr);
        // We do not fail the whole request; just save without score and let user retry.
      }
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        company_name,
        job_title,
        job_url,
        jd_text,
        salary,
        location,
        status: status || 'saved',
        excitement_rating: excitement_rating || 3,
        match_score,
        matched_keywords,
        missing_keywords,
        applied_date,
        notes
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
