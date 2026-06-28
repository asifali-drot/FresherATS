"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import type { JSONContent } from "@tiptap/core";
import { parseResumeText, generateResumeHtml, ParsedSection } from "@/lib/resume/resumeUtils";
import {
  isResumeDocumentJson,
  resumeDocumentToParsed,
  resumeDocumentToText,
  textToResumeDocument,
  type ResumeDocumentJson,
} from "@/lib/resume/resumeDocument";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { AnalysisResult } from "@/components/Suggestions";
import { getResumeTemplateById, type ResumeTemplateId } from "@/lib/resume/templates";
import { normalizeResumeMarkup } from "@/lib/resume/formatting";
import {
  ResumeTipTapEditor,
  ResumeTipTapInlineEditor,
} from "@/components/resume/ResumeTipTapEditor";
import {
  Edit3,
  Layout,
  FileText,
  ChevronLeft,
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Target,
  Award,
  List,
  Cloud,
  CloudOff,
} from "lucide-react";

// Skills chip editor component
import { SkillsEditor } from "@/components/resume/SkillsEditor";

function applyDocumentToState(
  doc: ResumeDocumentJson,
  setResumeDocument: (d: ResumeDocumentJson) => void,
  setResumeText: (t: string) => void,
  setLocalNameLines: (l: string[]) => void,
  setLocalSections: (s: ParsedSection[]) => void
) {
  setResumeDocument(doc);
  const text = resumeDocumentToText(doc);
  setResumeText(text);
  const parsed = resumeDocumentToParsed(doc);
  setLocalNameLines(parsed.nameLines);
  setLocalSections(parsed.sections);
}

function loadFromPlainText(
  text: string,
  setResumeDocument: (d: ResumeDocumentJson) => void,
  setResumeText: (t: string) => void,
  setLocalNameLines: (l: string[]) => void,
  setLocalSections: (s: ParsedSection[]) => void
) {
  applyDocumentToState(textToResumeDocument(text), setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
}

function ResumeEditorContent() {
  const [resumeText, setResumeText] = useState("");
  const [resumeDocument, setResumeDocument] = useState<ResumeDocumentJson>(() => textToResumeDocument(""));
  const [editorMode, setEditorMode] = useState<"guided" | "raw">("guided");
  const [localNameLines, setLocalNameLines] = useState<string[]>([]);
  const [localSections, setLocalSections] = useState<ParsedSection[]>([]);

  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveReady, setSaveReady] = useState(false);

  const [tailorJobTitle, setTailorJobTitle] = useState<string | null>(null);
  const [tailorCompany, setTailorCompany] = useState<string | null>(null);
  const [tailorKeywords, setTailorKeywords] = useState<string[]>([]);
  const [showKeywordBanner, setShowKeywordBanner] = useState(false);

  const skipAutoSave = useRef(true);

  const { tier, usage, refresh: refreshSubscription } = useSubscription();

  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("template");
  const isTemplateMode = templateIdParam !== null;
  const resolvedTemplateId: ResumeTemplateId | undefined = templateIdParam
    ? getResumeTemplateById(templateIdParam).id
    : undefined;

  const saveResumeDocument = useCallback(
    async (doc: ResumeDocumentJson) => {
      if (!analysisId || !user) return false;
      setSaveStatus("saving");
      try {
        const response = await fetch(`/api/analyses/${analysisId}/resume`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_document: doc }),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const detailMsg = errData.details ? JSON.stringify(errData.details) : "";
          throw new Error((errData.error || "Save failed") + " " + detailMsg);
        }
        setSaveStatus("saved");
        return true;
      } catch (e) {
        console.error("Failed to save resume document", e);
        setSaveStatus("error");
        return false;
      }
    },
    [analysisId, user]
  );

  useEffect(() => {
    async function init() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      const applyAnalysisRow = (row: {
        id: string;
        optimized_resume?: string | null;
        resume_document?: unknown;
      }) => {
        setAnalysisId(row.id);
        const text = row.optimized_resume || "";
        const doc = isResumeDocumentJson(row.resume_document)
          ? row.resume_document
          : textToResumeDocument(text);
        applyDocumentToState(doc, setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
      };

      if (templateIdParam && typeof window !== "undefined") {
        if (!authUser) {
          const params = new URLSearchParams();
          params.set("claim_id", "");
          params.set("redirect", window.location.pathname + window.location.search);
          window.location.href = `/login?${params.toString()}`;
          return;
        }

        const template = getResumeTemplateById(templateIdParam);
        loadFromPlainText(template.seedResumeText, setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
        setAnalysisId(null);
        setIsLoading(false);
        // Template mode has no DB row — don't enable auto-save
        return;
      }

      if (typeof window !== "undefined") {
        const storedTailorTitle = window.sessionStorage.getItem("tailorJobTitle");
        const storedTailorCompany = window.sessionStorage.getItem("tailorCompany");
        const storedTailorKeywords = window.sessionStorage.getItem("tailorKeywords");

        if (storedTailorTitle) {
          setTailorJobTitle(storedTailorTitle);
          setTailorCompany(storedTailorCompany);
          const keywords = storedTailorKeywords ? (JSON.parse(storedTailorKeywords) as string[]) : [];
          setTailorKeywords(keywords);
          if (keywords.length > 0) setShowKeywordBanner(true);

          window.sessionStorage.removeItem("tailorJobTitle");
          window.sessionStorage.removeItem("tailorCompany");
          window.sessionStorage.removeItem("tailorKeywords");

          if (authUser) {
            try {
              const { createClient: createSb } = await import("@/lib/supabase/client");
              const sb = createSb();
              const { data } = await sb
                .from("analyses")
                .select("optimized_resume, resume_document, id")
                .eq("user_id", authUser.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

              if (data) applyAnalysisRow(data);
            } catch (e) {
              console.error("Failed to load latest resume for tailor mode", e);
            }
          } else {
            const stored = window.sessionStorage.getItem("fresherAtsResult");
            if (stored) {
              try {
                const parsed = JSON.parse(stored) as AnalysisResult & {
                  optimizedResume?: string;
                  optimized_resume?: string;
                };
                const text = parsed.optimizedResume || parsed.optimized_resume || "";
                if (text) {
                  loadFromPlainText(text, setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
                  setAnalysisId(parsed.analysis_id || null);
                }
              } catch (e) {
                console.error("Failed to parse stored results in tailor guest mode", e);
              }
            }
          }

          setIsLoading(false);
          skipAutoSave.current = false;
          setSaveReady(true);
          return;
        }

        const stored = window.sessionStorage.getItem("fresherAtsResult");
        const resumeContent = window.sessionStorage.getItem("resumeContent");
        const storedAnalysisId = window.sessionStorage.getItem("analysisId");
        const storedResumeDocument = window.sessionStorage.getItem("resumeDocument");

        if (storedAnalysisId && authUser) {
          try {
            const response = await fetch(`/api/analyses/${storedAnalysisId}/resume`);
            if (response.ok) {
              const payload = await response.json();
              if (payload?.analysis) {
                applyAnalysisRow(payload.analysis);
                window.sessionStorage.removeItem("resumeContent");
                window.sessionStorage.removeItem("analysisId");
                window.sessionStorage.removeItem("resumeDocument");
                setIsLoading(false);
                skipAutoSave.current = false;
                setSaveReady(true);
                return;
              }
            }
          } catch (e) {
            console.error("Failed to fetch resume document from API", e);
          }
        }

        if (stored) {
          try {
            const parsed = JSON.parse(stored) as AnalysisResult & {
              optimizedResume?: string;
              optimized_resume?: string;
            };
            const text = parsed.optimizedResume || parsed.optimized_resume || "";
            loadFromPlainText(text, setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
            setAnalysisId(parsed.analysis_id || null);
          } catch (e) {
            console.error("Failed to parse stored results", e);
          }
        } else if (storedResumeDocument) {
          try {
            const doc = JSON.parse(storedResumeDocument) as ResumeDocumentJson;
            if (isResumeDocumentJson(doc)) {
              applyDocumentToState(doc, setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
            }
          } catch (e) {
            console.error("Failed to parse stored resume document", e);
          }
          setAnalysisId(storedAnalysisId || null);
          window.sessionStorage.removeItem("resumeDocument");
          window.sessionStorage.removeItem("resumeContent");
          window.sessionStorage.removeItem("analysisId");
        } else if (resumeContent) {
          loadFromPlainText(resumeContent, setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
          setAnalysisId(storedAnalysisId || null);
          window.sessionStorage.removeItem("resumeContent");
          window.sessionStorage.removeItem("analysisId");
        }
      }

      setIsLoading(false);
      // Defer enabling auto-save by one tick so React has flushed the initial
      // state updates (resumeDocument, analysisId, user) before the watcher fires.
      setTimeout(() => {
        skipAutoSave.current = false;
        setSaveReady(true);
      }, 0);
    }
    init();
  }, [templateIdParam]);

  useEffect(() => {
    if (!saveReady || !analysisId || !user || editorMode !== "guided") return;
    const timer = setTimeout(() => {
      saveResumeDocument(resumeDocument);
    }, 2000);
    return () => clearTimeout(timer);
  }, [resumeDocument, analysisId, user, editorMode, saveResumeDocument, saveReady]);

  const handlePersonalDocUpdate = (idx: number, content: JSONContent) => {
    setResumeDocument((prev) => {
      const nameLines = [...prev.nameLines];
      nameLines[idx] = content;
      const next = { ...prev, nameLines };
      const text = resumeDocumentToText(next);
      setResumeText(text);
      setLocalNameLines(resumeDocumentToParsed(next).nameLines);
      return next;
    });
  };

  const handleSectionDocUpdate = (idx: number, content: JSONContent) => {
    setResumeDocument((prev) => {
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], content };
      const next = { ...prev, sections };
      const text = resumeDocumentToText(next);
      setResumeText(text);
      setLocalSections(resumeDocumentToParsed(next).sections);
      return next;
    });
  };

  const handleModeChange = (mode: "guided" | "raw") => {
    if (mode === "guided") {
      const doc = textToResumeDocument(resumeText);
      applyDocumentToState(doc, setResumeDocument, setResumeText, setLocalNameLines, setLocalSections);
    }
    setEditorMode(mode);
  };

  const downloadPDF = useCallback(async () => {
    if (isDownloading || !resumeText.trim()) return;

    if (!user) {
      const params = new URLSearchParams();
      params.set("claim_id", analysisId || "");
      params.set("redirect", window.location.pathname + window.location.search);
      window.location.href = `/login?${params.toString()}`;
      return;
    }

    setDownloadError(null);
    setIsDownloading(true);
    try {
      if (analysisId && editorMode === "guided") {
        await saveResumeDocument(resumeDocument);
      }

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, templateId: resolvedTemplateId }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to generate PDF";
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          /* ignore */
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const { url } = await response.json();
        if (url) {
          const pdfRes = await fetch(url);
          const blob = await pdfRes.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = "updated-resume.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
          refreshSubscription();
          return;
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "updated-resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      refreshSubscription();
    } catch (error) {
      console.error(error);
      setDownloadError(error instanceof Error ? error.message : "Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  }, [
    isDownloading,
    resumeText,
    user,
    analysisId,
    resolvedTemplateId,
    editorMode,
    resumeDocument,
    saveResumeDocument,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500 animate-pulse font-medium">Loading Editor...</div>
      </div>
    );
  }

  const previewParsed = parseResumeText(resumeText);
  const previewHtml = generateResumeHtml(previewParsed.nameLines, previewParsed.sections, resolvedTemplateId);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href={isTemplateMode ? "/resume-templates" : "/result"}
            className="group flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-blue-600" />
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Resume Studio</h1>
          </div>
          {analysisId && user && (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
              {saveStatus === "saving" && (
                <>
                  <Cloud className="h-3 w-3 animate-pulse" /> Saving…
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Cloud className="h-3 w-3 text-green-500" /> Saved
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <CloudOff className="h-3 w-3 text-red-500" /> Save failed
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => handleModeChange("guided")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editorMode === "guided" ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            <Layout className="h-3.5 w-3.5" />
            Guided
          </button>
          <button
            onClick={() => handleModeChange("raw")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editorMode === "raw" ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            <FileText className="h-3.5 w-3.5" />
            Raw Text
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/keyword-packs${analysisId ? `?analysis_id=${analysisId}` : ''}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
          >
            <Target className="h-4 w-4 text-blue-500" />
            <span className="hidden sm:inline">Company Match</span>
          </Link>
          <button
            onClick={downloadPDF}
            disabled={isDownloading || !resumeText.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-zinc-200 dark:shadow-none"
          >
            {isDownloading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Generating...</span>
              </div>
            ) : (
              <span className="flex flex-col items-center leading-tight">
                <span>Download Resume</span>
                <span className="text-[10px] font-medium opacity-70 uppercase tracking-widest mt-0.5">
                  {tier === "free" ? `${usage.pdf_downloads}/2 Free Downloads` : "Unlimited Downloads"}
                </span>
              </span>
            )}
          </button>
        </div>

        {downloadError && (
          <div className="px-6 pb-4">
            <p className="text-xs font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full inline-block">
              {downloadError}
            </p>
          </div>
        )}
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden relative">
          {showKeywordBanner && tailorKeywords.length > 0 && (
            <div className="shrink-0 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">
                    🎯 Tailoring for: {tailorJobTitle}
                    {tailorCompany ? ` @ ${tailorCompany}` : ""}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 mb-2">
                    Add these missing keywords to boost your ATS match score:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tailorKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300/60 dark:border-amber-700/40 cursor-pointer hover:bg-amber-200 transition-colors"
                        title="Click to copy"
                        onClick={() => navigator.clipboard.writeText(kw)}
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowKeywordBanner(false)}
                  className="shrink-0 text-amber-400 hover:text-amber-700 p-1 rounded transition-colors"
                  title="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            {editorMode === "guided" && (
              <nav className="w-56 shrink-0 border-r border-zinc-100 dark:border-zinc-900 p-4 overflow-y-auto hidden xl:block">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-4 block">Navigation</span>
                <div className="space-y-1">
                  <a href="#personal-info" className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-50 dark:bg-zinc-900 text-blue-600 border border-blue-100 dark:border-blue-900/50">
                    <User className="h-3.5 w-3.5" />
                    Personal Info
                  </a>
                  {localSections.map((s, idx) => (
                    <a key={idx} href={`#section-${idx}`} className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <List className="h-3.5 w-3.5 opacity-50" />
                      {s.title}
                    </a>
                  ))}
                </div>
              </nav>
            )}

            <div className="flex-1 flex flex-col bg-zinc-50/50 dark:bg-zinc-950 overflow-auto">
              {editorMode === "raw" ? (
                <div className="flex-1 flex flex-col p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      Bulk Editor
                    </h2>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text/plain");
                      const html = e.clipboardData.getData("text/html");
                      const raw = html || pasted;
                      if (!raw || !/<[^>]+>/.test(raw)) return;

                      e.preventDefault();
                      const el = e.currentTarget;
                      const start = el.selectionStart;
                      const end = el.selectionEnd;
                      const normalized = normalizeResumeMarkup(raw);
                      const newText = resumeText.substring(0, start) + normalized + resumeText.substring(end);
                      setResumeText(newText);
                      setTimeout(() => {
                        el.focus();
                        el.setSelectionRange(start + normalized.length, start + normalized.length);
                      }, 0);
                    }}
                    className="flex-1 w-full p-8 font-mono text-xs leading-relaxed border border-zinc-200 dark:border-zinc-800 rounded-2xl resize-none focus:outline-none bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 shadow-sm"
                    spellCheck={false}
                    placeholder="Paste or edit your full resume here..."
                  />
                </div>
              ) : (
                <div className="p-8 space-y-8 max-w-3xl mx-auto w-full h-full flex flex-col overflow-y-auto">
                  <section id="personal-info" className="space-y-4 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Personal Details</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      {resumeDocument.nameLines.map((lineDoc, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                            {idx === 0 ? <User className="h-2.5 w-2.5" /> : idx === 1 ? <Mail className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                            {idx === 0 ? "Full Name" : idx === 1 ? "Contact/Email" : `Link/Location ${idx - 1}`}
                          </label>
                          <ResumeTipTapInlineEditor
                            content={lineDoc}
                            onChange={(content) => handlePersonalDocUpdate(idx, content)}
                            placeholder={idx === 0 ? "Your full name" : "Contact detail"}
                            maxHeight="120px"
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {resumeDocument.sections.map((section, idx) => (
                    <section key={idx} id={`section-${idx}`} className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 shrink-0 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                          {section.title === "EXPERIENCE" ? (
                            <Briefcase className="h-4 w-4" />
                          ) : section.title === "EDUCATION" ? (
                            <GraduationCap className="h-4 w-4" />
                          ) : section.title === "SKILLS" ? (
                            <Code className="h-4 w-4" />
                          ) : section.title === "SUMMARY" ? (
                            <Target className="h-4 w-4" />
                          ) : section.title === "PROJECTS" ? (
                            <Award className="h-4 w-4" />
                          ) : (
                            <List className="h-4 w-4" />
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{section.title}</h3>
                      </div>
                      <div className="flex-1">
                        {section.title === "SKILLS" ? (
                          <SkillsEditor
                            content={section.content}
                            onChange={(content) => handleSectionDocUpdate(idx, content)}
                            placeholder="Add skills (comma separated)..."
                            maxHeight="360px"
                          />
                        ) : (
                          <ResumeTipTapEditor
                            content={section.content}
                            onChange={(content) => handleSectionDocUpdate(idx, content)}
                            placeholder={`Update your ${section.title.toLowerCase()}...`}
                            hint="Formatting is saved as JSON and synced to the preview automatically."
                            minHeight={`${Math.max(160, (localSections[idx]?.content.length ?? 4) * 28)}px`}
                            maxHeight="360px"
                          />
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-zinc-100 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between px-6 py-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">High-Fidelity Preview</span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-500/50 animate-pulse" />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Syncing live</span>
            </div>
          </div>
          <div className="flex-1 p-8 overflow-y-auto flex justify-center bg-zinc-200/20 dark:bg-zinc-950/20 scrollbar-hide">
            <div className="w-full max-w-200 h-fit min-h-275 bg-white shadow-2xl rounded-sm overflow-hidden transition-all duration-300">
              <iframe title="Resume Preview" className="w-full h-275 border-none" srcDoc={previewHtml} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResumeEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="text-zinc-500 animate-pulse font-medium">Loading Editor...</div>
        </div>
      }
    >
      <ResumeEditorContent />
    </Suspense>
  );
}
