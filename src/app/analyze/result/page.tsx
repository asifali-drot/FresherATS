"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Suggestions, { type AnalysisResult } from "@/components/Suggestions";

export default function AnalyzeResultPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem("fresherAtsResult");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as AnalysisResult;
      setData(parsed);
    } catch {
      // ignore parse errors
    }
  }, []);

  const downloadPDF = async () => {
    if (!data?.optimizedResume || isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText: data.optimizedResume }),
      });

      if (!response.ok) {
        // Try to get the error message from the API
        let errorMsg = 'Failed to generate PDF';
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // response wasn't JSON, use default message
        }
        throw new Error(errorMsg);
      }

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
  };

  const score = typeof data?.score === "number" ? data.score : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your ATS Analysis</h1>
        <p className="mt-2 text-sm text-gray-600">
          This overview is based on your uploaded resume and the job description (if provided).
        </p>
      </div>

      {!data && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-700">
          <p>No recent analysis found. Please upload your resume first.</p>
          <Link
            href="/analyze"
            className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Go to analyzer
          </Link>
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Overall ATS-style score
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Higher scores usually mean a better initial match for automated screeners.
              </p>
            </div>
            {score !== null && (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">{score}</span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            )}
          </div>

          <Suggestions data={data} />

          {data?.optimizedResume && (
            <div className="flex flex-col items-center gap-2 pt-4">
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isDownloading ? "Generating PDF..." : "Download Optimized Resume (PDF)"}
              </button>
              {downloadError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {downloadError}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
            <Link href="/analyze" className="hover:text-gray-800">
              ← Analyze another resume
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

