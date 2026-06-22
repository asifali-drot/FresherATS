import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const {
      jobTitle,
      jobDescription,
      resumeText,
      userName,
      userContact,
      recipientName,
      companyName,
      companyAddress,
      tone,
    } = body;

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to generate a cover letter." }, { status: 401 });
    }

    const { data: sub } = await supabase.from("user_subscriptions").select("tier").eq("user_id", user.id).single();
    const tier = sub?.tier || "free";

    if (tier === "free") {
      return NextResponse.json({ error: "AI Cover Letter generation is a Premium feature. Please upgrade to Starter." }, { status: 403 });
    }

    const { data: usage } = await supabase.from("usage_tracking").select("cover_letters").eq("user_id", user.id).single();
    
    if (tier === "starter" && usage && usage.cover_letters >= 10) {
      return NextResponse.json({ error: "Starter limit reached: 10 cover letters per month. Please upgrade to Pro." }, { status: 403 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return NextResponse.json(
        {
          error:
            "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const authHeader = `Bearer ${apiKey}`;

    const systemPrompt = `You are an expert career consultant and professional resume/cover letter writer. 
Your task is to write a highly polished, ATS-friendly cover letter matching the user's qualifications to the target job description.

Structure the text output EXACTLY into the following blocks, with each block separated by EXACTLY a blank line (two newlines \\n\\n):

Block 1: SENDER CONTACT DETAILS
[Sender Full Name]
[Sender Contact Info - Email | Phone | Location]
[Sender Links - LinkedIn / Portfolio]

Block 2: DATE
[Current Date, e.g. June 11, 2026]

Block 3: RECIPIENT INFORMATION
[Recipient Name or Title]
[Department or Team | Company Name]
[Company Office Address]

Block 4: SALUTATION
[e.g., Dear Hiring Manager, or Dear Recruiting Team,]

Block 5 to N-2: BODY PARAGRAPHS
[Paragraph 1: Introduction. State the role, express interest, and summarize your alignment.]
[Paragraph 2: Academic/experience highlights. Align closely with job requirements and resume text.]
[Paragraph 3: Key accomplishments. Highlight projects or quantifiable results from resume text.]
[Paragraph 4: Call to action. Reiterate interest and outline next steps/readiness to meet.]

Block N-1: SIGN-OFF
[Sincerely, or Best regards, or Warmest regards,]

Block N: SENDER NAME
[Sender Full Name]

RULES:
1. Output ONLY the raw cover letter text following this block structure.
2. Do NOT wrap the letter in markdown code fences (\`\`\`), markdown styling, HTML tags, or JSON.
3. Do NOT include any introductory comments, preambles, notes, or post-letter explanations.
4. Adapt the writing style, vocabulary, and length to the chosen tone: "${tone || 'professional'}".
5. Use the user's provided Name ("${userName || ''}") and Contact ("${userContact || ''}") if available, otherwise use placeholders that the user can edit later.
6. Use the provided Recipient Details ("${recipientName || 'Hiring Manager'}", "${companyName || 'Target Company'}", "${companyAddress || ''}") if available.
7. Base the experience and skills highlighted in paragraphs 2 and 3 on the provided Resume Text. Do not invent details that are inconsistent with the resume, but expand on skills and make them compelling.`;

    const userPrompt = `Job Title: ${jobTitle || "(Not provided)"}
Job Description:
${jobDescription || "(Not provided)"}

Sender Name: ${userName || "Applicant"}
Sender Contact/Details: ${userContact || ""}
Recipient Name/Title: ${recipientName || "Hiring Manager"}
Company Name: ${companyName || ""}
Company Address: ${companyAddress || ""}
Tone: ${tone || "professional"}

Resume Text:
${resumeText || "(No resume text provided. Use general details for a student/entry-level candidate in this domain.)"}`;

    console.log("[AI Cover Letter] Generating letter text using OpenRouter...");
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error("[AI Cover Letter] Error:", errorData);
      return NextResponse.json(
        { error: `AI Generation Error: ${errorData?.error?.message || "Failed"}` },
        { status: 502 }
      );
    }

    const data = await aiResponse.json();
    const coverLetterText = data?.choices?.[0]?.message?.content?.trim() || "";

    console.log("[AI Cover Letter] Successfully generated cover letter. Length:", coverLetterText.length);

    if (user && usage) {
      await supabase
        .from("usage_tracking")
        .update({ cover_letters: usage.cover_letters + 1 })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      coverLetterText,
    });
  } catch (error) {
    console.error("[AI Cover Letter] Internal error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating cover letter." },
      { status: 500 }
    );
  }
}
