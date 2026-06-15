"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface KeywordGapProps {
  present: string[];
  missing: string[];
}

export default function KeywordGap({ present, missing }: KeywordGapProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
          <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-extrabold text-zinc-900">Keyword Gap Analysis</h3>
          <p className="text-xs text-zinc-500 font-medium">
            {present.length} keywords found &bull; {missing.length} keywords missing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Present Keywords */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-bold text-emerald-800">Already in Your Profile</span>
            <span className="ml-auto inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              {present.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {present.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No matching keywords found</p>
            ) : (
              present.map((kw, i) => (
                <KeywordTag key={i} keyword={kw} variant="present" delay={i * 40} />
              ))
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-sm font-bold text-red-800">Missing from Profile</span>
            <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {missing.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missing.length === 0 ? (
              <p className="text-xs text-emerald-600 font-semibold">🎉 All key keywords are present!</p>
            ) : (
              missing.map((kw, i) => (
                <KeywordTag key={i} keyword={kw} variant="missing" delay={i * 40} />
              ))
            )}
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 flex items-start gap-2">
          <span className="text-amber-500 mt-0.5 shrink-0">💡</span>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            <span className="font-bold">Tip:</span> Add the missing keywords naturally into your headline, about section, and experience bullets. Keyword stuffing can hurt your profile — integrate them authentically.
          </p>
        </div>
      )}
    </div>
  );
}

function KeywordTag({
  keyword,
  variant,
  delay,
}: {
  keyword: string;
  variant: "present" | "missing";
  delay: number;
}) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const base =
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300";
  const styles = {
    present: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    missing: "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`${base} ${styles[variant]} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
      style={{ transitionDelay: `0ms` }}
    >
      {variant === "present" ? (
        <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-3 w-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      {keyword}
    </span>
  );
}
