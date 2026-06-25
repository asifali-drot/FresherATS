"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ─── Types ────────────────────────────────────────────────── */

interface Analysis {
  id: string;
  created_at: string;
  score: number | null;
  job_description: string | null;
  summary: string | null;
  optimized_resume?: string | null;
  resume_document?: Record<string, unknown> | null;
  suggestions?: string[] | null;
  missing_keywords?: string[] | null;
  user_id?: string;
}

interface CoverLetter {
  id: string;
  created_at: string;
  user_id: string;
  cover_letter_text: string;
  job_title: string | null;
  job_description: string | null;
  company_name: string | null;
  template_id: string;
  avatar_url: string | null;
  file_path: string;
}

type FilterType = "all" | "excellent" | "good" | "average" | "poor";
type DashboardTab = "resumes" | "cover-letters";

/* ─── Score helpers ─────────────────────────────────────────── */

function getStatus(score: number) {
  if (score >= 85) return { label: "Excellent", color: "#10b981", trackColor: "#d1fae5", badgeBg: "#ecfdf5", badgeText: "#065f46", filter: "excellent" as FilterType };
  if (score >= 70) return { label: "Good", color: "#22c55e", trackColor: "#dcfce7", badgeBg: "#f0fdf4", badgeText: "#14532d", filter: "good" as FilterType };
  if (score >= 50) return { label: "Average", color: "#f59e0b", trackColor: "#fef3c7", badgeBg: "#fffbeb", badgeText: "#78350f", filter: "average" as FilterType };
  if (score >= 30) return { label: "Poor", color: "#f97316", trackColor: "#ffedd5", badgeBg: "#fff7ed", badgeText: "#7c2d12", filter: "poor" as FilterType };
  return { label: "Very Poor", color: "#ef4444", trackColor: "#fee2e2", badgeBg: "#fef2f2", badgeText: "#7f1d1d", filter: "poor" as FilterType };
}

/* ─── Mini circular score ring ──────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  const status = getStatus(score);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = animated ? (score / 100) * circ : 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="40" cy="40" r={r} fill="none" stroke={status.trackColor} strokeWidth="7" />
        {/* Progress */}
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={status.color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </svg>
      {/* Score label */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: status.color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 1 }}>ATS</span>
      </div>
    </div>
  );
}

/* ─── Resume card skeleton ──────────────────────────────────── */

function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex gap-5">
        <div className="h-20 w-20 rounded-2xl bg-zinc-100 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded-full bg-zinc-100" />
          <div className="h-3 w-full rounded-full bg-zinc-100" />
          <div className="h-3 w-4/5 rounded-full bg-zinc-100" />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <div className="h-9 flex-1 rounded-xl bg-zinc-100" />
        <div className="h-9 flex-1 rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}

/* ─── Individual resume card ────────────────────────────────── */

function ResumeCard({ analysis, onViewResults, onDownload, onEdit, onDelete, downloadingId, deletingId }: {
  analysis: Analysis;
  onViewResults: (a: Analysis) => void;
  onDownload: (a: Analysis) => void;
  onEdit: (a: Analysis) => void;
  onDelete: (a: Analysis) => void;
  downloadingId: string | null;
  deletingId: string | null;
}) {
  const score = analysis.score ?? 0;
  const status = getStatus(score);
  const date = new Date(analysis.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const jdSnippet = analysis.job_description
    ? analysis.job_description.trim().slice(0, 90) + (analysis.job_description.length > 90 ? "…" : "")
    : "No job description provided";

  const isDownloading = downloadingId === analysis.id;

  return (
    <div
      className="group relative rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-100 hover:-translate-y-0.5"
      style={{ willChange: "transform" }}
    >
      {/* Top row: score ring + info */}
      <div className="flex gap-5 items-start">
        <ScoreRing score={score} />

        <div className="flex-1 min-w-0">
          {/* Status badge + date */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ring-1"
              style={{ backgroundColor: status.badgeBg, color: status.badgeText, borderColor: status.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
              {status.label}
            </span>
            <span className="text-[11px] font-semibold text-zinc-400">{date}</span>
          </div>

          {/* Job description snippet */}
          <p className="text-sm font-semibold text-zinc-800 leading-snug line-clamp-2 mb-1">
            {analysis.job_description
              ? `For: ${jdSnippet}`
              : "General Resume Analysis"}
          </p>

          {/* Summary */}
          {analysis.summary && (
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
              {analysis.summary}
            </p>
          )}
        </div>
      </div>

      {/* Score bar strip */}
      <div className="mt-4 mb-4">
        <div className="relative h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, backgroundColor: status.color }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-semibold text-zinc-400">0</span>
          <span className="text-[10px] font-semibold text-zinc-400">100</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-1">
        <button
          onClick={() => onViewResults(analysis)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition-all active:scale-95 shadow-sm shadow-zinc-200"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Results
        </button>
        <button
          onClick={() => onEdit(analysis)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDownload(analysis)}
          disabled={isDownloading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Top-left corner: ID chip */}
      <div className="absolute top-3 left-4 text-[9px] font-mono font-bold text-zinc-300 select-none">
        #{analysis.id.slice(0, 6)}
      </div>

      {/* Top-right corner: Delete button */}
      <div className="absolute top-3 right-4 flex items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={deletingId === analysis.id}
              className="inline-flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete resume"
            >
              {deletingId === analysis.id ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this resume analysis.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(analysis)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/* ─── Cover Letter Card ─────────────────────────────────────── */

function CoverLetterCard({
  coverLetter,
  onView,
  onEdit,
  onDownload,
  onDelete,
  downloadingId,
  deletingId,
}: {
  coverLetter: CoverLetter;
  onView: (c: CoverLetter) => void;
  onEdit: (c: CoverLetter) => void;
  onDownload: (c: CoverLetter) => void;
  onDelete: (c: CoverLetter) => void;
  downloadingId: string | null;
  deletingId: string | null;
}) {
  const date = new Date(coverLetter.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = new Date(coverLetter.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const isDownloading = downloadingId === coverLetter.id;
  const isDeleting = deletingId === coverLetter.id;

  return (
    <div
      className="group relative rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-purple-100 hover:-translate-y-0.5"
      style={{ willChange: "transform" }}
    >
      {/* Icon + Info */}
      <div className="flex gap-5 items-start mt-1">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100 shrink-0">
          <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 ring-1 ring-purple-200">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              {coverLetter.template_id || "Professional"}
            </span>
            <span className="text-[11px] font-semibold text-zinc-400">{date}</span>
          </div>
          <h3 className="text-sm font-bold text-zinc-800 leading-snug truncate">
            {coverLetter.job_title ? `For: ${coverLetter.job_title}` : "Cover Letter"}
          </h3>
          {coverLetter.company_name && (
            <p className="text-xs font-semibold text-zinc-500 truncate mt-0.5">
              at {coverLetter.company_name}
            </p>
          )}
          <p className="text-xs text-zinc-400 font-medium mt-1">Generated at {time}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-5">
        <button
          onClick={() => onView(coverLetter)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition-all active:scale-95 shadow-sm shadow-zinc-200"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
        <button
          onClick={() => onEdit(coverLetter)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDownload(coverLetter)}
          disabled={isDownloading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Top-left corner: ID chip */}
      <div className="absolute top-3 left-4 text-[9px] font-mono font-bold text-zinc-300 select-none">
        #{coverLetter.id.slice(0, 6)}
      </div>

      {/* Top-right corner: Delete button */}
      <div className="absolute top-3 right-4 flex items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={isDeleting}
              className="inline-flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete cover letter"
            >
              {isDeleting ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete cover letter?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this cover letter from your storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(coverLetter)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/* ─── Empty states ──────────────────────────────────────────── */

function EmptyResumeState({ filter }: { filter: FilterType }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-blue-50 to-violet-50 border border-blue-100">
        <svg className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-800 mb-2">
        {filter === "all" ? "No resumes analyzed yet" : `No "${filter}" resumes found`}
      </h3>
      <p className="text-sm text-zinc-500 mb-8 max-w-xs">
        {filter === "all"
          ? "Upload your resume and analyze it against a job description to see your ATS score here."
          : `You don't have any resumes in the "${filter}" category yet.`}
      </p>
      {filter === "all" && (
        <Link
          href="/#analyze"
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Analyze Your First Resume
        </Link>
      )}
    </div>
  );
}

function EmptyCoverLetterState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100">
        <svg className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-800 mb-2">No cover letters yet</h3>
      <p className="text-sm text-zinc-500 mb-8 max-w-xs">
        Generate your first cover letter using our AI-powered tool. It will appear here for easy access.
      </p>
      <Link
        href="/ai-cover-letter-generator?action=new"
        className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Your First Cover Letter
      </Link>
    </div>
  );
}

/* ─── Filter tabs ───────────────────────────────────────────── */

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "excellent", label: "Excellent (85+)" },
  { key: "good", label: "Good (70-84)" },
  { key: "average", label: "Average (50-69)" },
  { key: "poor", label: "Poor (<50)" },
];

/* ─── Main Dashboard page ───────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumes");

  // Resume state
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cover letter state
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [coverLettersLoading, setCoverLettersLoading] = useState(true);
  const [clDownloadingId, setClDownloadingId] = useState<string | null>(null);
  const [clDeletingId, setClDeletingId] = useState<string | null>(null);
  const [clError, setClError] = useState<string | null>(null);
  const [viewingCl, setViewingCl] = useState<CoverLetter | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  /* Auth + data fetch */
  useEffect(() => {
    async function init() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setUserId(user.id);

      // Fetch resumes
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setAnalyses(data as Analysis[]);
      setLoading(false);

      // Fetch cover letters from database
      const { data: clData, error: dbClError } = await supabase
        .from("cover_letters")
        .select("*")
        .order("created_at", { ascending: false });

      if (!dbClError && clData) {
        setCoverLetters(clData as CoverLetter[]);
      } else if (dbClError) {
        console.error("Failed to fetch cover letters from DB:", dbClError.message);
      }
      setCoverLettersLoading(false);
    }
    init();
  }, [router]);

  /* Filter resumes */
  const filtered = analyses.filter((a) => {
    if (filter === "all") return true;
    const s = a.score ?? 0;
    if (filter === "excellent") return s >= 85;
    if (filter === "good") return s >= 70 && s < 85;
    if (filter === "average") return s >= 50 && s < 70;
    if (filter === "poor") return s < 50;
    return true;
  });

  /* Stats */
  const total = analyses.length;
  const avgScore = total > 0
    ? Math.round(analyses.reduce((s, a) => s + (a.score ?? 0), 0) / total)
    : 0;
  const bestScore = total > 0
    ? Math.max(...analyses.map((a) => a.score ?? 0))
    : 0;

  /* View results: restore to sessionStorage and navigate */
  const handleViewResults = useCallback((analysis: Analysis) => {
    const payload = {
      success: true,
      score: analysis.score ?? 0,
      summary: analysis.summary ?? "",
      suggestions: analysis.suggestions ?? [],
      missingKeywords: analysis.missing_keywords ?? [],
      optimizedResume: analysis.optimized_resume ?? "",
      analysis_id: analysis.id,
    };
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("fresherAtsResult", JSON.stringify(payload));
    }
    router.push("/result");
  }, [router]);

  /* Download resume PDF */
  const handleDownload = useCallback(async (analysis: Analysis) => {
    if (downloadingId) return;
    setDownloadingId(analysis.id);
    setDownloadError(null);
    try {
      const response = await fetch("/api/download-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: analysis.id }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate PDF");
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const { url } = await response.json();
        if (url) {
          const pdfRes = await fetch(url);
          const blob = await pdfRes.blob();
          const dl = window.URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = dl; a.download = "optimized-resume.pdf";
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          window.URL.revokeObjectURL(dl);
          return;
        }
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "optimized-resume.pdf";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Failed to download");
    } finally {
      setDownloadingId(null);
    }
  }, [downloadingId]);

  /* Edit resume */
  const handleEdit = useCallback((analysis: Analysis) => {
    if (analysis.optimized_resume || analysis.resume_document) {
      if (typeof window !== "undefined") {
        if (analysis.optimized_resume) {
          window.sessionStorage.setItem("resumeContent", analysis.optimized_resume);
        }
        if (analysis.resume_document) {
          window.sessionStorage.setItem("resumeDocument", JSON.stringify(analysis.resume_document));
        }
        window.sessionStorage.setItem("analysisId", analysis.id);
      }
      router.push("/editor");
    }
  }, [router]);

  /* Delete resume */
  const handleDeleteResume = useCallback(async (analysis: Analysis) => {
    setDeletingId(analysis.id);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase
        .from("analyses")
        .delete()
        .eq("id", analysis.id);

      if (error) throw error;

      // Verify if the row was actually deleted (RLS can silently prevent deletion)
      const { data: checkData } = await supabase
        .from("analyses")
        .select("id")
        .eq("id", analysis.id)
        .single();

      if (checkData) {
        throw new Error("Deletion prevented by Supabase RLS. Please add a DELETE policy for the 'analyses' table in your Supabase Dashboard.");
      }

      setAnalyses(prev => prev.filter(a => a.id !== analysis.id));
      toast.success("Resume deleted successfully");
    } catch (e) {
      console.error("Failed to delete resume:", e);
      toast.error(e instanceof Error ? e.message : "Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  }, []);

  /* View cover letter */
  const handleViewCoverLetter = useCallback((cl: CoverLetter) => {
    setViewingCl(cl);
    setShowViewModal(true);
  }, []);

  /* Edit cover letter */
  const handleEditCoverLetter = useCallback((cl: CoverLetter) => {
    if (cl.cover_letter_text) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("coverLetterText", cl.cover_letter_text);
        window.sessionStorage.setItem("coverLetterTemplateId", cl.template_id || "professional");
        window.sessionStorage.setItem("coverLetterId", cl.id);
      }
      router.push("/ai-cover-letter-generator?action=edit");
    }
  }, [router]);

  /* Download cover letter */
  const handleDownloadCoverLetter = useCallback(async (cl: CoverLetter) => {
    if (!userId || clDownloadingId) return;
    setClDownloadingId(cl.id);
    setClError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const filePath = cl.file_path;

      const { data, error } = await supabase.storage
        .from("cover-letters")
        .createSignedUrl(filePath, 3600);

      if (error || !data?.signedUrl) throw new Error("Failed to generate download link");

      const pdfRes = await fetch(data.signedUrl);
      const blob = await pdfRes.blob();
      const dl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dl;
      const downloadName = cl.job_title
        ? `cover-letter-${cl.job_title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`
        : "cover-letter.pdf";
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(dl);
    } catch (e) {
      setClError(e instanceof Error ? e.message : "Failed to download");
    } finally {
      setClDownloadingId(null);
    }
  }, [userId, clDownloadingId]);

  /* Delete cover letter */
  const handleDeleteCoverLetter = useCallback(async (cl: CoverLetter) => {
    if (!userId) return;
    setClDeletingId(cl.id);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: dbError } = await supabase
        .from("cover_letters")
        .delete()
        .eq("id", cl.id);

      if (dbError) throw dbError;

      const { error: storageError } = await supabase.storage
        .from("cover-letters")
        .remove([cl.file_path]);

      if (storageError) {
        console.warn("[Dashboard] Storage deletion failed or file not found:", storageError.message);
      }

      setCoverLetters(prev => prev.filter(c => c.id !== cl.id));
      toast.success("Cover letter deleted successfully");
    } catch (e) {
      console.error("Failed to delete cover letter:", e);
      toast.error(e instanceof Error ? e.message : "Failed to delete cover letter");
    } finally {
      setClDeletingId(null);
    }
  }, [userId]);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#0f172a] via-[#1e1b4b] to-[#1e3a5f]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-200">Dashboard</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Dashboard
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2">
                My Dashboard
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                Manage your analyzed resumes and generated cover letters — all in one place.
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <Link
                href="/#analyze"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Analyze Resume
              </Link>
              <Link
                href="/ai-cover-letter-generator?action=new"
                className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-900/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Cover Letter
              </Link>
            </div>
          </div>

          {/* ── Stats strip ── */}
          {!loading && (total > 0 || coverLetters.length > 0) && (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "Total Resumes", value: total, icon: "📄", sub: "analyzed" },
                { label: "Average Score", value: avgScore, icon: "📊", sub: "/ 100" },
                { label: "Best Score", value: bestScore, icon: "🏆", sub: "/ 100" },
                { label: "Cover Letters", value: coverLetters.length, icon: "✉️", sub: "generated" },
              ].map(({ label, value, icon, sub }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{label} <span className="text-slate-500">{sub}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ── Tab switcher ── */}
        <div className="mb-8 flex items-center gap-1 rounded-2xl bg-zinc-100 p-1.5 w-fit">
          <button
            id="tab-resumes"
            onClick={() => setActiveTab("resumes")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === "resumes"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
              }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Resumes
            {total > 0 && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-black text-zinc-600">{total}</span>
            )}
          </button>
          <button
            id="tab-cover-letters"
            onClick={() => setActiveTab("cover-letters")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === "cover-letters"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
              }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Cover Letters
            {coverLetters.length > 0 && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-600">{coverLetters.length}</span>
            )}
          </button>
        </div>

        {/* Error alert */}
        {(downloadError || clError) && (
          <Alert variant="destructive" className="mb-6">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <AlertDescription className="flex items-center justify-between">
              <span>{downloadError || clError}</span>
              <button onClick={() => { setDownloadError(null); setClError(null); }} className="ml-4 hover:opacity-70 transition-opacity">✕</button>
            </AlertDescription>
          </Alert>
        )}

        {/* ══════════ RESUMES TAB ══════════ */}
        {activeTab === "resumes" && (
          <>
            {/* ── Filter tabs ── */}
            {!loading && (
              <div className="mb-8 flex items-center gap-2 flex-wrap">
                {FILTER_TABS.map(({ key, label }) => {
                  const count = key === "all"
                    ? total
                    : analyses.filter((a) => {
                      const s = a.score ?? 0;
                      if (key === "excellent") return s >= 85;
                      if (key === "good") return s >= 70 && s < 85;
                      if (key === "average") return s >= 50 && s < 70;
                      if (key === "poor") return s < 50;
                      return false;
                    }).length;
                  const isActive = filter === key;
                  return (
                    <button
                      key={key}
                      id={`filter-${key}`}
                      onClick={() => setFilter(key)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${isActive
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900"
                        }`}
                    >
                      {label}
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Grid ── */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                : filtered.length === 0
                  ? <EmptyResumeState filter={filter} />
                  : filtered.map((analysis) => (
                    <ResumeCard
                      key={analysis.id}
                      analysis={analysis}
                      onViewResults={handleViewResults}
                      onDownload={handleDownload}
                      onEdit={handleEdit}
                      onDelete={handleDeleteResume}
                      downloadingId={downloadingId}
                      deletingId={deletingId}
                    />
                  ))
              }
            </div>

            {/* Footer note */}
            {!loading && total > 0 && (
              <p className="mt-10 text-center text-xs font-medium text-zinc-400">
                Showing {filtered.length} of {total} resume{total !== 1 ? "s" : ""}
              </p>
            )}
          </>
        )}

        {/* ══════════ COVER LETTERS TAB ══════════ */}
        {activeTab === "cover-letters" && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {coverLettersLoading
                ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                : coverLetters.length === 0
                  ? <EmptyCoverLetterState />
                  : coverLetters.map((cl) => (
                    <CoverLetterCard
                      key={cl.id}
                      coverLetter={cl}
                      onView={handleViewCoverLetter}
                      onEdit={handleEditCoverLetter}
                      onDownload={handleDownloadCoverLetter}
                      onDelete={handleDeleteCoverLetter}
                      downloadingId={clDownloadingId}
                      deletingId={clDeletingId}
                    />
                  ))
              }
            </div>

            {/* Footer note */}
            {!coverLettersLoading && coverLetters.length > 0 && (
              <p className="mt-10 text-center text-xs font-medium text-zinc-400">
                Showing {coverLetters.length} cover letter{coverLetters.length !== 1 ? "s" : ""}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── View Cover Letter Custom Modal ── */}
      {showViewModal && viewingCl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-start shrink-0">
              <div className="min-w-0 pr-8">
                <h3 className="text-lg font-black text-zinc-900 truncate">
                  {viewingCl.job_title ? `Cover Letter: ${viewingCl.job_title}` : "Cover Letter Details"}
                </h3>
                {viewingCl.company_name && (
                  <p className="text-xs font-semibold text-zinc-500 mt-0.5">at {viewingCl.company_name}</p>
                )}
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingCl(null); }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1.5 hover:bg-zinc-100 rounded-full"
                title="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap bg-zinc-50 text-zinc-800 border-b border-zinc-100">
              {viewingCl.cover_letter_text}
            </div>
            <div className="p-6 bg-zinc-50 flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingCl.cover_letter_text);
                  alert("Cover letter text copied to clipboard!");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Text
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowViewModal(false); setViewingCl(null); }}
                  className="px-4 py-2.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all active:scale-95"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const cl = viewingCl;
                    setShowViewModal(false);
                    setViewingCl(null);
                    handleDownloadCoverLetter(cl);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all active:scale-95 shadow-md shadow-purple-100"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
