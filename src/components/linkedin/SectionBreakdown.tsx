"use client";

import React from "react";
import LinkedInScoreBar from "./LinkedInScoreBar";

interface Section {
  score: number;
  feedback: string;
}

interface SectionBreakdownProps {
  sections: {
    headline: Section;
    about: Section;
    experience: Section;
    skills: Section;
    education: Section;
    certifications: Section;
  };
}

const SECTION_META: {
  key: keyof SectionBreakdownProps["sections"];
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    key: "headline",
    label: "Headline",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    description: "Your professional tagline",
  },
  {
    key: "about",
    label: "About / Summary",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    description: "Professional summary & story",
  },
  {
    key: "experience",
    label: "Experience",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: "Work history & achievements",
  },
  {
    key: "skills",
    label: "Skills",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    description: "Technical & soft skills",
  },
  {
    key: "education",
    label: "Education",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    description: "Degrees & institutions",
  },
  {
    key: "certifications",
    label: "Certifications",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    description: "Professional credentials",
  },
];

function getScoreLabel(score: number) {
  if (score >= 85) return { text: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score >= 70) return { text: "Good", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
  if (score >= 50) return { text: "Average", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  if (score >= 30) return { text: "Weak", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  return { text: "Poor", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
}

function getIconBg(score: number) {
  if (score >= 70) return "bg-blue-100 text-blue-600";
  if (score >= 50) return "bg-amber-100 text-amber-600";
  return "bg-red-100 text-red-500";
}

export default function SectionBreakdown({ sections }: SectionBreakdownProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-extrabold text-zinc-900">Section-by-Section Breakdown</h3>
          <p className="text-xs text-zinc-500 font-medium">Detailed analysis of each profile section</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTION_META.map((meta, idx) => {
          const section = sections[meta.key];
          const label = getScoreLabel(section.score);
          const iconBg = getIconBg(section.score);

          return (
            <div
              key={meta.key}
              className={`relative rounded-2xl border ${label.border} bg-white p-4 shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} shrink-0`}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-zinc-800 truncate">{meta.label}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${label.bg} ${label.color} ${label.border} shrink-0`}>
                      {label.text}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">{meta.description}</p>
                </div>
              </div>

              {/* Score bar */}
              <div className="mb-3">
                <LinkedInScoreBar
                  score={section.score}
                  label={`Score`}
                  delay={idx * 100}
                />
              </div>

              {/* Feedback */}
              <p className="text-xs text-zinc-600 leading-relaxed font-medium border-t border-zinc-100 pt-3">
                {section.feedback}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
