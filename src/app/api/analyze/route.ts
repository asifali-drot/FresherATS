export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/resume/parsePdf";
import { parseDocx } from "@/lib/resume/parseDocx";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

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
    const headersObj = {
      Authorization: authHeader,
      "Content-Type": "application/json",
    };

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: headersObj,
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
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "optimizedResume": "<the full optimized resume text incorporating the suggestions>"
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

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      const message =
        data?.error?.message || data?.error?.code || "OpenRouter request failed";
      return NextResponse.json(
        { error: `AI service error: ${message}` },
        { status: aiResponse.status >= 500 ? 502 : 400 }
      );
    }

    const rawContent = data?.choices?.[0]?.message?.content?.trim() || "";
    let suggestions: { 
      score?: number; 
      summary?: string; 
      suggestions?: string[]; 
      missingKeywords?: string[];
      optimizedResume?: string 
    } = {};

    console.log("AI raw response (first 500 chars):", rawContent.substring(0, 500));

    if (rawContent) {
      try {
        const parsed = JSON.parse(rawContent);
        suggestions.score = typeof parsed.score === "number" ? parsed.score : (typeof parsed.ATSScore === "number" ? parsed.ATSScore : undefined);
        suggestions.summary = parsed.summary || parsed.assessment || "";
        suggestions.suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : (Array.isArray(parsed.improvements) ? parsed.improvements : []);
        suggestions.missingKeywords = Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : (Array.isArray(parsed.keywords) ? parsed.keywords : []);
        suggestions.optimizedResume = parsed.optimizedResume || parsed.optimized_resume || "";
      } catch {
        console.error("Failed to parse AI response as JSON:", rawContent);
        suggestions = { summary: rawContent };
      }
    }

    // Fallback: If no optimizedResume from AI, use original resume text
    const finalOptimizedResume = suggestions.optimizedResume || resumeText;
    console.log("Final optimizedResume length:", finalOptimizedResume?.length || 0);

    // --- Supabase Integration ---
    let analysisId: string | null = null;
    try {
      const logFile = path.join(process.cwd(), "debug_db.log");
      const log = (msg: string) => {
        const entry = `[${new Date().toISOString()}] ${msg}\n`;
        fs.appendFileSync(logFile, entry);
        console.log(msg);
      };

      log("[DB] Starting Supabase integration...");
      const supabase = await createClient();

      log("[DB] Calling getUser()...");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      log(`[DB] getUser result — user: ${authData?.user?.id ?? "null"} | authError: ${authError?.message ?? "none"}`);

      log("[DB] Inserting analysis...");
      
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
        log(`[DB] Insert error — code: ${dbError.code} | message: ${dbError.message} | details: ${dbError.details} | hint: ${dbError.hint}`);
      } else {
        log(`[DB] Insert success — row id: ${insertedRow?.id}`);
      analysisId = insertedRow?.id ?? null;
      }
    } catch (dbCatchError: unknown) {
      const logFile = path.join(process.cwd(), "debug_db.log");
      const errorMessage = dbCatchError instanceof Error ? dbCatchError.message : String(dbCatchError);
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] [DB] Unexpected Supabase error: ${errorMessage}\n`);
      console.error("[DB] Unexpected Supabase error:", dbCatchError);
    }
    // --- End Supabase Integration ---

    return NextResponse.json({
      success: true,
      result: rawContent,
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
