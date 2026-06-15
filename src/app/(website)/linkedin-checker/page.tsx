import type { Metadata } from "next";
import FAQSection, { type FAQItem } from "@/components/FAQSection";
import LinkedInChecker from "@/components/LinkedInChecker";
import { generateFAQSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "LinkedIn Profile Checker | FresherATS",
  description:
    "Analyze your LinkedIn profile with AI. Get an overall score, keyword gap analysis, and section-by-section feedback to optimize your profile for recruiters and ATS systems.",
  openGraph: {
    title: "LinkedIn Profile Checker | FresherATS",
    description:
      "AI-powered LinkedIn profile analyzer. Score your profile, find missing keywords, and get actionable feedback for every section.",
    url: "https://fresherats.com/linkedin-checker",
    images: [
      {
        url: "/og-image.png",
        width: 1995,
        height: 528,
        alt: "FresherATS LinkedIn Profile Checker",
      },
    ],
  },
};

const LINKEDIN_FAQS: FAQItem[] = [
  {
    question: "Why is copy-pasting my LinkedIn profile better than using a profile URL?",
    answer:
      "Copy-pasting your LinkedIn profile text ensures every section is captured accurately. URL fetch tools can miss hidden sections, fail on private or restricted profiles, and often return incomplete content due to LinkedIn layout changes or login requirements.",
  },
  {
    question: "What should I include when pasting LinkedIn profile text?",
    answer:
      "Paste your full headline, About section, experience bullets, skills, education, and certifications. The more complete the text, the better our AI can score your profile and identify gaps in keywords, clarity, and impact.",
  },
  {
    question: "Can I analyze a LinkedIn profile even if I am not logged in?",
    answer:
      "Yes. You do not need to log in here. Simply copy your profile text from LinkedIn and paste it into the checker to receive instant feedback without any browser or account restrictions.",
  },
  {
    question: "How does the keyword gap analysis work?",
    answer:
      "Our AI compares your profile text against proven recruiter language and job-market keywords. It highlights missing terms and wording improvements so your profile better matches the roles you want.",
  },
  {
    question: "Is my LinkedIn profile text kept private?",
    answer:
      "Yes. All profile text is analyzed in real time and not stored permanently. We only use what you paste to generate your score and feedback, so your content remains private and secure.",
  },
];

export default function LinkedInCheckerPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-12 pb-16">
        {/* Background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[400px] bg-[#0077B5]/8 rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-100 rounded-full blur-[100px] -z-10 pointer-events-none opacity-50" />

        {/* Hero copy */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-6 mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0077B5]/25 bg-[#0077B5]/8 text-[#004B77] text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0077B5] opacity-30" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0077B5]" />
            </span>
            AI-Powered · Free · No Sign-up Required
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900">
            LinkedIn Profile{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077B5] via-purple-500 to-[#0077B5] bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
              Checker
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-zinc-600 leading-relaxed font-medium">
            Get an AI-powered score, section-by-section breakdown, and keyword gap analysis for your LinkedIn profile — so recruiters find you first.
          </p>

          <div className="mt-4 rounded-3xl border border-[#0077B5]/15 bg-[#0077B5]/5 p-5 text-left text-sm text-[#0f3f63]">
            <p className="font-semibold mb-2">Why pasting your profile text works best</p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed text-[#154b73]">
              <li>
                Pasting text captures the exact headline, About section, experience bullets, skills, education, and certifications — even if LinkedIn hides or reorders content.
              </li>
              <li>
                URL fetchers often fail on private, restricted, or temporarily blocked LinkedIn profiles, while text paste works every time.
              </li>
              <li>
                This method avoids login barriers, layout changes, and missing fields so the AI can provide the most accurate score and recommendations.
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-2 opacity-70">
            <div className="text-center">
              <div className="text-2xl font-black text-zinc-900">6</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sections Scored</div>
            </div>
            <div className="w-px h-8 bg-zinc-200" />
            <div className="text-center">
              <div className="text-2xl font-black text-zinc-900">∞</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Keywords Checked</div>
            </div>
            <div className="w-px h-8 bg-zinc-200" />
            <div className="text-center">
              <div className="text-2xl font-black text-zinc-900">~15s</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Analysis Time</div>
            </div>
          </div>
        </div>

        {/* Main checker tool */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-0 sm:px-4">
          <LinkedInChecker />
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50/60 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-2">What We Analyze</h2>
            <p className="text-zinc-500 text-sm font-medium">Every important section of your LinkedIn profile, scored and reviewed</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "📝", title: "Headline", desc: "Your professional tagline & role clarity" },
              { icon: "👤", title: "About Section", desc: "Story, keywords & call-to-action" },
              { icon: "💼", title: "Experience", desc: "Impact bullets & achievement language" },
              { icon: "🛠️", title: "Skills", desc: "Endorseable skills & keyword coverage" },
              { icon: "🎓", title: "Education", desc: "Institutions, degrees & activities" },
              { icon: "🏅", title: "Certifications", desc: "Professional credentials & courses" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-zinc-200 p-5 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="font-extrabold text-sm text-zinc-800 mb-1">{item.title}</p>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10 bg-zinc-50">
        <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <FAQSection
            faqs={LINKEDIN_FAQS}
            defaultOpenIndex={0}
            title="LinkedIn Checker FAQs"
            description="Answers to common questions about why pasting your profile text gives the best analysis and how the LinkedIn checker works."
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateFAQSchema(LINKEDIN_FAQS)),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "url": "https://fresherats.com/linkedin-checker",
                "name": "LinkedIn Profile Checker | FresherATS",
                "description": "Analyze your LinkedIn profile with AI. Get an overall score, keyword gap analysis, and section-by-section feedback to optimize your profile for recruiters and ATS systems.",
              }),
            }}
          />
        </div>
      </section>
    </main>
  );
}
