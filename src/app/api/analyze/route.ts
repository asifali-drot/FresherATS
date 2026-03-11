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
    let suggestions: { score?: number; summary?: string; suggestions?: string[]; optimizedResume?: string } =
      {};

    console.log("AI raw response (first 500 chars):", rawContent.substring(0, 500));

    if (rawContent) {
      try {
        const parsed = JSON.parse(rawContent) as typeof suggestions;
        if (typeof parsed.score === "number") suggestions.score = parsed.score;
        if (typeof parsed.summary === "string") suggestions.summary = parsed.summary;
        if (Array.isArray(parsed.suggestions)) suggestions.suggestions = parsed.suggestions;
        if (typeof parsed.optimizedResume === "string" && parsed.optimizedResume.trim().length > 0) {
          suggestions.optimizedResume = parsed.optimizedResume;
        }
      } catch {
        console.error("Failed to parse AI response as JSON:", rawContent);
        suggestions = { summary: rawContent };
      }
    }

    // Fallback: If no optimizedResume from AI, use original resume text
    const finalOptimizedResume = suggestions.optimizedResume || resumeText;
    console.log("Final optimizedResume length:", finalOptimizedResume?.length || 0);

    // --- Supabase Integration ---
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: dbError } = await supabase.from("analyses").insert({
          user_id: user.id,
          resume_text: resumeText,
          job_description: jobDescription || null,
          score: suggestions.score || null,
          summary: suggestions.summary || null,
          suggestions: suggestions.suggestions || [],
          optimized_resume: finalOptimizedResume,
        });

        if (dbError) {
          console.error("Supabase insert error:", dbError);
        } else {
          console.log("Analysis saved to Supabase for user:", user.id);
        }
      }
    } catch (dbCatchError) {
      console.error("Supabase integration error:", dbCatchError);
    }
    // --- End Supabase Integration ---

    return NextResponse.json({
      success: true,
      result: rawContent,
      score: suggestions.score,
      summary: suggestions.summary,
      suggestions: suggestions.suggestions ?? [],
      optimized_resume: finalOptimizedResume,
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
