export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to scan resume");
  }

  const result = await response.json();
  const rawContent = result?.choices?.[0]?.message?.content?.trim() || "";
  return JSON.parse(rawContent);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the job description
    const { data: job, error: jobError } = await supabase
      .from("job_applications")
      .select("jd_text")
      .eq("id", id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }

    if (!job.jd_text || job.jd_text.trim().length === 0) {
      return NextResponse.json({ error: "Job description is empty. Cannot scan." }, { status: 400 });
    }

    // Fetch the latest resume
    const { data: resumes, error: resumeError } = await supabase
      .from("analyses")
      .select("resume_text, optimized_resume")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (resumeError || !resumes || resumes.length === 0) {
      return NextResponse.json({ error: "No uploaded resume found. Please upload a resume first." }, { status: 400 });
    }

    const latestResume = resumes[0].optimized_resume || resumes[0].resume_text || "";
    if (!latestResume) {
      return NextResponse.json({ error: "Resume content is empty. Cannot scan." }, { status: 400 });
    }

    // Perform scan
    const scanResult = await performAtsScan(latestResume, job.jd_text);

    // Update job application record
    const { data: updatedJob, error: updateError } = await supabase
      .from("job_applications")
      .update({
        match_score: scanResult.score || 0,
        matched_keywords: scanResult.matchedKeywords || [],
        missing_keywords: scanResult.missingKeywords || [],
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      scanResult
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
