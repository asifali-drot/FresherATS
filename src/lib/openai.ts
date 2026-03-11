import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error(
    "Missing OPENROUTER_API_KEY environment variable. Set it in .env.local and restart the dev server."
  );
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateSuggestions(
  resumeText: string,
  missingKeywords: string[]
) {
  const prompt = `
You are an ATS resume expert helping a fresh graduate.

Analyze the resume and give simple, clear improvement advice.

Resume:
${resumeText.slice(0, 4000)}

Missing Keywords:
${missingKeywords.join(", ")}

Return JSON with:
- summary
- skills
- projects
- general
`;

  const response = await client.chat.completions.create({
    model: "openai/gpt-4o-mini", // cheap + good
    temperature: 0.4,
    messages: [
      { role: "system", content: "You are a resume and ATS expert." },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0].message.content;
}
