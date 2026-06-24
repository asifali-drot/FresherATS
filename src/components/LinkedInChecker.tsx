"use client";

import React, { useState } from "react";
import {
  Linkedin,
  Briefcase,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import ATSScore from "@/components/ATSScore";
import LinkedInScoreBar from "@/components/linkedin/LinkedInScoreBar";
import KeywordGap from "@/components/linkedin/KeywordGap";
import SectionBreakdown from "@/components/linkedin/SectionBreakdown";
import type { LinkedInAnalysisResult } from "@/app/api/analyze-linkedin/route";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeOverlay from "@/components/UpgradeOverlay";

type AnalysisState = "idle" | "analyzing" | "done" | "error";

export default function LinkedInChecker() {
  const [profileText, setProfileText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [state, setState] = useState<AnalysisState>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<LinkedInAnalysisResult | null>(null);
  // Tier comes from API response — no login required for basic analysis
  const [resultTier, setResultTier] = useState<string>("free");

  // Still fetch subscription for the Optimizer overlay (in case user logs in later)
  const { tier: hookTier } = useSubscription();
  // Use API-returned tier if we have a result; fallback to hook for live state
  const isOptimizerLocked = (result ? resultTier : hookTier) !== "pro";

  const canAnalyze = profileText.trim().length >= 30;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setError("");
    setResult(null);
    setState("analyzing");

    try {
      const payload: Record<string, string> = {
        jobDescription,
        profileText: profileText.trim(),
      };

      const res = await fetch("/api/analyze-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setState("error");
        setError(data.error || "Failed to analyze your profile. Please try again.");
        return;
      }

      setResult(data.result as LinkedInAnalysisResult);
      setResultTier(data.tier ?? "free");
      setState("done");

      setTimeout(() => {
        document
          .getElementById("li-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setState("error");
      setError("Network error. Please check your connection and try again.");
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setResultTier("free");
    setError("");
    setProfileText("");
    setJobDescription("");
    setShowJD(false);
  };

  const isLoading = state === "analyzing";
  const charCount = profileText.length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ── Input Card ── */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="li-profile-text"
              className="block text-sm font-extrabold text-zinc-800"
            >
              <span className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-[#0077B5]" />
                LinkedIn Profile Text
                <span className="text-red-500">*</span>
              </span>
            </label>

            {/* How-to guide */}
            <div className="rounded-xl border border-[#0077B5]/15 bg-[#0077B5]/5 px-4 py-3 mb-2">
              <p className="text-xs font-bold text-[#004B77] mb-1.5">
                How to copy your profile text
              </p>
              <ol className="text-xs text-zinc-600 font-medium space-y-0.5 list-decimal list-inside leading-relaxed">
                <li>
                  Open your LinkedIn profile in a browser
                </li>
                <li>
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-[10px] font-mono">
                    Ctrl+A
                  </kbd>{" "}
                  to select all, then{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-[10px] font-mono">
                    Ctrl+C
                  </kbd>{" "}
                  to copy
                </li>
                <li>
                  Paste below — AI will extract the relevant sections
                </li>
              </ol>
            </div>

            <textarea
              id="li-profile-text"
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="Paste your full LinkedIn profile text here… (Headline, About, Experience, Skills, Education, Certifications)"
              rows={10}
              disabled={isLoading}
              className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0077B5]/40 focus:border-[#0077B5]/60 disabled:opacity-60 transition-all leading-relaxed"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-zinc-400 font-medium">
                Min. 30 characters required
              </p>
              <p
                className={`text-xs font-semibold tabular-nums ${charCount < 30 && charCount > 0
                    ? "text-red-500"
                    : "text-zinc-400"
                  }`}
              >
                {charCount.toLocaleString()} chars
              </p>
            </div>
          </div>

          {/* ── Job Description Toggle ── */}
          <div>
            <button
              type="button"
              onClick={() => setShowJD(!showJD)}
              className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              Add Target Job Description
              <span className="text-[10px] font-medium text-zinc-400 ml-1">
                (optional — improves keyword matching)
              </span>
              {showJD ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showJD && (
              <div className="mt-3">
                <textarea
                  id="li-job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description for the role you're targeting…"
                  rows={5}
                  disabled={isLoading}
                  className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/60 disabled:opacity-60 transition-all leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* ── Error Message ── */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* ── CTA Buttons ── */}
          {/* LinkedIn is FREE for all — no login or limit required */}
          <div className="flex items-center gap-3 pt-1">
            <button
              id="li-analyze-btn"
              onClick={handleAnalyze}
              disabled={isLoading || !canAnalyze}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#0077B5] px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-[#0077B5]/25 hover:bg-[#005e93] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Profile…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze My Profile
                </>
              )}
            </button>

            {state === "done" && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="rounded-3xl border border-zinc-100 bg-white shadow-sm p-10 flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-4 border-[#0077B5]/20 animate-ping" />
            <div className="h-16 w-16 rounded-full bg-[#0077B5]/10 flex items-center justify-center">
              <Linkedin className="h-8 w-8 text-[#0077B5]" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base font-extrabold text-zinc-800">
              AI is analyzing your profile…
            </p>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              This usually takes 10–20 seconds
            </p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {state === "done" && result && (
        <div id="li-results" className="space-y-6">
          {/* Summary Banner */}
          <div className="rounded-3xl border border-zinc-200 bg-linear-to-br from-[#0077B5]/5 to-purple-50/40 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[#0077B5]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#0077B5]">
                AI Summary
              </span>
            </div>
            <p className="text-zinc-700 text-sm leading-relaxed font-medium">
              {result.summary}
            </p>
          </div>

          {/* Score Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Overall Score */}
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-[#0077B5]" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Overall Score
                </span>
              </div>
              <ATSScore score={result.overallScore} />
              <p className="text-[11px] text-zinc-500 font-medium text-center mt-1">
                Profile completeness &amp; professional branding
              </p>
            </div>

            {/* Keyword Score */}
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Keyword Score
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-4">
                <LinkedInScoreBar
                  score={result.keywordScore}
                  label="Keyword Match"
                  delay={300}
                />

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
                    <p className="text-2xl font-black text-emerald-600">
                      {result.keywordsPresent.length}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mt-0.5">
                      Present
                    </p>
                  </div>
                  <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
                    <p className="text-2xl font-black text-red-500">
                      {result.keywordsMissing.length}
                    </p>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mt-0.5">
                      Missing
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 font-medium">
                  {jobDescription
                    ? "Matched against your target job description"
                    : "Matched against industry standards for your field"}
                </p>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="relative rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 overflow-hidden">
            <SectionBreakdown sections={result.sections} />
            {isOptimizerLocked && (
              <UpgradeOverlay
                title="Full LinkedIn Optimizer"
                description="Upgrade to Pro to unlock detailed section-by-section feedback and keyword gap analysis."
                requiredTier="pro"
              />
            )}
          </div>

          {/* Keyword Gap */}
          <div className="relative rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 overflow-hidden">
            <KeywordGap
              present={result.keywordsPresent}
              missing={result.keywordsMissing}
            />
            {isOptimizerLocked && (
              <UpgradeOverlay
                title="Keyword Gap Analysis"
                description="Upgrade to Pro to see exactly which keywords you're missing."
                requiredTier="pro"
              />
            )}
          </div>

          {/* Cross-sell CTA */}
          <div className="rounded-3xl border border-[#0077B5]/20 bg-linear-to-r from-[#0077B5] to-[#005e93] p-6 text-white flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="font-extrabold text-base">Also check your resume?</p>
              <p className="text-sm text-white/80 font-medium mt-0.5">
                Get your ATS score, keyword analysis, and an optimized version
                of your resume — free.
              </p>
            </div>
            <a
              href="/#analyze"
              className="shrink-0 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0077B5] hover:bg-white/90 transition-all shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Resume
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
