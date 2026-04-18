import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { parseResumeText, generateResumeHtml } from "@/lib/resume/resumeUtils";
import { getResumeTemplateBySlug, RESUME_TEMPLATES } from "@/lib/resume/templates";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return RESUME_TEMPLATES.map((template) => ({
    slug: template.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = getResumeTemplateBySlug(slug);

  if (!template) return { title: "Template Not Found" };

  return {
    title: `${template.label} - ATS-Friendly Resume Sample`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = getResumeTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const { nameLines, sections } = parseResumeText(template.seedResumeText);
  const previewHtml = generateResumeHtml(nameLines, sections, template.id);

  return (
    <main className="min-h-screen bg-zinc-50/50 pb-20">
      {/* Top Header / Navigation */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link
            href="/resume-templates"
            className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Templates
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Live Preview
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Preview */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="sticky top-24">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  {template.label} Preview
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">ATS Optimized</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white shadow-2xl shadow-zinc-200/50 border border-zinc-200 overflow-hidden">
                <div className="bg-zinc-100/50 border-b border-zinc-100 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  </div>
                </div>
                <iframe
                  title={`Full preview of ${template.label}`}
                  className="w-full h-[842px] border-none bg-white"
                  srcDoc={previewHtml}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Content & CTA */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-12">
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Sparkles className="h-5 w-5 fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest">Featured Template</span>
              </div>

              <h2 className="text-3xl font-extrabold text-zinc-900 mb-4 leading-tight">
                Craft Your Perfect {template.label.replace(' Template', '')}
              </h2>

              <p className="text-zinc-600 leading-relaxed mb-8">
                {template.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 rounded-full p-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-zinc-700">100% Parsing Accuracy on Modern ATS</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 rounded-full p-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-zinc-700">Premium Professional Typography</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 rounded-full p-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-zinc-700">Fully Customizable Seed Content</p>
                </div>
              </div>

              <Link
                href={`/free-ats-resume-checker/editor?template=${template.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-base font-extrabold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-zinc-200"
              >
                <FileText className="h-5 w-5" />
                Use This Template
              </Link>

              <p className="text-center text-[10px] text-zinc-400 mt-4 font-bold uppercase tracking-widest">
                No Credit Card Required • Instant Download
              </p>
            </div>

            {/* Tips Section */}
            <div className="bg-zinc-900 rounded-3xl p-8 text-white mt-2.5 mb-2.5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Writing Tips for this Role
              </h3>
              <ul className="space-y-6">
                {template.roleTips.map((tip, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 border border-zinc-700">
                      {i + 1}
                    </span>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Why ATS-Friendly? */}
            <div className="p-4 border-l-2 border-blue-500 bg-blue-50/50 rounded-r-2xl">
              <h4 className="text-sm font-bold text-zinc-900 mb-1">Why ATS-Friendly?</h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Most companies use software to scan resumes. This layout is engineered to be perfectly readable by these systems, ensuring your credentials aren't lost in the digital pile.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
