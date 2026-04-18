export type ResumeTemplateId = "minimal" | "professional" | "program-manager";

export type ResumeTemplate = {
  id: ResumeTemplateId;
  slug: string;
  label: string;
  description: string;
  roleTips: string[];
  // Seed text that the editor + PDF renderer can parse immediately.
  seedResumeText: string;
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "minimal",
    slug: "minimal-ats-resume",
    label: "Minimal ATS Resume Template",
    description: "A clean, modern layout designed to pass through Applicant Tracking Systems (ATS) with ease. Perfect for entry-level roles or career changes where simplicity is key.",
    roleTips: [
      "Use clear headings for each section.",
      "List skills as clear bullet points.",
      "Keep bullet points concise and action-oriented."
    ],
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
      "• Communication",
      "• Teamwork",
      "• Problem Solving",
      "• React",
      "• JavaScript",
      "• TypeScript",
      "• SQL",
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
    slug: "professional-ats-resume",
    label: "Professional ATS Resume Template",
    description: "Our most popular template for mid-career professionals. Features a balanced layout that emphasizes both experience and technical expertise.",
    roleTips: [
      "Quantify your achievements with numbers and percentages.",
      "Include a strong summary that highlights your unique value proposition.",
      "List your technical skills as bullet points for better ATS readability."
    ],
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
      "• Leadership",
      "• Communication",
      "• React",
      "• Node.js",
      "• TypeScript",
      "• JavaScript",
      "• SQL",
      "• REST APIs",
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
  {
    id: "program-manager",
    slug: "program-manager-resume-sample",
    label: "Senior Program Manager Template",
    description: "Tailored specifically for senior leaders and program managers. Highlighting strategic impact, stakeholder management, and multi-million dollar project delivery.",
    roleTips: [
      "Emphasize cross-functional leadership and stakeholder management.",
      "Detail your experience with multi-million dollar budgets and complex timelines.",
      "Use clear bulleted lists for skills and certifications."
    ],
    seedResumeText: [
      "Alex Johnson, PMP",
      "alex.johnson@example.com",
      "+1 (555) 987-6543",
      "San Francisco, CA | LinkedIn: linkedin.com/in/alex-johnson-pmp",
      "",
      "SUMMARY",
      "- Strategic Program Manager with 8+ years of experience leading complex, cross-functional initiatives in high-growth technology environments.",
      "- Proven track record of delivering multi-million dollar projects on time and under budget while improving operational efficiency by 25%.",
      "- Expert in Agile methodologies, stakeholder communication, and risk mitigation strategies.",
      "",
      "SKILLS",
      "• Program Management",
      "• Agile/Scrum",
      "• Stakeholder Management",
      "• Strategic Planning",
      "• Risk Management",
      "• Budgeting & Forecasting",
      "• Cross-functional Leadership",
      "• Jira",
      "• Asana",
      "• Tableau",
      "",
      "EXPERIENCE",
      "**Senior Program Manager | Tech Solutions Inc.**",
      "- Led a portfolio of 5 concurrent product launches, coordinating between Engineering, Marketing, and Sales to ensure seamless market entry and 100% on-time delivery.",
      "- Orchestrated quarterly planning sessions (PI Planning) for 120+ headcount organization, aligning technical roadmaps with business objectives.",
      "- Reduced project delivery cycle time by 20% through the implementation of standardized Agile workflows and automated reporting dashboards.",
      "",
      "**Program Manager | Innovate Ltd.**",
      "- Managed the end-to-end migration of legacy on-premise infrastructure to AWS, resulting in a 30% reduction in annual hosting costs ($1.2M savings).",
      "- Established a regular risk assessment framework that identified and mitigated 15+ high-impact blockers before they affected critical path milestones.",
      "- Cultivated strong relationships with C-suite stakeholders, providing transparent progress reports and data-driven recommendations.",
      "",
      "**Project Lead | Startup Hub**",
      "- Directed development cycles for early-stage SaaS products, facilitating rapid iteration and achieving a 40% reduction in time-to-market for MVP features.",
      "- Scaled the project management office (PMO) from 1 to 5 members while maintaining rigorous quality standards.",
      "",
      "EDUCATION",
      "- **M.S. in Management** — Stanford University, Stanford, CA",
      "- **B.S. in Computer Science** — Georgia Institute of Technology, Atlanta, GA",
      "- **Certifications**: PMP (Project Management Professional), Certified Scrum Master (CSM)",
    ].join("\n"),
  },
];

export function getResumeTemplateById(id: string | null | undefined): ResumeTemplate {
  const found = RESUME_TEMPLATES.find((t) => t.id === id);
  return found ?? RESUME_TEMPLATES[0];
}

export function getResumeTemplateBySlug(slug: string | null | undefined): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find((t) => t.slug === slug);
}

