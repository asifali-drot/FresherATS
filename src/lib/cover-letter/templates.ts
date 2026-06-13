export type CoverLetterTemplateId = "professional" | "minimalist" | "creative" | "modern-avatar";

export type CoverLetterTemplate = {
  id: CoverLetterTemplateId;
  label: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  bodyPadding: string;
  seedText: string;
};

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "professional",
    label: "Professional Business Template",
    description: "Classic, formal corporate styling. Navy accents, center-aligned traditional header, and clear business boundaries. Best for corporate, finance, and traditional engineering roles.",
    primaryColor: "#1e3a8a", // Navy Blue
    accentColor: "#3b82f6", // Blue
    fontFamily: "Times-Roman", // Serif feel
    fontSize: "10.5pt",
    bodyPadding: "40px 50px",
    seedText: [
      "Alex Rivera",
      "alex.rivera@email.com | +1 (555) 019-2834 | New York, NY",
      "linkedin.com/in/alex-rivera | github.com/alexrivera",
      "",
      "June 11, 2026",
      "",
      "Hiring Manager",
      "Software Engineering Team | InnovateTech Inc.",
      "100 Enterprise Way, Suite 400, New York, NY 10001",
      "",
      "Dear Hiring Manager,",
      "",
      "I am writing to express my enthusiastic interest in the Software Engineer position at InnovateTech Inc. As a recent Computer Science graduate with hands-on experience building full-stack web applications and optimizing system performance, I am eager to contribute to your engineering team's success.",
      "",
      "During my internship at TechSolutions, I collaborated on migrating a legacy dashboard to React and TypeScript, which reduced page load times by 35% and significantly improved user retention. This experience strengthened my skills in writing clean, ATS-compliant code, designing RESTful APIs, and working within an Agile team structure. I pride myself on my problem-solving capabilities and my dedication to engineering excellence.",
      "",
      "I am particularly drawn to InnovateTech's focus on scalability and user-centric software. I look forward to the opportunity to discuss how my background, technical skills, and drive can help your team achieve its goals.",
      "",
      "Thank you for your time and consideration.",
      "",
      "Sincerely,",
      "",
      "Alex Rivera"
    ].join("\n")
  },
  {
    id: "minimalist",
    label: "Minimalist Modern Template",
    description: "A clean, contemporary look with generous margins, a subtle left-aligned header, and clean slate typography. Perfect for tech startups and modern digital agencies.",
    primaryColor: "#18181b", // Charcoal/Black
    accentColor: "#71717a", // Zinc Gray
    fontFamily: "Helvetica",
    fontSize: "10pt",
    bodyPadding: "45px 55px",
    seedText: [
      "Jordan Taylor",
      "jordan.taylor@email.com | +1 (555) 012-3456 | Austin, TX",
      "linkedin.com/in/jordantaylor",
      "",
      "June 11, 2026",
      "",
      "Recruiting Lead",
      "Product & Design Department | PixelFlow Agency",
      "505 Congress Ave, Austin, TX 78701",
      "",
      "Dear Recruiting Team,",
      "",
      "I am thrilled to apply for the Associate Product Designer position at PixelFlow Agency. With a solid foundation in user-centric design principles, wireframing, and interactive prototyping, I am excited about the prospect of bringing my design thinking to your creative projects.",
      "",
      "In my final year capstone project, I led the UI/UX design for a mobile health application. Through user interviews and usability testing, I iterated on the dashboard layout, which ultimately improved task completion rates by 40%. I am highly proficiency in Figma, design systems, and converting complex user requirements into elegant, intuitive interfaces.",
      "",
      "I admire PixelFlow's commitment to creating impactful digital experiences. I would welcome the opportunity to discuss how my skills and perspective match the needs of your design team.",
      "",
      "Best regards,",
      "",
      "Jordan Taylor"
    ].join("\n")
  },
  {
    id: "creative",
    label: "Creative / Executive Accent Template",
    description: "A stylish layout featuring a bold teal left accent sidebar line, modern headers, and structured spacing. Best for marketing, design, frontend developer, or creative lead roles.",
    primaryColor: "#0d9488", // Teal
    accentColor: "#0f766e", // Dark Teal
    fontFamily: "Helvetica",
    fontSize: "10.5pt",
    bodyPadding: "40px 45px",
    seedText: [
      "Sam Wilson",
      "sam.wilson@email.com | +1 (555) 987-6543 | San Francisco, CA",
      "portfolio.com/samwilson | github.com/samwilson",
      "",
      "June 11, 2026",
      "",
      "Director of Marketing",
      "Growth & Strategy Division | BrightMedia Group",
      "220 Sansome St, San Francisco, CA 94104",
      "",
      "Dear Sam Wilson and the BrightMedia Team,",
      "",
      "As a creative problem solver with a passion for storytelling and digital engagement, I was excited to see the opening for a Marketing Coordinator at BrightMedia Group. My background in content strategy and performance analytics makes me a strong fit for your team.",
      "",
      "Over the past year, I managed social media campaigns for a local startup, increasing their organic reach by 120% and driving a 25% growth in referral sales. I designed visual assets, wrote engaging copy, and monitored KPI metrics to continually optimize performance. I thrive in collaborative environments and enjoy translating business goals into creative campaigns.",
      "",
      "BrightMedia's innovative campaigns have set industry standards, and I would love to contribute my energy and skills to your upcoming launches. Thank you for considering my application.",
      "",
      "Warmest regards,",
      "",
      "Sam Wilson"
    ].join("\n")
  },
  {
    id: "modern-avatar",
    label: "Modern Avatar Executive",
    description: "Sleek contemporary look featuring a profile picture placeholder on the top right side alongside sender details on the left. Highly customized for senior positions, sales, and executive roles.",
    primaryColor: "#4f46e5", // Indigo
    accentColor: "#6366f1", // Indigo Accent
    fontFamily: "Helvetica",
    fontSize: "10.5pt",
    bodyPadding: "40px 50px",
    seedText: [
      "Taylor Vance",
      "taylor.vance@email.com | +1 (555) 321-7654 | Boston, MA",
      "linkedin.com/in/taylorvance | github.com/taylorvance",
      "",
      "June 11, 2026",
      "",
      "Director of Operations",
      "Human Resources Department | GlobalCorp Logistics",
      "75 State St, Boston, MA 02109",
      "",
      "Dear Recruiting Team,",
      "",
      "I am writing to express my enthusiastic interest in the Operations Manager position at GlobalCorp Logistics. With over four years of experience leading cross-functional teams, streamlining logistics workflows, and implementing data-driven efficiency metrics, I am confident in my ability to add significant value to your team.",
      "",
      "In my previous role as Operations Lead at Apex Transport, I managed a team of 15 logistics coordinators and spearheaded a warehouse management software overhaul. This initiative reduced processing delays by 22% and saved the company over $150,000 annually. I specialize in identifying operational bottlenecks and deploying scalable systems that align teams with strategic corporate targets.",
      "",
      "GlobalCorp Logistics' reputation for innovation and reliable delivery service is exceptional. I would welcome the opportunity to discuss how my operational leadership and technical expertise can contribute to your continued growth.",
      "",
      "Thank you for your time and consideration.",
      "",
      "Best regards,",
      "",
      "Taylor Vance"
    ].join("\n")
  }
];

export function getCoverLetterTemplateById(id: string | null | undefined): CoverLetterTemplate {
  const found = COVER_LETTER_TEMPLATES.find((t) => t.id === id);
  return found ?? COVER_LETTER_TEMPLATES[0];
}

