import ResumeUpload from "@/components/ResumeUpload";

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-2xl py-10 px-4 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Free ATS Resume Checker
      </h1>
      <p className="mb-6 text-gray-600">
        Upload your resume (PDF or DOCX) and optionally add a job description to get ATS-style feedback and improvement suggestions.
      </p>
      <ResumeUpload />
    </div>
  );
}
