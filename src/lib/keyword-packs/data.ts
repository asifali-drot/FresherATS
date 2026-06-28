import { CompanyKeywordPack, PackSummary } from "./types";

export const ALL_PACKS: CompanyKeywordPack[] = [
  {
    id: "amazon-swe-new-grad",
    company: "Amazon",
    role: "Software Engineer",
    level: "New Grad",
    ats: "Workday", // Best guess based on typical enterprise ATS usage
    atsNotes: [
      "Amazon relies heavily on Workday for application tracking.",
      "Ensure standard section headers (Experience, Education, Skills) are clearly identifiable.",
      "Workday parses PDF effectively, but a simple formatting structure helps accurate data extraction.",
    ],
    hardSkills: [
      { label: "Java", aliases: ["java"], weight: 2 },
      { label: "C++", aliases: ["c++", "cpp"], weight: 2 },
      { label: "Python", aliases: ["python"], weight: 1 },
      { label: "Data Structures", aliases: ["data structures", "data structure"], weight: 3 },
      { label: "Algorithms", aliases: ["algorithms", "algorithm"], weight: 3 },
      { label: "Object-Oriented Design", aliases: ["object-oriented design", "ood", "oop", "object oriented programming"], weight: 2 },
      { label: "AWS", aliases: ["aws", "amazon web services", "ec2", "s3", "lambda"], weight: 2 },
      { label: "Distributed Systems", aliases: ["distributed systems", "distributed computing"], weight: 2 },
      { label: "Databases", aliases: ["databases", "sql", "nosql", "mysql", "postgresql", "dynamodb"], weight: 1 },
      { label: "Linux", aliases: ["linux", "unix"], weight: 1 },
      { label: "Git", aliases: ["git", "github", "version control"], weight: 1 },
      { label: "Testing", aliases: ["testing", "unit testing", "junit", "pytest", "test driven development", "tdd"], weight: 1 },
    ],
    niceToHave: [
      { label: "Machine Learning", aliases: ["machine learning", "ml", "artificial intelligence", "ai"], weight: 1 },
      { label: "React", aliases: ["react", "react.js", "reactjs"], weight: 1 },
      { label: "Node.js", aliases: ["node.js", "nodejs", "node"], weight: 1 },
      { label: "Docker", aliases: ["docker", "containers"], weight: 1 },
    ],
    valuesSignals: [
      {
        label: "Customer Obsession",
        description: "Start with the customer and work backwards.",
        cues: ["customer", "client", "user experience", "customer satisfaction", "end-user"],
      },
      {
        label: "Ownership",
        description: "Act on behalf of the entire company.",
        cues: ["led", "managed", "owned", "initiated", "took responsibility", "drove"],
      },
      {
        label: "Invent and Simplify",
        description: "Expect and require innovation and invention from your team and always find ways to simplify.",
        cues: ["invented", "simplified", "automated", "optimized", "streamlined", "innovation", "innovative"],
      },
      {
        label: "Deliver Results",
        description: "Focus on the key inputs for the business and deliver them with the right quality and in a timely fashion.",
        cues: ["delivered", "achieved", "increased", "decreased", "improved", "launched", "metrics", "kpi"],
      },
      {
        label: "Bias for Action",
        description: "Speed matters in business. Many decisions and actions are reversible and do not need extensive study.",
        cues: ["rapid", "accelerated", "fast-paced", "quick", "agile"],
      }
    ],
    actionVerbs: [
      "Architected", "Automated", "Built", "Created", "Designed", "Developed", 
      "Engineered", "Implemented", "Improved", "Launched", "Optimized", "Scaled"
    ],
    newGradEmphasis: [
      "Highlight complex academic projects with real-world applications.",
      "Emphasize algorithmic problem-solving and optimization in projects.",
      "Include metrics (e.g., 'improved performance by 20%') even for class projects if applicable.",
    ],
    redFlags: [
      "familiar with", "basic knowledge of", "learning", "helped", "assisted", "worked on"
    ],
    sampleRewrites: [
      {
        before: "Worked on a team project to build a web app using Java.",
        after: "Developed a distributed web application in Java, collaborating with a team of 4 to deliver the MVP ahead of schedule."
      },
      {
        before: "Helped improve the database queries.",
        after: "Optimized SQL database queries, reducing average response time by 30%."
      }
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "google-swe-new-grad",
    company: "Google",
    role: "Software Engineer",
    level: "New Grad",
    ats: "Greenhouse", // Best guess
    atsNotes: [
      "Greenhouse has excellent parsing capabilities.",
      "Focus heavily on clear, uncluttered formatting.",
      "Ensure links to GitHub or portfolios are clickable.",
    ],
    hardSkills: [
      { label: "C++", aliases: ["c++", "cpp"], weight: 2 },
      { label: "Java", aliases: ["java"], weight: 2 },
      { label: "Python", aliases: ["python"], weight: 2 },
      { label: "Go", aliases: ["go", "golang"], weight: 1 },
      { label: "Data Structures", aliases: ["data structures", "data structure", "trees", "graphs", "hash tables"], weight: 3 },
      { label: "Algorithms", aliases: ["algorithms", "algorithm", "sorting", "searching", "dynamic programming"], weight: 3 },
      { label: "System Design", aliases: ["system design", "scalable systems", "large-scale systems"], weight: 2 },
      { label: "Concurrency", aliases: ["concurrency", "multithreading", "parallel processing"], weight: 1 },
      { label: "Network Programming", aliases: ["tcp/ip", "networking", "http", "rpc"], weight: 1 },
    ],
    niceToHave: [
      { label: "Machine Learning", aliases: ["machine learning", "ml", "tensorflow", "pytorch"], weight: 1 },
      { label: "Cloud Platforms", aliases: ["gcp", "google cloud platform", "aws", "azure"], weight: 1 },
      { label: "Open Source", aliases: ["open source", "open-source", "contributed"], weight: 1 },
    ],
    valuesSignals: [
      {
        label: "Googleyness",
        description: "Thriving in ambiguity, valuing feedback, challenging the status quo.",
        cues: ["ambiguity", "collaborated", "mentored", "feedback", "innovative", "initiative"],
      },
      {
        label: "Impact",
        description: "Focus on making a significant difference.",
        cues: ["impact", "scaled", "millions", "significant", "transformed"],
      },
      {
        label: "Scale",
        description: "Designing for massive numbers of users.",
        cues: ["large-scale", "high-availability", "distributed", "throughput", "latency"],
      }
    ],
    actionVerbs: [
      "Authored", "Collaborated", "Conceptualized", "Contributed", "Deployed", "Engineered", 
      "Mentored", "Pioneered", "Redesigned", "Solved", "Spearheaded", "Transformed"
    ],
    newGradEmphasis: [
      "Deep technical understanding is crucial; list specific algorithms or complex structures used.",
      "Open source contributions are highly valued.",
      "Demonstrate ability to learn and adapt quickly to new technologies.",
    ],
    redFlags: [
      "expert in", "master of", "guru" // Too arrogant
    ],
    sampleRewrites: [
      {
        before: "Created a machine learning model for class.",
        after: "Engineered a predictive machine learning model using TensorFlow, achieving 92% accuracy on the test dataset."
      },
      {
        before: "Wrote code for a multithreaded server.",
        after: "Architected a high-throughput multithreaded server in C++, handling 10k+ concurrent connections with minimal latency."
      }
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "deloitte-ba-entry-level",
    company: "Deloitte",
    role: "Business Analyst",
    level: "Entry-level",
    ats: "SuccessFactors", // Best guess
    atsNotes: [
      "SuccessFactors requires standard, traditional resume formats.",
      "Avoid complex tables or graphics that might confuse the parser.",
      "Use clear, standard fonts and standard section headings.",
    ],
    hardSkills: [
      { label: "Data Analysis", aliases: ["data analysis", "data analytics", "analytical skills"], weight: 3 },
      { label: "Excel", aliases: ["excel", "vlookup", "pivot tables", "macros", "vba"], weight: 2 },
      { label: "SQL", aliases: ["sql", "mysql", "postgresql", "data extraction"], weight: 2 },
      { label: "Requirements Gathering", aliases: ["requirements gathering", "business requirements", "brd"], weight: 2 },
      { label: "Process Improvement", aliases: ["process improvement", "business process", "process mapping"], weight: 2 },
      { label: "Data Visualization", aliases: ["data visualization", "tableau", "power bi", "looker"], weight: 1 },
      { label: "Agile/Scrum", aliases: ["agile", "scrum", "sprints"], weight: 1 },
      { label: "Project Management", aliases: ["project management", "project coordination"], weight: 1 },
    ],
    niceToHave: [
      { label: "Python/R", aliases: ["python", "r", "pandas", "numpy"], weight: 1 },
      { label: "Financial Modeling", aliases: ["financial modeling", "financial analysis"], weight: 1 },
      { label: "Salesforce", aliases: ["salesforce", "crm"], weight: 1 },
    ],
    valuesSignals: [
      {
        label: "Client Impact",
        description: "Making an impact that matters for clients.",
        cues: ["client", "stakeholder", "delivered", "value", "consulted", "advised"],
      },
      {
        label: "Analytical Rigor",
        description: "Solving complex problems with data.",
        cues: ["analyzed", "identified", "modeled", "evaluated", "insights"],
      },
      {
        label: "Collaboration",
        description: "Working effectively in diverse teams.",
        cues: ["collaborated", "facilitated", "partnered", "cross-functional", "team"],
      },
      {
        label: "Communication",
        description: "Clear and concise communication of complex ideas.",
        cues: ["presented", "communicated", "reported", "documented", "articulated"],
      }
    ],
    actionVerbs: [
      "Analyzed", "Assessed", "Consulted", "Coordinated", "Evaluated", "Facilitated", 
      "Forecasted", "Identified", "Modeled", "Presented", "Recommended", "Streamlined"
    ],
    newGradEmphasis: [
      "Focus on leadership roles in clubs or organizations.",
      "Highlight case competitions or consulting-like projects.",
      "Showcase soft skills alongside hard analytical skills.",
    ],
    redFlags: [
      "did", "made", "looked into", "talked to" // Unprofessional language
    ],
    sampleRewrites: [
      {
        before: "Looked at sales data to find trends.",
        after: "Analyzed over 50,000 sales records using Excel and SQL to identify key seasonal trends, presenting findings to stakeholders."
      },
      {
        before: "Talked to different teams to figure out what they needed.",
        after: "Facilitated cross-functional requirements gathering sessions with 3 teams to document business needs and streamline workflows."
      }
    ],
    updatedAt: new Date().toISOString(),
  }
];

export function getPack(id: string): CompanyKeywordPack | undefined {
  return ALL_PACKS.find(pack => pack.id === id);
}

// Client-safe summary list (doesn't include the heavy keyword/regex data)
export const PACK_INDEX: PackSummary[] = ALL_PACKS.map(pack => ({
  id: pack.id,
  company: pack.company,
  role: pack.role,
  level: pack.level,
}));
