export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/resume/parsePdf";
import { parseDocx } from "@/lib/resume/parseDocx";
import { createClient } from "@/lib/supabase/server";


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

    // --- AI Stage 1: Resume Analysis ---
    console.log("Stage 1: Analyzing Resume...");
    const stage1Response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
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
  "summary": "<2-3 sentence overall assessment>",
  "suggestions": ["<improvement 1>", "<improvement 2>", ...],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...]
}`,
            },
            {
              role: "user",
              content: `Job Description:\n${jobDescription || "(Not provided)"}\n\nResume:\n${resumeText.slice(0, 12000)}`,
            },
          ],
        }),
      }
    );

    if (!stage1Response.ok) {
      const errorData = await stage1Response.json();
      return NextResponse.json(
        { error: `Stage 1 AI Error: ${errorData?.error?.message || "Failed"}` },
        { status: 502 }
      );
    }

    const stage1Data = await stage1Response.json();
    const stage1Raw = stage1Data?.choices?.[0]?.message?.content?.trim() || "";
    
    let analysis: { 
      score?: number; 
      summary?: string; 
      suggestions?: string[]; 
      missingKeywords?: string[];
    } = {};

    try {
      const parsed = JSON.parse(stage1Raw);
      analysis = {
        score: parsed.score || 0,
        summary: parsed.summary || "",
        suggestions: parsed.suggestions || [],
        missingKeywords: parsed.missingKeywords || []
      };
    } catch (e) {
      console.error("Failed to parse Stage 1 JSON:", stage1Raw);
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
          model: "openai/gpt-4o-mini",
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
          model: "openai/gpt-4o-mini",
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
      score: suggestions.score,
      summary: suggestions.summary,
      suggestions: suggestions.suggestions ?? [],
      missingKeywords: suggestions.missingKeywords ?? [],
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
