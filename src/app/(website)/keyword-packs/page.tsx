import React from "react";
import PackScanner from "@/components/PackScanner";
import { PACK_INDEX } from "@/lib/keyword-packs/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Keyword Packs",
  description: "Score your resume against a specific employer's hiring pattern, ATS rules, and company values.",
};

export default async function KeywordPacksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const initialPackId = typeof searchParams.pack === "string" ? searchParams.pack : undefined;
  const initialAnalysisId = typeof searchParams.analysis_id === "string" ? searchParams.analysis_id : undefined;

  // Reorder PACK_INDEX so the selected one is first if provided
  let packsToPass = [...PACK_INDEX];
  if (initialPackId) {
    const idx = packsToPass.findIndex(p => p.id === initialPackId);
    if (idx > -1) {
      const p = packsToPass.splice(idx, 1)[0];
      packsToPass.unshift(p);
    }
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Company Keyword Packs
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Don't just match a random job description. Score your resume against specific employer hiring patterns, curated values language, and ATS rules.
          </p>
        </div>
      </div>

      <div className="py-12 px-6">
        <PackScanner 
          packs={packsToPass} 
          initialAnalysisId={initialAnalysisId}
        />
      </div>
    </div>
  );
}
