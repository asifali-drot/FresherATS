export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/resume/parsePdf";
import { parseDocx } from "@/lib/resume/parseDocx";
import { createClient } from "@/lib/supabase/server";
import { textToResumeDocument } from "@/lib/resume/resumeDocument";
import { getEffectiveTier, getModelForTier } from "@/lib/adminUtils";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Detect file type and extract text
    let resumeText = "";
    const isPdf = file.type === "application/pdf";
    const isDocx =
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (isPdf) {
      resumeText = await parsePdf(buffer);
    } else if (isDocx) {
      resumeText = await parseDocx(buffer);
    } else {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported." },
        { status: 400 }
      );
    }

    console.log("Extracted text length:", resumeText.length);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from resume. It may be a scanned (image-based) PDF, or the file may be corrupted.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return NextResponse.json(
        {
          error:
            "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to .env.local.",
        },
        { status: 500 }
      );
    }

    const authHeader = `Bearer ${apiKey}`;

    // --- Resolve model based on user tier ---
    const supabaseForTier = await createClient();
    const { data: tierAuthData } = await supabaseForTier.auth.getUser();
    let tier = "free";
    if (tierAuthData?.user) {
      tier = await getEffectiveTier(supabaseForTier, tierAuthData.user.id);
    }
    const model = getModelForTier(tier);
    console.log(`[AI] Using model: ${model} (tier: ${tier})`);

    // --- AI Stage 1: Resume Analysis ---
    console.log("Stage 1: Analyzing Resume...");

    const STAGE1_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume reviewer specializing in early-career and fresh graduate job seekers. Your job is to analyze a resume against a target job description and return specific, actionable feedback that helps the candidate pass automated screening and impress human recruiters.

Your task:
1. Score the resume's ATS compatibility (0-100) based on formatting, keyword alignment, and structure.
2. Identify specific keyword gaps between the resume and job description.
3. Flag formatting issues that could break ATS parsing (tables, columns, graphics, non-standard headers, unusual fonts represented in text).
4. Rewrite up to 5 weak bullet points into stronger, quantified, action-verb-led versions.
5. Give section-by-section feedback (Summary, Experience, Education, Skills, Projects).

Evaluation criteria:
- ATS parsing: standard section headers, no tables/columns, no images/icons for content, reverse-chronological order, standard date formats.
- Keyword match: hard skills, tools, and certifications from the job description that are missing or under-represented.
- Impact language: bullet points should lead with action verbs and include a quantifiable result where possible (%, $, time saved, scale).
- Early-career context: don't penalize short work history; instead check whether projects, coursework, and internships are leveraged effectively.

Constraints:
- Never invent experience, skills, or metrics the candidate didn't provide. If a bullet lacks a quantifiable result, suggest what kind of metric to add rather than fabricating a number.
- Be specific: point to the exact line or section, not generic advice like "add more keywords."
- Keep the tone direct and encouraging, not harsh — this audience is often applying for their first job.
- If no job description is provided, score against general ATS best practices only and note that keyword matching was skipped.

Return ONLY valid JSON matching this schema. Do not include any text, explanation, or markdown code fences before or after the JSON object.

{
  "ats_score": <0-100>,
  "score_breakdown": {
    "formatting": <0-25>,
    "keyword_match": <0-25>,
    "impact_language": <0-25>,
    "structure": <0-25>
  },
  "missing_keywords": ["keyword1", "keyword2"],
  "formatting_issues": [{"issue": "string", "location": "string", "fix": "string"}],
  "bullet_rewrites": [{"original": "string", "improved": "string", "section": "string"}],
  "section_feedback": {
    "summary": "string",
    "experience": "string",
    "education": "string",
    "skills": "string",
    "projects": "string"
  },
  "top_3_priorities": ["string", "string", "string"]
}`;

    const stage1Response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          // Enable Anthropic prompt caching via OpenRouter (no-op for OpenAI models)
          "anthropic-beta": "prompt-caching-2024-07-31",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: STAGE1_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: `Job Description:\n${jobDescription || "(Not provided — scoring against general ATS best practices only; keyword matching skipped.)"}\n\nResume:\n${resumeText.slice(0, 12000)}`,
            },
          ],
        }),
      }
    );

    if (!stage1Response.ok) {
      const errText = await stage1Response.text().catch(() => "");
      console.error("[Stage 1] AI Error:", stage1Response.status, errText);
      return NextResponse.json(
        { error: "AI Error: Try again shortly." },
        { status: 502 }
      );
    }

    const stage1Data = await stage1Response.json();
    const stage1Raw = stage1Data?.choices?.[0]?.message?.content?.trim() || "";

    type ScoreBreakdown = { formatting: number; keyword_match: number; impact_language: number; structure: number };
    type FormattingIssue = { issue: string; location: string; fix: string };
    type BulletRewrite = { original: string; improved: string; section: string };
    type SectionFeedback = { summary: string; experience: string; education: string; skills: string; projects: string };

    let analysis: {
      ats_score?: number;
      score_breakdown?: ScoreBreakdown;
      missing_keywords?: string[];
      formatting_issues?: FormattingIssue[];
      bullet_rewrites?: BulletRewrite[];
      section_feedback?: SectionFeedback;
      top_3_priorities?: string[];
      // legacy aliases kept for Supabase storage compatibility
      score?: number;
      summary?: string;
      suggestions?: string[];
      missingKeywords?: string[];
    } = {};

    try {
      let cleanedJson = stage1Raw.trim();
      cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleanedJson);
      analysis = {
        ats_score: parsed.ats_score ?? 0,
        score_breakdown: parsed.score_breakdown ?? { formatting: 0, keyword_match: 0, impact_language: 0, structure: 0 },
        missing_keywords: parsed.missing_keywords ?? [],
        formatting_issues: parsed.formatting_issues ?? [],
        bullet_rewrites: parsed.bullet_rewrites ?? [],
        section_feedback: parsed.section_feedback ?? {},
        top_3_priorities: parsed.top_3_priorities ?? [],
        // Legacy aliases for Supabase columns
        score: parsed.ats_score ?? 0,
        summary: parsed.section_feedback?.summary ?? "",
        suggestions: parsed.top_3_priorities ?? [],
        missingKeywords: parsed.missing_keywords ?? [],
      };
    } catch (e) {
      console.error("Failed to parse Stage 1 JSON. Raw response was:", stage1Raw);
      return NextResponse.json({ error: "Failed to parse resume analysis." }, { status: 500 });
    }

    // --- AI Stage 2: Content Optimization ---
    console.log("Stage 2: Optimizing Content...");
    const stage2Response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are a professional resume editor. Improve the following resume using the analysis results and job description.
Rules:
1. Rewrite weak bullet points using strong action verbs.
2. Include relevant keywords from the job description naturally.
3. Keep bullet points concise and impactful.
4. Do not invent experience or lie.
5. Use ATS-friendly language.
Output the optimized content text only, maintaining a logical structure.`
            },
            {
              role: "user",
              content: `Original Resume:\n${resumeText.slice(0, 8000)}\n\nJob Description:\n${jobDescription || "(Not provided)"}\n\nAnalysis Suggestions:\n${analysis.suggestions?.join("\n")}\n\nMissing Keywords:\n${analysis.missingKeywords?.join(", ")}`
            }
          ]
        })
      }
    );

    let optimizedText = resumeText;
    if (stage2Response.ok) {
      try {
        const stage2Data = await stage2Response.json();
        optimizedText = stage2Data?.choices?.[0]?.message?.content?.trim() || resumeText;
      } catch (e) {
        console.error("Failed to parse Stage 2 JSON:", e);
      }
    } else {
      console.error("Stage 2 AI Error:", stage2Response.statusText);
    }

    // --- AI Stage 3: Final Resume Generation ---
    console.log("Stage 3: Final Formatting...");
    const stage3Response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `Generate a final ATS-friendly resume using the optimized content provided.
Rules:
1. Use clear section headings in ALL CAPS.
2. Use bullet points for experience and projects.
3. Avoid tables, graphics, or complex formatting.
4. Keep formatting simple for ATS systems.
5. Structure:
SUMMARY
SKILLS (comma separated or simple list)
PROJECTS
EXPERIENCE
EDUCATION`
            },
            {
              role: "user",
              content: `Optimized Content:\n${optimizedText}`
            }
          ]
        })
      }
    );

    let finalOptimizedResume = optimizedText;
    if (stage3Response.ok) {
      try {
        const stage3Data = await stage3Response.json();
        finalOptimizedResume = stage3Data?.choices?.[0]?.message?.content?.trim() || optimizedText;
      } catch (e) {
        console.error("Failed to parse Stage 3 JSON:", e);
      }
    } else {
      console.error("Stage 3 AI Error:", stage3Response.statusText);
    }
    
    console.log("Final optimizedResume length:", finalOptimizedResume?.length || 0);
    
    // Rename variable to match downstream usage if needed, or update usage
    const suggestions = analysis;

    // --- Supabase Integration ---
    let analysisId: string | null = null;
    try {
      console.log("[DB] Starting Supabase integration...");
      const supabase = await createClient();

      console.log("[DB] Calling getUser()...");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log(`[DB] getUser result — user: ${authData?.user?.id ?? "null"} | authError: ${authError?.message ?? "none"}`);

      console.log("[DB] Inserting analysis...");
      
      // Merge missing keywords into suggestions for storage since column is missing
      const suggestionsToSave = [...(suggestions.suggestions ?? [])];
      if (suggestions.missingKeywords && suggestions.missingKeywords.length > 0) {
        suggestionsToSave.push(`Missing Keywords: ${suggestions.missingKeywords.join(", ")}`);
      }

      const resumeDocument = textToResumeDocument(finalOptimizedResume);

      const { data: insertedRow, error: dbError } = await supabase
        .from("analyses")
        .insert({
          user_id: authData?.user?.id ?? null, // Use null for guests
          resume_text: resumeText,
          job_description: jobDescription || null,
          score: suggestions.score ?? null,
          summary: suggestions.summary ?? null,
          suggestions: suggestionsToSave,
          optimized_resume: finalOptimizedResume,
          resume_document: resumeDocument,
        })
        .select("id")
        .single();

      if (dbError) {
        console.error(`[DB] Insert error — code: ${dbError.code} | message: ${dbError.message} | details: ${dbError.details} | hint: ${dbError.hint}`);
      } else {
        console.log(`[DB] Insert success — row id: ${insertedRow?.id}`);
        analysisId = insertedRow?.id ?? null;
      }
    } catch (dbCatchError: unknown) {
      const errorMessage = dbCatchError instanceof Error ? dbCatchError.message : String(dbCatchError);
      console.error("[DB] Unexpected Supabase error:", errorMessage);
    }
    // --- End Supabase Integration ---

    return NextResponse.json({
      success: true,
      result: stage1Raw,
      // ── New rich analysis fields ──────────────────────────────────────
      ats_score: suggestions.ats_score,
      score_breakdown: suggestions.score_breakdown,
      missing_keywords: suggestions.missing_keywords ?? [],
      formatting_issues: suggestions.formatting_issues ?? [],
      bullet_rewrites: suggestions.bullet_rewrites ?? [],
      section_feedback: suggestions.section_feedback,
      top_3_priorities: suggestions.top_3_priorities ?? [],
      // ── Legacy aliases (keep for backward-compat with existing frontend) ──
      score: suggestions.score,
      summary: suggestions.summary,
      suggestions: suggestions.suggestions ?? [],
      missingKeywords: suggestions.missingKeywords ?? [],
      // ── Optimized resume & metadata ───────────────────────────────────
      optimized_resume: finalOptimizedResume,
      analysis_id: analysisId,
      extractedLength: resumeText.length,
      resumeText,
    });
  } catch (error) {
    console.error("Analyze route error:", error);

    return NextResponse.json(
      { error: "Something went wrong while analyzing." },
      { status: 500 }
    );
  }
}
