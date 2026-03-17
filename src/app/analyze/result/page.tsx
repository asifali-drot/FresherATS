"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
        } catch {}
        throw new Error(errorMsg);
      }

      // Handle JSON response (Link) or Blob response (Stream)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const { url } = await response.json();
        if (url) {
          // Direct download via window.location for signed URLs with download header
          window.location.href = url;
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
            href="/analyze"
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
                   className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-600 transition-all active:scale-95 shadow-lg shadow-zinc-200"
                 >
                   {isDownloading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                   ) : user ? "Download Optimized PDF" : "Login to Download Optimized Resume"}
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

              {/* Optimized Resume Preview */}
              <div className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-zinc-900">Optimized Resume Preview</h3>
                  <p className="text-sm text-zinc-500">This is a preview of your professionally styled, ATS-optimized resume.</p>
                </div>
                
                <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md">
                   <div 
                     className="w-full"
                     style={{ backgroundColor: '#f9fafb', height: '800px' }}
                   >
                     <iframe
                        title="Resume Preview"
                        className="w-full h-full border-none"
                        srcDoc={generateResumeHtml(
                          parseResumeText(data.optimizedResume || "").nameLines,
                          parseResumeText(data.optimizedResume || "").sections
                        )}
                     />
                   </div>
                   
                   {/* Gradient Overlay for longer previews */}
                   <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-50/50 to-transparent pointer-events-none" />
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={downloadPDF}
                    disabled={isDownloading}
                    className="group relative flex items-center gap-3 rounded-2xl bg-zinc-900 px-10 py-5 text-base font-bold text-white hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-200"
                  >
                    <span>Download Premium PDF</span>
                    <svg className="h-5 w-5 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <Link href="/analyze" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
               <span>←</span> Analyze another resume
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          {/* About Us Card */}
          <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <span className="text-blue-600">F</span> About Us
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
