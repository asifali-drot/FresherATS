"use client";

import React from "react";

export interface AnalysisResult {
  success?: boolean;
  score?: number;
  summary?: string;
  suggestions?: string[];
  missingKeywords?: string[];
  result?: string;
  optimizedResume?: string;
  analysis_id?: string | null;  // Supabase row ID for DB-backed PDF download
}

interface SuggestionsProps {
  data: AnalysisResult | null;
}

export default function Suggestions({ data }: SuggestionsProps) {
  if (!data) return null;

  const suggestions = data.suggestions ?? [];
  const missingKeywords = data.missingKeywords ?? []; 

  return (
    <div className="flex flex-col gap-10">
      {/* Missing Keywords */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-zinc-900">Missing Keywords:</h3>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.length > 0 ? (
            missingKeywords.map((keyword, i) => (
              <span
                key={i}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors cursor-default"
              >
                {keyword}
              </span>
            ))
          ) : (
            <p className="text-sm text-zinc-500 italic">No missing keywords identified.</p>
          )}
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
            <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-zinc-900">Suggestions</h3>
        <div className="flex flex-col gap-3">
          {suggestions.length > 0 ? (
            suggestions.map((item, i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm hover:border-zinc-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-zinc-700">{item}</span>
                </div>
                <svg className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))
          ) : (
            <div className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-zinc-700">Add technical skills like Python, Excel.</span>
                </div>
                <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
