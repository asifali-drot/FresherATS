export type ResumeTemplateId = "minimal" | "professional";

export type ResumeTemplate = {
  id: ResumeTemplateId;
  label: string;
  // Seed text that the editor + PDF renderer can parse immediately.
  seedResumeText: string;
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "minimal",
    label: "Minimal ATS Resume Template",
    seedResumeText: [
      "Your Full Name",
      "your.email@example.com",
      "+1 (555) 123-4567",
      "City, State | LinkedIn: linkedin.com/in/your-profile",
      "",
      "SUMMARY",
      "- Entry-level professional with strong communication and problem-solving skills.",
      "- Seeking a role where I can contribute quickly and learn on the job.",
      "",
      "SKILLS",
      "Communication, Teamwork, Problem Solving, React, JavaScript, TypeScript, SQL",
      "",
      "EXPERIENCE",
      "- Intern / Project Assistant — Built small tools and documented results using clear, ATS-friendly structure.",
      "- Collaborated with teammates to deliver features and maintain simple, measurable outcomes.",
      "",
      "EDUCATION",
      "- B.S. in Your Degree — University Name, City, State (Year - Year)",
    ].join("\n"),
  },
  {
    id: "professional",
    label: "Professional ATS Resume Template",
    seedResumeText: [
      "Your Full Name",
      "your.email@example.com",
      "+1 (555) 123-4567",
      "City, State | LinkedIn: linkedin.com/in/your-profile",
      "",
      "SUMMARY",
      "- Results-driven candidate with hands-on experience delivering projects end-to-end.",
      "- Strong foundation in software development, teamwork, and stakeholder communication.",
      "",
      "SKILLS",
      "Leadership, Communication, React, Node.js, TypeScript, JavaScript, SQL, REST APIs",
      "",
      "PROJECTS",
      "- Portfolio Builder — Designed and implemented an app with a clean UI and structured data.",
      "- ATS Resume Enhancer — Improved parsing and formatting for ATS-friendly resume output.",
      "",
      "EXPERIENCE",
      "- Software Development Intern — Built features, fixed bugs, and wrote concise documentation.",
      "- Partnered with teammates to translate requirements into working implementations and measurable outcomes.",
      "",
      "EDUCATION",
      "- B.S. in Your Degree — University Name, City, State (Year - Year)",
    ].join("\n"),
  },
];

export function getResumeTemplateById(id: string | null | undefined): ResumeTemplate {
  const found = RESUME_TEMPLATES.find((t) => t.id === id);
  return found ?? RESUME_TEMPLATES[0];
}

