import Link from "next/link";
import { parseResumeText, generateResumeHtml } from "@/lib/resume/resumeUtils";
import { RESUME_TEMPLATES } from "@/lib/resume/templates";

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-3 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Resume Templates
        </h1>
        <p className="text-zinc-600 leading-relaxed max-w-2xl">
          Pick a template, edit it from scratch, and download an ATS-friendly PDF. Login is required to edit and download.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {RESUME_TEMPLATES.map((t) => {
          const { nameLines, sections } = parseResumeText(t.seedResumeText);
          const previewHtml = generateResumeHtml(nameLines, sections, t.id);

          return (
            <section key={t.id} className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">{t.label}</h2>
                    <p className="text-xs text-zinc-500 mt-1">ATS-friendly structure with editable seed content.</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                    Template
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50">
                  <iframe
                    title={`Template preview: ${t.label}`}
                    className="w-full h-[560px] border-none bg-white"
                    srcDoc={previewHtml}
                  />
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/analyze/editor?template=${t.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-extrabold text-white hover:opacity-90 transition-all active:scale-[0.99] shadow-md shadow-zinc-200"
                >
                  Start Editing
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

