"use client";

import { usePathname } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function FooterDownloadCTA() {
  const pathname = usePathname();
  const isResultPage = pathname === "/result";
  const { tier, usage } = useSubscription();

  if (!isResultPage) return null;

  const isLimitReached = tier === "free" && usage.pdf_downloads >= 2;

  const downloadPDF = async () => {
    if (isLimitReached) {
      alert("You have reached your 2 free PDF downloads for this month. Please upgrade to Tier 2.");
      return;
    }

    const stored = window.sessionStorage.getItem("fresherAtsResult");
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      const analysisId = data.analysis_id;
      const resumeText = data.optimizedResume || data.optimized_resume;

      if (!resumeText) {
        alert("No optimized resume content found. Please try analyzing your resume again.");
        return;
      }

      let response: Response;

      // If we have an analysisId, try the storage-based download
      if (analysisId) {
        response = await fetch('/api/download-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId }),
        });
      } else {
        // Fallback for guests or missing IDs
        response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText }),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate PDF');
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
          return;
        }
      }

      // Fallback for blob response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized-resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      alert(error.message || 'Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-2 lg:col-start-4 lg:items-end">
      <div className="flex flex-col gap-4 rounded-3xl bg-[#1c212e] p-6 text-center text-white shadow-xl w-full max-w-75">
        <button
          onClick={downloadPDF}
          disabled={isLimitReached}
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-95 flex flex-col items-center justify-center leading-tight shadow-lg ${
            isLimitReached 
              ? "bg-gray-700 text-gray-400 cursor-not-allowed shadow-none" 
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
          }`}
        >
          {isLimitReached ? (
            <>
              <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Download Locked</span>
              <span className="text-[10px] text-gray-400 font-medium tracking-widest mt-1">
                LIMIT REACHED
              </span>
            </>
          ) : (
            <>
              <span className="text-white">Download Resume</span>
              <span className="text-[10px] text-white font-medium uppercase tracking-widest mt-1 opacity-90">
                {tier === "free" ? `${2 - usage.pdf_downloads} REMAINING` : "UNLIMITED"}
              </span>
            </>
          )}
        </button>
        {isLimitReached && (
          <Link href="/pricing" className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2">
            Upgrade to Tier 2 for Unlimited Downloads
          </Link>
        )}
      </div>
    </div>
  );
}
