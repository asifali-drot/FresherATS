"use client";

import { usePathname } from "next/navigation";

export default function FooterDownloadCTA() {
  const pathname = usePathname();
  const isResultPage = pathname === "/result";

  if (!isResultPage) return null;

  const downloadPDF = async () => {
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
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold transition-all hover:bg-blue-700 active:scale-95 flex flex-col items-center justify-center leading-tight shadow-lg shadow-blue-500/20"
        >
          <span className="text-white">Download Resume</span>
          <span className="text-[10px] text-white font-medium uppercase tracking-widest mt-1 opacity-90">
            FREE - Limited Time
          </span>
        </button>
      </div>
    </div>
  );
}
