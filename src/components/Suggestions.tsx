"use client";

export interface AnalysisResult {
  success?: boolean;
  score?: number;
  summary?: string;
  suggestions?: string[];
  result?: string;
  optimizedResume?: string;
}

interface SuggestionsProps {
  data: AnalysisResult | null;
}

export default function Suggestions({ data }: SuggestionsProps) {
  if (!data) return null;

  const score = data.score;
  const summary = data.summary;
  const suggestions = data.suggestions ?? [];

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
      <h4 className="font-semibold text-gray-900">AI Analysis</h4>

      {typeof score === "number" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">ATS-style score:</span>
          <span
            className={`inline-flex rounded-full px-3 py-0.5 text-sm font-medium ${
              score >= 70
                ? "bg-green-100 text-green-800"
                : score >= 50
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {score}/100
          </span>
        </div>
      )}

      {summary && (
        <div>
          <p className="text-sm font-medium text-gray-700">Summary</p>
          <p className="mt-1 text-sm text-gray-600">{summary}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">Suggestions</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
            {suggestions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {!summary && !suggestions.length && data.result && (
        <pre className="whitespace-pre-wrap rounded bg-white p-3 text-sm text-gray-700">
          {data.result}
        </pre>
      )}
    </div>
  );
}
