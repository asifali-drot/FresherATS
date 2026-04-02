import Link from "next/link";
import FAQSection from "@/components/FAQSection";
import { generateFAQSchema } from "@/lib/seo";

export default function Home() {
    return (
        <main className="relative min-h-[calc(100vh-81px)] flex flex-col items-center justify-center px-6 overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-100 rounded-full blur-[140px] -z-10"></div>

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-9">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-1000">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-20"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                    </span>
                    AI-Powered Insights
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                    Fix Your Resume Before <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-500 to-purple-600 bg-size-[200%_auto] animate-gradient">
                        ATS Rejects It
                    </span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-zinc-600 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
                    Empowering fresh graduates to land their dream jobs. Analyze your ATS score,
                    uncover missing keywords, and transform your career path in seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5 pt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                    <Link
                        href="/analyze"
                        className="group relative px-10 py-4.5 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-200 text-center w-full sm:w-auto"
                    >
                        Analyze My Resume
                        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-40"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-600"></span>
                        </span>
                    </Link>
                </div>

                <div className="pt-14 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20 opacity-70 animate-in fade-in duration-1000 delay-500">
                    <div className="flex flex-col items-center space-y-2.5">
                        <span className="text-3xl font-extrabold text-zinc-900">98%</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Accuracy</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2.5">
                        <span className="text-3xl font-extrabold text-zinc-900">10s</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Analysis Time</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2.5 col-span-2 md:col-span-1">
                        <span className="text-3xl font-extrabold text-zinc-900">10k+</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Resumes Fixed</span>
                    </div>
                </div>
            </div>

            <FAQSection
                faqs={HOME_FAQS}
                title="Got Questions? We Have Answers"
                description="Everything you need to know about our ATS analyzer and how it helps you land your dream job."
            />

            {/* FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(HOME_FAQS)) }}
            />
        </main>
    );
}

const HOME_FAQS = [
    {
        question: "What is an ATS resume?",
        answer: "An ATS resume is a resume designed to be easily read and parsed by Applicant Tracking Systems (ATS). It typically uses standard fonts, clear headings, and keywords relevant to the job description."
    },
    {
        question: "How does the ATS score work?",
        answer: "The ATS score is calculated by comparing your resume's content against the job description. It looks for matching keywords, skills, and experience to determine how well you fit the role."
    },
    {
        question: "Is my resume stored?",
        answer: "No, we prioritize your privacy. Your resume is processed for analysis and then deleted. We do not store your personal data or resume files on our servers longer than necessary for the session."
    },
    {
        question: "Can I download the optimized resume?",
        answer: "Yes! After optimizing your resume using our editor, you can download it as a PDF that is fully ATS-friendly."
    },
    {
        question: "Is this tool free?",
        answer: "Yes, our basic ATS analysis and editor are free to use for all job seekers."
    }
];
