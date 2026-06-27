import type { Metadata } from "next";
import FAQSection from "@/components/FAQSection";
import HomeMarketing from "@/components/home/HomeMarketing";
import LatestReviews from "@/components/reviews/LatestReviews";
import ResumeUpload from "@/components/ResumeUpload";
import { generateFAQSchema, generateOrganizationSchema, generateSoftwareApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "FresherATS | Master Your Resume",
  },
  description:
    "Advanced ATS resume analyzer for fresh graduates. Optimize your career path with AI-driven insights. Get your ATS score and keywords analysis for free.",
  openGraph: {
    title: "FresherATS | Master Your Resume",
    description:
      "Advanced ATS resume analyzer for fresh graduates. Optimize your career path with AI-driven insights.",
    url: "https://fresherats.com",
    images: [
      {
        url: "/og-image.png",
        width: 1995,
        height: 528,
        alt: "FresherATS - Master Your Resume",
      },
    ],
  },
};

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Single unified hero + tool section — one seamless background */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-12 pb-24">
        <HeroGlow />

        {/* Hero copy */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-9">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-20"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
            </span>
            AI-Powered Insights
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Fix Your Resume Before <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-500 to-purple-600 bg-size-[200%_auto] animate-gradient">
              ATS Rejects It
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
            Empowering recent graduates to land their dream jobs. Analyze resume
            with our free ATS resume checker, uncover missing keywords, and
            transform your career path in seconds.
          </p>

          <div className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20 opacity-70 w-full max-w-3xl">
            <StatItem value="98%" label="Accuracy" />
            <StatItem value="10s" label="Analysis Time" />
            <StatItem
              value="1k+"
              label="Resumes Fixed"
              className="col-span-2 md:col-span-1"
            />
          </div>
        </div>

        {/* Upload card — flows directly below hero, no section break */}
        <div
          id="analyze"
          className="scroll-mt-24 relative z-10 w-full max-w-2xl mx-auto mt-16 px-4 sm:px-6"
        >
          {/* <AnalyzeHeader /> */}
          <ResumeUpload />
        </div>
      </section>

      <HomeMarketing />

      <div className="relative border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <LatestReviews />
      </div>

      <section className="px-6 pb-24">
        <FAQSection
          faqs={HOME_FAQS}
          title="Got Questions? We Have Answers"
          description="Everything you need to know about our ATS analyzer and how it helps you land your dream job."
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(HOME_FAQS)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSoftwareApplicationSchema({
              name: "FresherATS Free ATS Resume Checker",
              url: "https://fresherats.com",
              description: "Advanced ATS resume analyzer for fresh graduates.",
              applicationCategory: "BusinessApplication"
            })),
          }}
        />
      </section>
    </main>
  );
}

function HeroGlow() {
  return (
    <>
      {/* Large central glow covers the full hero + card area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-175 h-175 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[160px] -z-10 pointer-events-none" />
      {/* Subtle pink accent offset to the right */}
      <div className="absolute top-[60%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
    </>
  );
}

function StatItem({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center space-y-2.5 ${className}`}>
      <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}

const HOME_FAQS = [
  {
    question: "What is an ATS resume?",
    answer:
      "An ATS resume is a resume designed to be easily read and parsed by Applicant Tracking Systems (ATS). It typically uses standard fonts, clear headings, and keywords relevant to the job description.",
  },
  {
    question: "What is an ATS resume checker?",
    answer:
      "An ATS resume checker is a tool or software that analyzes your resume for ATS compatibility, identifies formatting and keyword issues, and helps improve your chances of passing applicant tracking systems and getting shortlisted by recruiters.",
  },
  {
    question: "How does the ATS score work?",
    answer:
      "The ATS score is calculated by comparing your resume's content against the job description. It looks for matching keywords, skills, and experience to determine how well you fit the role.",
  },
  {
    question: "How do I check resume for ATS?",
    answer:
      "You can check your resume for ATS compatibility by uploading it to FresherATS's free resume checker. The tool will analyze your resume and provide you with an ATS score along with feedback on how to improve it.",
  },
  {
    question: "Is my resume stored?",
    answer:
      "Yes. Your resume is securely stored so you can access, review, and manage your resume history from your dashboard whenever neededs. ",
  },
  {
    question: "Can I download the optimized resume?",
    answer:
      "Yes! After optimizing your resume using our editor, you can download it as a PDF that is fully ATS-friendly.",
  },
  {
    question: "Is this tool free?",
    answer:
      "Yes, our basic ATS analysis and editor are free to use for all job seekers.",
  },
];
