"use client";

import React, { useState, useEffect, useRef } from "react";
import { PackSummary, PackScanResult } from "@/lib/keyword-packs/types";
import ATSScore from "@/components/ATSScore";
import UpgradeOverlay from "@/components/UpgradeOverlay";
import { useSubscription } from "@/hooks/useSubscription";
import { track } from "@vercel/analytics";
import { ChevronDown, FileText, CheckCircle2, XCircle, AlertTriangle, Info, RefreshCw } from "lucide-react";

interface PackScannerProps {
  packs: PackSummary[];
  initialAnalysisId?: string;
  initialResumeText?: string;
}

export default function PackScanner({ packs, initialAnalysisId, initialResumeText }: PackScannerProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id || "");
  const [resumeText, setResumeText] = useState<string>(initialResumeText || "");
  const [analysisId, setAnalysisId] = useState<string | undefined>(initialAnalysisId);
  const [useSavedResume, setUseSavedResume] = useState<boolean>(!!initialAnalysisId);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<(Partial<PackScanResult> & { gated?: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { tier, user } = useSubscription();

  useEffect(() => {
    // If not using saved resume, but we have text, we are ready.
    // If using saved resume, we need analysisId.
    if (!analysisId && useSavedResume) {
      setUseSavedResume(false);
    }
  }, [analysisId, useSavedResume]);

  const handleScore = async () => {
    if (!selectedPackId) {
      setError("Please select a company pack.");
      return;
    }
    if (!useSavedResume && !resumeText.trim()) {
      setError("Please paste your resume text.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    track("pack_scan_started", { packId: selectedPackId });

    try {
      const res = await fetch("/api/keyword-packs/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: selectedPackId,
          resumeText: useSavedResume ? undefined : resumeText,
          analysisId: useSavedResume ? analysisId : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to score resume");
      }

      setResult(data.result);
      
      let scoreBucket = "0-25";
      if (data.result.overall > 75) scoreBucket = "76-100";
      else if (data.result.overall > 50) scoreBucket = "51-75";
      else if (data.result.overall > 25) scoreBucket = "26-50";
      
      track("pack_scan_completed", { packId: selectedPackId, scoreBucket });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    track("pack_upgrade_clicked", { packId: selectedPackId, source: "scanner" });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Input Section */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Target a Specific Company</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-zinc-700">Select Company Pack</label>
            <div className="relative">
              <select
                value={selectedPackId}
                onChange={(e) => setSelectedPackId(e.target.value)}
                className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
              >
                {packs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company} • {p.role} ({p.level})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
            {selectedPackId && (
              <p className="text-xs text-zinc-500 mt-1">
                Optimizes for {packs.find(p => p.id === selectedPackId)?.ats} ATS logic and company values.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-zinc-700 flex justify-between">
              <span>Resume Source</span>
              {analysisId && (
                <button 
                  onClick={() => setUseSavedResume(!useSavedResume)}
                  className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                >
                  {useSavedResume ? "Switch to Paste Text" : "Use Saved Resume"}
                </button>
              )}
            </label>
            
            {useSavedResume && analysisId ? (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Using latest uploaded resume</span>
              </div>
            ) : (
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-zinc-500 max-w-sm">
            We don't store your raw resume text from this tool, only the computed keyword scores.
          </p>
          <button
            onClick={handleScore}
            disabled={loading || (!selectedPackId)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20 active:scale-95"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <SparklesIcon className="h-4 w-4" />}
            {loading ? "Scanning..." : "Score My Resume"}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Overall Match</h3>
              <ATSScore score={result.overall || 0} />
            </div>

            {/* Sub-scores */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col justify-center gap-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">Hard Skills Match</h3>
                    <p className="text-sm text-zinc-500">Technical requirements & tools</p>
                  </div>
                  <span className="text-2xl font-black text-zinc-900">{result.hardScore}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${result.hardScore || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">Values & Culture Match</h3>
                    <p className="text-sm text-zinc-500">Company-specific behavioral cues</p>
                  </div>
                  <span className="text-2xl font-black text-zinc-900">{result.valuesScore}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${result.valuesScore || 0}%` }}
                  />
                </div>
              </div>

              {result.redFlagPenalty ? (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                  <p>
                    <strong>Red flags detected (-{result.redFlagPenalty} penalty).</strong> 
                    You used words that indicate lack of confidence or ownership.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            
            {result.gated && (
              <div onClick={handleUpgradeClick}>
                <UpgradeOverlay 
                  title="Unlock Detailed Breakdown" 
                  description="Upgrade to Starter to see exactly which keywords you're missing, view sample rewrites, and get detailed ATS formatting tips." 
                />
              </div>
            )}
            
            {/* Hard Skills Details */}
            <div className={`bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col gap-6 ${result.gated ? 'blur-sm select-none' : ''}`}>
              <h3 className="font-bold text-zinc-900 text-lg border-b border-zinc-100 pb-4">Hard Skills Breakdown</h3>
              
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Matched Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedHardSkills && result.matchedHardSkills.length > 0 ? (
                      result.matchedHardSkills.map((skill, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-400 italic">None matched</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" /> Missing Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingHardSkills && result.missingHardSkills.length > 0 ? (
                      result.missingHardSkills.map((skill, i) => (
                        <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-400 italic">None missing!</span>
                    )}
                  </div>
                </div>
                
                {result.matchedNiceToHave && result.matchedNiceToHave.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-blue-500" /> Bonus Points (Nice-to-Have)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedNiceToHave.map((skill, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Values & Formatting */}
            <div className={`bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col gap-6 ${result.gated ? 'blur-sm select-none' : ''}`}>
              <h3 className="font-bold text-zinc-900 text-lg border-b border-zinc-100 pb-4">Values & ATS Formatting</h3>
              
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                    Culture & Values
                  </h4>
                  <div className="space-y-3">
                    {result.missingValues?.map((val, i) => (
                      <div key={`m-${i}`} className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                        <p className="text-xs font-bold text-amber-800 mb-1">Missing: {val.label}</p>
                        <p className="text-xs text-amber-700">{val.description}</p>
                      </div>
                    ))}
                    {result.matchedValues?.map((val, i) => (
                      <div key={`y-${i}`} className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-800 mb-1">Matched: {val.label}</p>
                          <p className="text-xs text-emerald-700">{val.description}</p>
                        </div>
                        <span className="shrink-0 bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full">
                          {val.hits} mentions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.formattingChecklist && result.formattingChecklist.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                      ATS Format Checklist ({result.ats})
                    </h4>
                    <div className="space-y-2">
                      {result.formattingChecklist.map((item, i) => (
                        <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-sm ${item.severity === 'warn' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                          {item.severity === 'warn' ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> : <Info className="h-4 w-4 shrink-0 mt-0.5" />}
                          <p>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Suggested Verbs & Rewrites */}
            <div className={`lg:col-span-2 bg-zinc-900 rounded-3xl p-8 shadow-sm text-zinc-100 flex flex-col gap-6 ${result.gated ? 'blur-sm select-none' : ''}`}>
              <h3 className="font-bold text-white text-xl border-b border-zinc-800 pb-4 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-400" /> Resume Upgrade Tips
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-widest">Recommended Action Verbs</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedVerbs?.map((verb, i) => (
                      <span key={i} className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                        {verb}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-widest">New Grad Emphasis</h4>
                  <ul className="space-y-2">
                    {result.newGradEmphasis?.map((emp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{emp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.sampleRewrites && result.sampleRewrites.length > 0 && (
                <div className="mt-4 pt-6 border-t border-zinc-800">
                  <h4 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-widest">Sample Rewrites</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.sampleRewrites.map((rewrite, i) => (
                      <div key={i} className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-800">
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Before</p>
                          <p className="text-sm text-zinc-400 line-through decoration-red-500/50">{rewrite.before}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">After</p>
                          <p className="text-sm text-zinc-200">{rewrite.after}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
