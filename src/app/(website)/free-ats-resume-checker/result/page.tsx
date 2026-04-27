"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Suggestions, { type AnalysisResult } from "@/components/Suggestions";
import ATSScore from "@/components/ATSScore";
import { parseResumeText, generateResumeHtml } from "@/lib/resume/resumeUtils";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

function AnalyzeResultContent() {
  const [data, setData] = useState<AnalysisResult | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasTriggeredAuto = useRef(false);

  useEffect(() => {
    async function checkUser() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    checkUser();

    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem("fresherAtsResult");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as AnalysisResult & { optimized_resume?: string };
      // Ensure we handle both naming conventions
      if (parsed.optimized_resume && !parsed.optimizedResume) {
        parsed.optimizedResume = parsed.optimized_resume;
      }
      setData(parsed);
    } catch {
      // ignore parse errors
    }
  }, []);

  const downloadPDF = useCallback(async () => {
    if (isDownloading) return;

    if (!user) {
      // Redirect to login to claim this analysis
      const params = new URLSearchParams();
      params.set("claim_id", data?.analysis_id || "");
      params.set("redirect", window.location.pathname);
      window.location.href = `/login?${params.toString()}`;
      return;
    }

    // Require either a DB-backed ID or the local optimized text
    if (!data?.analysis_id && !data?.optimizedResume) return;

    setIsDownloading(true);
    setDownloadError(null);
    try {
      let response: Response;

      if (data?.analysis_id) {
        response = await fetch('/api/download-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId: data.analysis_id }),
        });
      } else {
        response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: data.optimizedResume }),
        });
      }

      if (!response.ok) {
        let errorMsg = 'Failed to generate PDF';
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch { }
        throw new Error(errorMsg);
      }

      // Handle JSON response (Link) or Blob response (Stream)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const { url } = await response.json();
        if (url) {
          // Fetch the signed URL to get the blob and force download
          const pdfRes = await fetch(url);
          const blob = await pdfRes.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = 'optimized-resume.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
          return;
        }
      }

      // Fallback for Blob (Legacy or Guest without storage)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized-resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError(
        error instanceof Error ? error.message : 'Failed to download PDF'
      );
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, user, data]);
  
  const handlePreview = useCallback(() => {
    if (!user) {
      const params = new URLSearchParams();
      params.set("claim_id", data?.analysis_id || "");
      params.set("redirect", "/free-ats-resume-checker/editor");
      router.push(`/login?${params.toString()}`);
      return;
    }
    router.push("/free-ats-resume-checker/editor");
  }, [user, data, router]);

  // Auto-download effect
  useEffect(() => {
    if (user && data && searchParams.get('download') === 'auto' && !hasTriggeredAuto.current) {
      hasTriggeredAuto.current = true;
      downloadPDF();
    }
  }, [user, data, searchParams, downloadPDF]);

  if (!data) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900">No Analysis Found</h2>
          <p className="mt-2 text-zinc-600">Please upload your resume first to see the analysis results.</p>
          <Link
            href="/free-ats-resume-checker"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            Go to Analyzer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          <div className="flex flex-col gap-8 rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-10">
              <ATSScore score={data.score ?? 72} />

              <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={downloadPDF}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-600 transition-all active:scale-95 shadow-lg shadow-zinc-200 w-full justify-center"
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <span className="flex flex-col items-center leading-tight">
                        <span>Download Resume</span>
                        <span className="text-[10px] font-medium opacity-70 uppercase tracking-widest mt-0.5">
                          FREE - Limited Time
                        </span>
                      </span>
                    )}

                  </button>

                <button
                  onClick={handlePreview}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-8 py-4 text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Preview & Edit Resume
                </button>
                {downloadError && (
                  <p className="text-xs font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full">
                    {downloadError}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-zinc-100 w-full" />

            <Suggestions data={data} />

          </div>

          <div className="flex items-center justify-between px-2">
            <Link href="/free-ats-resume-checker" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
              <span>←</span> Analyze another resume
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          {/* About Us Card */}
          <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              {/* <span className="text-blue-600"></span>About Us */}
              About Us
            </h3>
            <div className="mt-6 space-y-4">
              <h4 className="font-bold text-zinc-800">Helping Fresh Graduates Get Hired</h4>
              <p className="text-sm leading-relaxed text-zinc-600">
                We are a small team passionate about helping students land their first job by making their resumes ATS-friendly.
              </p>
            </div>
          </div>

          {/* Blog Card */}
          <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="font-bold text-zinc-900">FresherATS Blog</h3>
            </div>
            <div className="mt-6 flex flex-col gap-8">
              <h4 className="text-lg font-bold text-zinc-800">Tips & Advice for Landing Your First Job</h4>

              <div className="flex flex-col gap-6">
                {/* Blog post item 1 */}
                <div className="flex gap-4">
                  <div className="h-20 w-24 shrink-0 rounded-xl bg-zinc-100 overflow-hidden relative">
                    <Image src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=200" alt="post" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-sm font-bold text-zinc-900 leading-snug">Top 5 ATS Resume Mistakes to Avoid</h5>
                    <Link href="/blog/mistakes" className="text-xs font-bold text-blue-600 hover:underline">Read More</Link>
                  </div>
                </div>

                {/* Blog post item 2 */}
                <div className="flex gap-4">
                  <div className="h-20 w-24 shrink-0 rounded-xl bg-zinc-100 overflow-hidden relative">
                    <Image src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200" alt="post" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-sm font-bold text-zinc-900 leading-snug">How to Tailor Your Resume for Any Job</h5>
                    <Link href="/blog/tailor" className="text-xs font-bold text-blue-600 hover:underline">Read More</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzeResultPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-zinc-600">Loading analysis results...</div>}>
      <AnalyzeResultContent />
    </Suspense>
  );
}
