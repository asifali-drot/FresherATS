import Link from "next/link";
import { parseCoverLetterText, generateCoverLetterHtml } from "@/lib/cover-letter/utils";
import { COVER_LETTER_TEMPLATES } from "@/lib/cover-letter/templates";

export default function CoverLetterTemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-3 mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 self-center sm:self-start px-3 py-1 rounded-full border border-blue-200 bg-blue-50 dark:bg-zinc-900 dark:border-zinc-800 text-blue-700 dark:text-blue-400 text-xs font-bold">
          ATS-Friendly Layouts
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Cover Letter Templates
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl text-sm font-medium">
          Select a professionally designed template to start writing. You can customize the fields, rewrite using AI, and download as an ATS-friendly PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {COVER_LETTER_TEMPLATES.map((t) => {
          const parsedData = parseCoverLetterText(t.seedText);
          // Use the public cover_letter.webp image as a dummy avatar for the modern-avatar template preview
          const avatarUrl = t.id === "modern-avatar" ? "/cover_letter.webp" : undefined;
          const previewHtml = generateCoverLetterHtml(parsedData, t.id, avatarUrl);

          return (
            <section
              key={t.id}
              className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-none hover:-translate-y-0.5 group flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {t.label}
                    </h2>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                      {t.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-zinc-50/20 dark:bg-zinc-950/10 border-b border-zinc-100 dark:border-zinc-800/80 overflow-hidden">
                <iframe
                  title={`Template preview: ${t.label}`}
                  className="w-full h-95 border-none bg-white block"
                  srcDoc={previewHtml}
                />
              </div>

              <div className="p-6">
                <Link
                  href={`/cover-letter?template=${t.id}`}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 px-5 py-3 text-xs font-extrabold text-white transition-all active:scale-[0.98] shadow-sm shadow-zinc-200 dark:shadow-none"
                >
                  Use Template & Edit
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
