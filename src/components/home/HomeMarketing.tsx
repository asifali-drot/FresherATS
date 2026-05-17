import Link from "next/link";
import {
  GraduationCap,
  ScanSearch,
  Tags,
  FileCheck,
  Sparkles,
  Timer,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PenLine,
  type LucideIcon,
} from "lucide-react";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
  className: string;
}[] = [
  {
    icon: ScanSearch,
    title: "Deep content scan",
    description:
      "We read your resume text—not just the file name—so feedback reflects what recruiters and ATS actually see.",
    className: "md:col-span-2",
  },
  {
    icon: Tags,
    title: "Keyword gap finder",
    description: "Paste a job description and see which skills you’re missing before you hit submit.",
    className: "md:col-span-1",
  },
  {
    icon: FileCheck,
    title: "Format sanity checks",
    description: "Headings, bullets, and section order tuned for parsers—not graphics that break scans.",
    className: "md:col-span-1",
  },
  {
    icon: Sparkles,
    title: "AI rewrite suggestions",
    description: "Actionable bullet improvements without inventing experience you don’t have.",
    className: "md:col-span-1",
  },
  {
    icon: Timer,
    title: "Results in seconds",
    description: "Upload, analyze, and get a clear score while your coffee is still hot.",
    className: "md:col-span-1",
  },
  {
    icon: GraduationCap,
    title: "Built for freshers",
    description: "Projects, internships, and campus roles—our prompts match early-career resumes.",
    className: "md:col-span-2",
  },
];

export default function HomeMarketing() {
  return (
    <div className="relative border-t border-zinc-100 bg-white">
      <WhySection />
      <FeaturesBento />
      <ShowcaseScore />
      <ShowcaseKeywords />
      <ShowcaseEditor />
      <BottomCta />
    </div>
  );
}

function WhySection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Grid12>
        <div className="lg:col-span-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 mb-4">Why FresherATS</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Most resumes never reach a human—{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-500">
              the ATS decides first
            </span>
          </h2>
        </div>
        <div className="lg:col-span-7 space-y-5 text-zinc-600 leading-relaxed text-base sm:text-lg">
          <p>
            Applicant Tracking Systems strip formatting, scan for keywords, and rank candidates before a
            recruiter opens your PDF. If your layout is messy or your skills don’t match the posting, you
            can be filtered out in seconds.
          </p>
          <p>
            FresherATS is built for students and early-career job seekers. We score your resume against
            real job descriptions, surface missing keywords, and help you edit into a clean,
            parser-friendly format.
          </p>
          <Link
            href="/#analyze"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors"
          >
            Try the analyzer <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Grid12>
    </section>
  );
}

function Grid12({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">{children}</div>
  );
}

function FeaturesBento() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-3">What you get</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          One workflow, every check that matters
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className={`group rounded-3xl border border-zinc-100 bg-linear-to-br from-white to-zinc-50/80 p-6 shadow-sm hover:shadow-md hover:border-purple-100 transition-all ${f.className}`}
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-zinc-900">{f.title}</h3>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{f.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ShowcaseScore() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <ScoreMockPanel />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 mb-3">Step 1 · Understand</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-4">
            A score you can act on—not a vague “looks fine”
          </h2>
          <ul className="space-y-3 text-zinc-600">
            <CheckItem>Instant ATS-style score with a plain-language summary</CheckItem>
            <CheckItem>Section-level feedback on structure and readability</CheckItem>
            <CheckItem>See what’s strong before you rewrite everything</CheckItem>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ShowcaseKeywords() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="lg:order-2">
          <KeywordMockPanel />
        </div>
        <div className="lg:order-1">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600 mb-3">Step 2 · Match</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-4">
            Tailor to the job—not every job on the board
          </h2>
          <ul className="space-y-3 text-zinc-600">
            <CheckItem>Optional job description for targeted keyword analysis</CheckItem>
            <CheckItem>Missing skills surfaced as tags you can add honestly</CheckItem>
            <CheckItem>Stop guessing what the posting actually wants</CheckItem>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ShowcaseEditor() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <EditorMockPanel />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 mb-3">Step 3 · Improve</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-4">
            Edit, preview, and download an ATS-ready PDF
          </h2>
          <ul className="space-y-3 text-zinc-600 mb-6">
            <CheckItem>Guided editor with live resume preview</CheckItem>
            <CheckItem>ATS-friendly templates to start from scratch</CheckItem>
            <CheckItem>Download a clean PDF when you’re happy with the result</CheckItem>
          </ul>
          <Link
            href="/resume-templates"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-800 hover:border-purple-200 hover:bg-purple-50 transition-all"
          >
            Browse templates <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BottomCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-purple-950 to-zinc-900 px-8 py-12 sm:px-14 sm:py-16 text-center">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <h2 className="relative text-2xl sm:text-3xl font-extrabold text-white mb-3">
          Ready to see how recruiters’ software reads your resume?
        </h2>
        <p className="relative text-zinc-300 max-w-xl mx-auto mb-8">
          Upload once, get your score and suggestions, then refine in our editor—all free to start.
        </p>
        <Link
          href="/#analyze"
          className="relative inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-extrabold text-zinc-900 hover:bg-purple-50 transition-all active:scale-[0.98] shadow-lg"
        >
          Analyze my resume <ArrowRight className="h-4 w-4 text-purple-600" />
        </Link>
      </div>
    </section>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-purple-600 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function ScoreMockPanel() {
  return (
    <div className="relative rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-xl shadow-purple-100/40">
      <div className="absolute -inset-px rounded-3xl bg-linear-to-br from-purple-200/40 to-pink-200/30 -z-10 blur-sm pointer-events-none" />
      <div className="rounded-2xl bg-white border border-zinc-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">ATS Report</span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Good</span>
        </div>
        <ScoreBodyContent />
      </div>
    </div>
  );
}

function ScoreBodyContent() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <ScoreRing />
      <ul className="flex-1 space-y-2 w-full text-sm">
        <MockRow ok label="Clear section headings" />
        <MockRow ok label="Readable contact block" />
        <MockRow warn label="Add 3 keywords from JD" />
        <MockRow ok label="Bullet structure" />
      </ul>
    </div>
  );
}

function ScoreRing() {
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#f4f4f5" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#homeScoreGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${78 * 2.64} 264`}
        />
        <defs>
          <linearGradient id="homeScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-zinc-900">
        78
      </span>
    </div>
  );
}

function KeywordMockPanel() {
  const matched = ["React", "TypeScript", "REST APIs", "Git"];
  const missing = ["PostgreSQL", "CI/CD", "Agile"];

  return (
    <div className="relative rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-xl shadow-pink-100/30">
      <div className="rounded-2xl bg-white border border-zinc-100 p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Tags className="h-4 w-4 text-purple-600" />
          Keyword match · Software Intern
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-700 mb-2">Found in your resume</p>
          <div className="flex flex-wrap gap-2">
            {matched.map((k) => (
              <span
                key={k}
                className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-semibold border border-emerald-100"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 mb-2">Consider adding</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((k) => (
              <span
                key={k}
                className="rounded-lg bg-amber-50 text-amber-900 px-3 py-1 text-xs font-semibold border border-dashed border-amber-200"
              >
                + {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorMockPanel() {
  return (
    <div className="relative rounded-3xl border border-zinc-200 overflow-hidden shadow-xl shadow-zinc-200/60">
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Resume Studio</span>
      </div>
      <div className="grid grid-cols-2 min-h-[220px]">
        <div className="border-r border-zinc-100 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
            <PenLine className="h-3.5 w-3.5" /> Guided edit
          </div>
          <div className="h-2 w-3/4 rounded bg-zinc-100" />
          <EditorLinePlaceholder w="w-full" />
          <EditorLinePlaceholder w="w-5/6" />
          <EditorLinePlaceholder w="w-4/6" />
        </div>
        <div className="bg-zinc-50 p-4 text-[10px] text-zinc-500 leading-relaxed">
          <p className="font-bold text-zinc-800 text-xs mb-2">PREVIEW</p>
          <p className="font-extrabold text-zinc-900">ALEX RIVERA</p>
          <p className="text-purple-600">alex@email.com</p>
          <p className="mt-3 font-bold text-zinc-700">EXPERIENCE</p>
          <p>• Built features with React…</p>
        </div>
      </div>
    </div>
  );
}

function EditorLinePlaceholder({ w }: { w: string }) {
  return <div className={`h-2 ${w} rounded bg-purple-100`} />;
}

function MockRow({ ok, warn, label }: { ok?: boolean; warn?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-zinc-700">
      {ok && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
      {warn && <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />}
      {label}
    </li>
  );
}
