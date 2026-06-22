export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper helper to run scans if JD is updated
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

// PATCH: Update a job application
export async function PATCH(
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

    const body = await req.json();
    
    // Fetch current job description to see if it changed
    const { data: currentJob, error: fetchError } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentJob) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }

    // Prepare fields to update
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    const allowedKeys = [
      "company_name",
      "job_title",
      "job_url",
      "jd_text",
      "salary",
      "location",
      "status",
      "excitement_rating",
      "applied_date",
      "notes",
      "match_score",
      "matched_keywords",
      "missing_keywords"
    ];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    // Auto trigger scan if JD is updated and is different
    if (body.jd_text !== undefined && body.jd_text !== currentJob.jd_text && body.jd_text.trim().length > 0) {
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
            const scanResult = await performAtsScan(latestResume, body.jd_text);
            updatePayload.match_score = scanResult.score || 0;
            updatePayload.matched_keywords = scanResult.matchedKeywords || [];
            updatePayload.missing_keywords = scanResult.missingKeywords || [];
          }
        }
      } catch (scanErr) {
        console.error("Auto scan on update failed:", scanErr);
      }
    }

    const { data, error } = await supabase
      .from("job_applications")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// DELETE: Delete a job application
export async function DELETE(
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

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
