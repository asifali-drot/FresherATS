export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveTier } from "@/lib/adminUtils";
export interface LinkedInAnalysisResult {
  overallScore: number;
  keywordScore: number;
  summary: string;
  sections: {
    headline: { score: number; feedback: string };
    about: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    skills: { score: number; feedback: string };
    education: { score: number; feedback: string };
    certifications: { score: number; feedback: string };
  };
  keywordsPresent: string[];
  keywordsMissing: string[];
}


/* ─── Main Route Handler ──────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileText, jobDescription } = body as {
      profileText?: string;
      jobDescription?: string;
    };

    // --- Validate profile text ---
    if (!profileText || profileText.trim().length < 30) {
      return NextResponse.json(
        {
          error:
            "Please paste your LinkedIn profile text (at least 30 characters).",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // LinkedIn basic analysis is FREE for everyone — no login required, no limit.
    // Fetch tier only to pass to the client so it can gate the Optimizer sections.
    let tier = "free";
    if (user) {
      tier = await getEffectiveTier(supabase, user.id);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a professional LinkedIn profile optimizer and career coach. 
You will receive raw text copied from a LinkedIn profile page.
This text may contain sidebar content such as "People also viewed",
"Add profile section", navigation links, ads, and footer text.

IGNORE everything that is not part of the user's own profile.
Focus ONLY on: Headline, About, Experience, Skills, Education, Certifications.

Analyze the provided LinkedIn profile${jobDescription ? " against the target job description" : ""} and respond with ONLY valid JSON (no markdown, no code fences) in this exact shape:
{
  "overallScore": <number 0-100>,
  "keywordScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment of the LinkedIn profile>",
  "sections": {
    "headline": { "score": <0-100>, "feedback": "<specific, actionable feedback for the headline>" },
    "about": { "score": <0-100>, "feedback": "<specific, actionable feedback for the About/Summary section>" },
    "experience": { "score": <0-100>, "feedback": "<specific, actionable feedback for Experience entries>" },
    "skills": { "score": <0-100>, "feedback": "<specific, actionable feedback for Skills section>" },
    "education": { "score": <0-100>, "feedback": "<specific, actionable feedback for Education section>" },
    "certifications": { "score": <0-100>, "feedback": "<feedback on Certifications or recommendation to add them>" }
  },
  "keywordsPresent": ["<keyword already in profile>", ...],
  "keywordsMissing": ["<keyword missing from profile>", ...]
}

Scoring guide:
- overallScore: holistic profile strength (completeness, professional branding, impact)
- keywordScore: % of relevant keywords present (vs job description if provided, else vs industry norms)
- Provide 5-15 keywords for each of keywordsPresent and keywordsMissing
- Be specific and actionable in feedback (not generic advice)`;

    const userMessage = `LinkedIn Profile:
${profileText.slice(0, 10000)}

${
  jobDescription
    ? `Target Job Description:\n${jobDescription.slice(0, 4000)}`
    : "(No job description provided — analyze against general professional standards for the detected role/industry)"
}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI Error: Try again shortly." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "";

    let result: LinkedInAnalysisResult;
    try {
      result = JSON.parse(raw);
    } catch {
      console.error("Failed to parse LinkedIn analysis JSON:", raw);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Validate and clamp scores
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n ?? 0)));
    result.overallScore = clamp(result.overallScore);
    result.keywordScore = clamp(result.keywordScore);
    if (result.sections) {
      for (const key of Object.keys(result.sections) as (keyof typeof result.sections)[]) {
        result.sections[key].score = clamp(result.sections[key].score);
      }
    }

    // No usage tracking — LinkedIn analysis is free for everyone.
    // Return tier so the client can gate the paid Optimizer UI sections.
    return NextResponse.json({ success: true, result, tier });
  } catch (error) {
    console.error("LinkedIn analyze route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while analyzing your profile." },
      { status: 500 }
    );
  }
}
