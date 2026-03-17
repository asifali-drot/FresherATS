"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import JDInput from "./JDInput";
import type { AnalysisResult } from "./Suggestions";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleUpload = async () => {
    setError(null);

    if (!file) {
      setError("Please upload a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `Server returned ${res.status}`);
      }

      const payload: AnalysisResult = {
        success: data.success,
        score: data.score,
        summary: data.summary,
        suggestions: data.suggestions,
        missingKeywords: data.missingKeywords,
        result: data.result,
        optimizedResume: data.optimized_resume, // API returns optimized_resume
        analysis_id: data.analysis_id ?? null,  // store DB row ID for download
      };

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("fresherAtsResult", JSON.stringify(payload));
      }

      router.push("/analyze/result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e) || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (fileList: FileList | null) => {
    const selected = fileList?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer?.files ?? null);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-800">
          Resume (PDF or DOCX)
        </label>

        <div
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-black hover:bg-gray-100"
        >
          <p className="text-sm font-medium text-gray-800">
            {file ? "Change uploaded resume" : "Drop your resume here or click to upload"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Accepted formats: PDF, DOCX (max ~5MB recommended)
          </p>
          {file && (
            <p className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
              Selected: {file.name}
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name="resume"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>

      <JDInput
        value={jobDescription}
        onChange={setJobDescription}
        label="Job description (optional)"
        placeholder="Paste the job description to get tailored feedback..."
      />

      <button
        onClick={handleUpload}
        className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
