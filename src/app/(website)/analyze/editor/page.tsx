"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { parseResumeText, generateResumeHtml, ParsedSection } from "@/lib/resume/resumeUtils";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { AnalysisResult } from "@/components/Suggestions";
import { Edit3, Layout, FileText, Download, ChevronLeft, User, Mail, MapPin, Briefcase, GraduationCap, Code, Target,
  Award,
  List,
  Highlighter
} from "lucide-react";

export default function ResumeEditorPage() {
  const [resumeText, setResumeText] = useState("");
  const [editorMode, setEditorMode] = useState<'guided' | 'raw'>('guided');
  const [localNameLines, setLocalNameLines] = useState<string[]>([]);
  const [localSections, setLocalSections] = useState<ParsedSection[]>([]);
  
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (typeof window !== "undefined") {
        const stored = window.sessionStorage.getItem("fresherAtsResult");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as AnalysisResult & { optimizedResume?: string; optimized_resume?: string };
            const text = parsed.optimizedResume || parsed.optimized_resume || "";
            setResumeText(text);
            setAnalysisId(parsed.analysis_id || null);
            
            // Initial parse for guided mode
            const { nameLines, sections } = parseResumeText(text);
            setLocalNameLines(nameLines);
            setLocalSections(sections);
          } catch (e) {
            console.error("Failed to parse stored results", e);
          }
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  // Sync resumeText when in guided mode
  const syncToText = useCallback((nameLines: string[], sections: ParsedSection[]) => {
    const newText = [
      ...nameLines,
      "", // Empty line after contact info
      ...sections.flatMap(s => [`${s.title}`, ...s.content, ""])
    ].join("\n");
    setResumeText(newText);
  }, []);

  const handlePersonalUpdate = (idx: number, val: string) => {
    const updated = [...localNameLines];
    updated[idx] = val;
    setLocalNameLines(updated);
    if (editorMode === 'guided') syncToText(updated, localSections);
  };

  const handleSectionUpdate = (sIdx: number, val: string) => {
    const updated = [...localSections];
    updated[sIdx] = { ...updated[sIdx], content: val.split("\n") };
    setLocalSections(updated);
    if (editorMode === 'guided') syncToText(localNameLines, updated);
  };

  const handleModeChange = (mode: 'guided' | 'raw') => {
    if (mode === 'guided') {
      const { nameLines, sections } = parseResumeText(resumeText);
      setLocalNameLines(nameLines);
      setLocalSections(sections);
    }
    setEditorMode(mode);
  };

  const downloadPDF = useCallback(async () => {
    if (isDownloading || !resumeText) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumeText }),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');

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
          a.download = 'updated-resume.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
          return;
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'updated-resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, resumeText]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500 animate-pulse font-medium">Loading Editor...</div>
      </div>
    );
  }

  const previewHtml = generateResumeHtml(localNameLines, localSections);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
      {/* Dynamic Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/analyze/result"
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
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
           <button 
             onClick={() => handleModeChange('guided')}
             className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editorMode === 'guided' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
           >
             <Layout className="h-3.5 w-3.5" />
             Guided
           </button>
           <button 
             onClick={() => handleModeChange('raw')}
             className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editorMode === 'raw' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
           >
             <FileText className="h-3.5 w-3.5" />
             Raw Text
           </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadPDF}
            disabled={isDownloading || !resumeText}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-zinc-200 dark:shadow-none"
          >
            {isDownloading ? (
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : <Download className="h-4 w-4" />}
            Download Resume
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Editor Side */}
        <div className="w-1/2 flex border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden relative">
          
          {editorMode === 'guided' && (
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

          <div className="flex-1 flex flex-col overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950">
            {editorMode === 'raw' ? (
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
                  className="flex-1 w-full p-8 font-mono text-xs leading-relaxed border border-zinc-200 dark:border-zinc-800 rounded-2xl resize-none focus:outline-none bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 shadow-sm"
                  spellCheck="false"
                  placeholder="Paste or edit your full resume here..."
                />
              </div>
            ) : (
              <div className="p-8 space-y-8 max-w-3xl mx-auto w-full">
                
                {/* Personal Info Section */}
                <section id="personal-info" className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                         <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Personal Details</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      {localNameLines.map((line, idx) => (
                        <div key={idx} className="space-y-1.5">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                                 {idx === 0 ? <User className="h-2.5 w-2.5" /> : idx === 1 ? <Mail className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                                 {idx === 0 ? 'Full Name' : idx === 1 ? 'Contact/Email' : `Link/Location ${idx - 1}`}
                              </label>
                              <div className="flex items-center gap-1">
                                 <button 
                                   onClick={() => {
                                      const textarea = document.getElementById(`personal-${idx}`) as HTMLInputElement;
                                      if (!textarea) return;
                                      const start = textarea.selectionStart || 0;
                                      const end = textarea.selectionEnd || 0;
                                      const text = textarea.value;
                                      const selected = text.substring(start, end);
                                      
                                      let replacement = "";
                                      if (selected.startsWith('**') && selected.endsWith('**')) {
                                        replacement = selected.slice(2, -2);
                                      } else {
                                        replacement = `**${selected}**`;
                                      }
                                      
                                      handlePersonalUpdate(idx, text.substring(0, start) + replacement + text.substring(end));
                                      setTimeout(() => {
                                        textarea.focus();
                                        textarea.setSelectionRange(start, start + replacement.length);
                                      }, 0);
                                   }}
                                   title="Toggle Bold"
                                   className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                 >
                                    <span className="text-[10px] font-bold">B</span>
                                 </button>
                                 <button 
                                   onClick={() => {
                                      const textarea = document.getElementById(`personal-${idx}`) as HTMLInputElement;
                                      if (!textarea) return;
                                      const start = textarea.selectionStart || 0;
                                      const end = textarea.selectionEnd || 0;
                                      const text = textarea.value;
                                      const selected = text.substring(start, end);
                                      
                                      let replacement = "";
                                      if (selected.startsWith('==') && selected.endsWith('==')) {
                                        replacement = selected.slice(2, -2);
                                      } else {
                                        replacement = `==${selected}==`;
                                      }
                                      
                                      handlePersonalUpdate(idx, text.substring(0, start) + replacement + text.substring(end));
                                      setTimeout(() => {
                                        textarea.focus();
                                        textarea.setSelectionRange(start, start + replacement.length);
                                      }, 0);
                                   }}
                                   title="Toggle Highlight"
                                   className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                 >
                                    <Highlighter className="h-2.5 w-2.5" />
                                 </button>
                              </div>
                           </div>
                           <input 
                             id={`personal-${idx}`}
                             type="text" 
                             value={line} 
                             onChange={(e) => handlePersonalUpdate(idx, e.target.value)}
                             className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                           />
                        </div>
                      ))}
                   </div>
                </section>

                {/* Content Sections */}
                {localSections.map((section, idx) => (
                  <section key={idx} id={`section-${idx}`} className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                             {section.title === 'EXPERIENCE' ? <Briefcase className="h-4 w-4" /> : 
                              section.title === 'EDUCATION' ? <GraduationCap className="h-4 w-4" /> :
                              section.title === 'SKILLS' ? <Code className="h-4 w-4" /> :
                              section.title === 'SUMMARY' ? <Target className="h-4 w-4" /> :
                              section.title === 'PROJECTS' ? <Award className="h-4 w-4" /> : <List className="h-4 w-4" />}
                          </div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{section.title}</h3>
                       </div>
                       
                       {/* Formatting Toolbar */}
                       <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <button 
                             onClick={() => {
                                const textarea = document.getElementById(`section-textarea-${idx}`) as HTMLTextAreaElement;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const selected = text.substring(start, end);
                                
                                let replacement = "";
                                if (selected.startsWith('**') && selected.endsWith('**')) {
                                  replacement = selected.slice(2, -2);
                                } else {
                                  replacement = `**${selected}**`;
                                }
                                
                                handleSectionUpdate(idx, text.substring(0, start) + replacement + text.substring(end));
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start, start + replacement.length);
                                }, 0);
                             }}
                             className="p-1 px-2 hover:bg-white dark:hover:bg-zinc-800 rounded flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-blue-600 transition-all"
                             title="Toggle bold"
                          >
                             <span className="font-bold">B</span>
                          </button>
                          <button 
                             onClick={() => {
                                const textarea = document.getElementById(`section-textarea-${idx}`) as HTMLTextAreaElement;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const selected = text.substring(start, end);
                                
                                let replacement = "";
                                if (selected.startsWith('==') && selected.endsWith('==')) {
                                  replacement = selected.slice(2, -2);
                                } else {
                                  replacement = `==${selected}==`;
                                }
                                
                                handleSectionUpdate(idx, text.substring(0, start) + replacement + text.substring(end));
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start, start + replacement.length);
                                }, 0);
                             }}
                             className="p-1 px-2 hover:bg-white dark:hover:bg-zinc-800 rounded flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-blue-600 transition-all"
                             title="Toggle highlight"
                          >
                             <Highlighter className="h-3 w-3" />
                          </button>
                          <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
                          <button 
                             onClick={() => {
                                const textarea = document.getElementById(`section-textarea-${idx}`) as HTMLTextAreaElement;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const selected = text.substring(start, end);
                                
                                let replacement = "";
                                // Check for common bullet prefixes
                                if (/^[•\-\*]\s/.test(selected)) {
                                  replacement = selected.replace(/^[•\-\*]\s/, '');
                                } else {
                                  replacement = `• ${selected}`;
                                }
                                
                                handleSectionUpdate(idx, text.substring(0, start) + replacement + text.substring(end));
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start, start + replacement.length);
                                }, 0);
                             }}
                             className="p-1 px-2 hover:bg-white dark:hover:bg-zinc-800 rounded flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-blue-600 transition-all"
                             title="Toggle bullet point"
                          >
                             <List className="h-3 w-3" />
                             Bullet
                          </button>
                       </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                       <textarea
                         id={`section-textarea-${idx}`}
                         value={section.content.join("\n")}
                         onChange={(e) => handleSectionUpdate(idx, e.target.value)}
                         rows={Math.max(4, section.content.length + 1)}
                         className="w-full p-6 text-sm leading-relaxed resize-none focus:outline-none bg-transparent"
                         placeholder={`Update your ${section.title.toLowerCase()}...`}
                       />
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Side */}
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
            <div className="w-full max-w-[800px] h-fit min-h-[1100px] bg-white shadow-2xl rounded-sm overflow-hidden transition-all duration-300">
               <iframe
                title="Resume Preview"
                className="w-full h-[1100px] border-none"
                srcDoc={previewHtml}
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
