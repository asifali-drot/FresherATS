"use client";

import { useState, useEffect, useCallback, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Sparkles,
  Download,
  Edit,
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  Check,
  FileText,
  Layout,
  ArrowRight,
  Briefcase,
  User,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  Upload,
} from "lucide-react";
import { parseCoverLetterText, serializeCoverLetter, generateCoverLetterHtml, ParsedCoverLetter } from "@/lib/cover-letter/utils";
import { getCoverLetterTemplateById, COVER_LETTER_TEMPLATES, CoverLetterTemplateId } from "@/lib/cover-letter/templates";
import { generateSoftwareApplicationSchema } from "@/lib/seo";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeOverlay from "@/components/UpgradeOverlay";

function CoverLetterContent() {
  const router = useRouter();

  // Screen state
  const [step, setStep] = useState<"setup" | "studio">("setup");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { tier, usage } = useSubscription();
  const isFreeTier = tier === "free";
  const isLimitReached = tier === "starter" && usage.cover_letters >= 10;
  const isAiLocked = isFreeTier || isLimitReached;

  // Form setup inputs
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    userLocation: "",
    userLinks: "",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    recipientName: "Hiring Manager",
    recipientTitle: "Software Engineering Team",
    companyName: "Target Company Inc.",
    companyAddress: "123 Innovation Way, Suite 100",
    salutation: "Dear Hiring Manager,",
    jobTitle: "",
    jobDescription: "",
    resumeText: "",
    tone: "professional",
  });

  // Editor states
  const [templateId, setTemplateId] = useState<CoverLetterTemplateId>("professional");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [editorMode, setEditorMode] = useState<"guided" | "raw">("guided");
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Guided fields
  const [localSenderLines, setLocalSenderLines] = useState<string[]>([]);
  const [localDate, setLocalDate] = useState("");
  const [localRecipientLines, setLocalRecipientLines] = useState<string[]>([]);
  const [localSalutation, setLocalSalutation] = useState("");
  const [localBodyParagraphs, setLocalBodyParagraphs] = useState<string[]>([]);
  const [localSignOff, setLocalSignOff] = useState("");
  const [localSignatureName, setLocalSignatureName] = useState("");

  // Process / Call states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load user profile & pre-fill from latest resume analysis if available
  useEffect(() => {
    async function loadUserSession() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Pre-fill user metadata name if available
          const metadata = user.user_metadata || {};
          const fullName = `${metadata.first_name || ""} ${metadata.last_name || ""}`.trim();
          if (fullName) {
            setFormData(prev => ({
              ...prev,
              userName: fullName,
              userEmail: user.email || prev.userEmail,
            }));
          }

          // Fetch the latest resume analysis
          const { data: analyses } = await supabase
            .from("analyses")
            .select("resume_text, optimized_resume")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (analyses && analyses.length > 0) {
            const latest = analyses[0];
            const text = latest.optimized_resume || latest.resume_text || "";

            // Try to extract name and contact info from the resume
            const { parseResumeText } = await import("@/lib/resume/resumeUtils");
            const parsedResume = parseResumeText(text);

            setFormData(prev => ({
              ...prev,
              resumeText: text,
              userName: parsedResume.nameLines[0] || fullName || prev.userName,
              userContact: parsedResume.nameLines[1] || `${user.email || ""}`,
              userLocation: parsedResume.nameLines[2] || prev.userLocation,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch session metadata:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserSession();
  }, []);

  // Check for query parameters on load
  const searchParams = useSearchParams();
  const templateParam = searchParams?.get("template") as CoverLetterTemplateId | null;
  const actionParam = searchParams?.get("action");
  const companyParam = searchParams?.get("company");
  const jobTitleParam = searchParams?.get("jobTitle");

  useEffect(() => {
    if (companyParam || jobTitleParam) {
      setFormData(prev => ({
        ...prev,
        companyName: companyParam || prev.companyName,
        jobTitle: jobTitleParam || prev.jobTitle,
      }));
    }
  }, [companyParam, jobTitleParam]);

  useEffect(() => {
    // Allow direct start for all template types, including modern-avatar
    if (!isLoading && templateParam && ["professional", "minimalist", "creative", "modern-avatar"].includes(templateParam)) {
      handleStartWithTemplate(templateParam);
    }
  }, [isLoading, templateParam]);

  useEffect(() => {
    if (actionParam === "new") {
      setStep("setup");
    } else if (!isLoading && actionParam === "edit") {
      if (typeof window !== "undefined") {
        const savedText = window.sessionStorage.getItem("coverLetterText");
        const savedTemplateId = window.sessionStorage.getItem("coverLetterTemplateId") as CoverLetterTemplateId | null;
        if (savedText) {
          setCoverLetterText(savedText);
          if (savedTemplateId) {
            setTemplateId(savedTemplateId);
          }
          const parsed = parseCoverLetterText(savedText);
          setLocalSenderLines(parsed.senderLines);
          setLocalDate(parsed.date);
          setLocalRecipientLines(parsed.recipientLines);
          setLocalSalutation(parsed.salutation);
          setLocalBodyParagraphs(parsed.bodyParagraphs);
          setLocalSignOff(parsed.signOff);
          setLocalSignatureName(parsed.signatureName);
          setStep("studio");

          // Pre-populate form data for consistency
          setFormData(prev => ({
            ...prev,
            userName: parsed.senderLines[0] || prev.userName,
            recipientName: parsed.recipientLines[0] || prev.recipientName,
            salutation: parsed.salutation || prev.salutation,
          }));
        }
      }
    }
  }, [isLoading, actionParam]);

  // Sync state back to raw text string when local fields change in guided mode
  const syncToText = useCallback((
    sender: string[],
    dt: string,
    recipient: string[],
    salut: string,
    body: string[],
    off: string,
    sigName: string
  ) => {
    const raw = serializeCoverLetter({
      senderLines: sender,
      date: dt,
      recipientLines: recipient,
      salutation: salut,
      bodyParagraphs: body,
      signOff: off,
      signatureName: sigName,
    });
    setCoverLetterText(raw);
  }, []);

  const updateGuidedField = (field: keyof ParsedCoverLetter | "sender" | "recipient" | "bodyIdx", val: any, idx?: number) => {
    if (field === "sender" && typeof idx === "number") {
      const updated = [...localSenderLines];
      updated[idx] = val;
      setLocalSenderLines(updated);
      syncToText(updated, localDate, localRecipientLines, localSalutation, localBodyParagraphs, localSignOff, localSignatureName);
    } else if (field === "recipient" && typeof idx === "number") {
      const updated = [...localRecipientLines];
      updated[idx] = val;
      setLocalRecipientLines(updated);
      syncToText(localSenderLines, localDate, updated, localSalutation, localBodyParagraphs, localSignOff, localSignatureName);
    } else if (field === "date") {
      setLocalDate(val);
      syncToText(localSenderLines, val, localRecipientLines, localSalutation, localBodyParagraphs, localSignOff, localSignatureName);
    } else if (field === "salutation") {
      setLocalSalutation(val);
      syncToText(localSenderLines, localDate, localRecipientLines, val, localBodyParagraphs, localSignOff, localSignatureName);
    } else if (field === "bodyIdx" && typeof idx === "number") {
      const updated = [...localBodyParagraphs];
      updated[idx] = val;
      setLocalBodyParagraphs(updated);
      syncToText(localSenderLines, localDate, localRecipientLines, localSalutation, updated, localSignOff, localSignatureName);
    } else if (field === "signOff") {
      setLocalSignOff(val);
      syncToText(localSenderLines, localDate, localRecipientLines, localSalutation, localBodyParagraphs, val, localSignatureName);
    } else if (field === "signatureName") {
      setLocalSignatureName(val);
      syncToText(localSenderLines, localDate, localRecipientLines, localSalutation, localBodyParagraphs, localSignOff, val);
    }
  };

  const handleAddParagraph = () => {
    const updated = [...localBodyParagraphs, "Enter new paragraph content..."];
    setLocalBodyParagraphs(updated);
    syncToText(localSenderLines, localDate, localRecipientLines, localSalutation, updated, localSignOff, localSignatureName);
  };

  const handleDeleteParagraph = (idx: number) => {
    if (localBodyParagraphs.length <= 1) return; // Must keep at least one
    const updated = localBodyParagraphs.filter((_, i) => i !== idx);
    setLocalBodyParagraphs(updated);
    syncToText(localSenderLines, localDate, localRecipientLines, localSalutation, updated, localSignOff, localSignatureName);
  };

  // Sync when raw text is edited
  const handleRawTextChange = (text: string) => {
    setCoverLetterText(text);
    if (editorMode === "guided") {
      const parsed = parseCoverLetterText(text);
      setLocalSenderLines(parsed.senderLines);
      setLocalDate(parsed.date);
      setLocalRecipientLines(parsed.recipientLines);
      setLocalSalutation(parsed.salutation);
      setLocalBodyParagraphs(parsed.bodyParagraphs);
      setLocalSignOff(parsed.signOff);
      setLocalSignatureName(parsed.signatureName);
    }
  };

  // Toggle modes
  const handleModeChange = (mode: "guided" | "raw") => {
    if (mode === "guided") {
      const parsed = parseCoverLetterText(coverLetterText);
      setLocalSenderLines(parsed.senderLines);
      setLocalDate(parsed.date);
      setLocalRecipientLines(parsed.recipientLines);
      setLocalSalutation(parsed.salutation);
      setLocalBodyParagraphs(parsed.bodyParagraphs);
      setLocalSignOff(parsed.signOff);
      setLocalSignatureName(parsed.signatureName);
    }
    setEditorMode(mode);
  };

  // Get tooltip message for missing required fields
  const getMissingFieldsMessage = () => {
    const missingFields: string[] = [];
    if (!formData.userName) missingFields.push("Name");
    if (!formData.jobTitle) missingFields.push("Job Title");
    
    if (missingFields.length > 0) {
      return `Please fill in: ${missingFields.join(", ")}`;
    }
    return "";
  };

  // Generate with AI Action
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsGenerating(true);

    const contactLine1 = [formData.userEmail, formData.userPhone, formData.userLocation]
      .filter(Boolean)
      .join(" | ");

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          jobDescription: formData.jobDescription,
          resumeText: formData.resumeText,
          userName: formData.userName,
          userContact: contactLine1 || undefined,
          recipientName: formData.recipientName,
          companyName: formData.companyName,
          companyAddress: formData.companyAddress,
          tone: formData.tone,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate cover letter.");
      }

      const text = result.coverLetterText;
      setCoverLetterText(text);

      // Load initial parsed fields
      const parsed = parseCoverLetterText(text);
      setLocalSenderLines(parsed.senderLines);
      setLocalDate(parsed.date);
      setLocalRecipientLines(parsed.recipientLines);
      setLocalSalutation(parsed.salutation);
      setLocalBodyParagraphs(parsed.bodyParagraphs);
      setLocalSignOff(parsed.signOff);
      setLocalSignatureName(parsed.signatureName);

      setStep("studio");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Start with Template directly
  const handleStartWithTemplate = (id: CoverLetterTemplateId) => {
    setErrorMessage(null);
    setTemplateId(id);

    const template = getCoverLetterTemplateById(id);
    const text = template.seedText;

    // Apply names if user filled setup fields
    let updatedText = text;
    if (formData.userName) {
      const lines = text.split("\n");
      lines[0] = formData.userName;
      if (formData.userEmail || formData.userPhone || formData.userLocation) {
        lines[1] = [formData.userEmail, formData.userPhone, formData.userLocation].filter(Boolean).join(" | ");
      }
      if (formData.userLinks) {
        lines[2] = formData.userLinks;
      }
      updatedText = lines.join("\n");
    }

    setCoverLetterText(updatedText);
    const parsed = parseCoverLetterText(updatedText);
    setLocalSenderLines(parsed.senderLines);
    setLocalDate(parsed.date);
    setLocalRecipientLines(parsed.recipientLines);
    setLocalSalutation(parsed.salutation);
    setLocalBodyParagraphs(parsed.bodyParagraphs);
    setLocalSignOff(parsed.signOff);
    setLocalSignatureName(parsed.signatureName);

    setStep("studio");
  };

  // AI assistant enhancements for paragraphs or full document
  const handleAIEnhance = async (type: "polish" | "longer" | "shorter" | "enthusiastic" | "formal", paragraphIdx?: number) => {
    setIsEnhancing(true);
    setErrorMessage(null);

    const textToEnhance = paragraphIdx !== undefined
      ? localBodyParagraphs[paragraphIdx]
      : coverLetterText;

    const instruction =
      type === "polish" ? "Polish and refine this text to make it read more professionally with strong active verbs."
        : type === "longer" ? "Expand this content slightly to provide more professional detail, keeping it high-quality and concise."
          : type === "shorter" ? "Shorten this content to make it more direct and impactful, maintaining the key value propositions."
            : type === "enthusiastic" ? "Rewrite this with an enthusiastic, passionate, and eager tone, highlighting excitement for the team."
              : "Rewrite this in a highly formal, traditional, and polite business tone.";

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          jobDescription: `Instruction: ${instruction}\n\nTarget Text to Rewrite:\n${textToEnhance}`,
          userName: formData.userName,
          userContact: localSenderLines.slice(1).join(" | "),
          tone: formData.tone,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to enhance text.");
      }

      const returned = result.coverLetterText;

      if (paragraphIdx !== undefined) {
        // AI response might contain blocks, let's take the first non-empty block
        const parsedBody = parseCoverLetterText(returned).bodyParagraphs;
        const newPara = parsedBody.join("\n\n");
        const updated = [...localBodyParagraphs];
        updated[paragraphIdx] = newPara;
        setLocalBodyParagraphs(updated);
        syncToText(localSenderLines, localDate, localRecipientLines, localSalutation, updated, localSignOff, localSignatureName);
      } else {
        setCoverLetterText(returned);
        const parsed = parseCoverLetterText(returned);
        setLocalSenderLines(parsed.senderLines);
        setLocalDate(parsed.date);
        setLocalRecipientLines(parsed.recipientLines);
        setLocalSalutation(parsed.salutation);
        setLocalBodyParagraphs(parsed.bodyParagraphs);
        setLocalSignOff(parsed.signOff);
        setLocalSignatureName(parsed.signatureName);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to apply AI enhancement.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const fileName = `${user.id}_cover_${Date.now()}.${file.name.split('.').pop()}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setCustomAvatarUrl(publicUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (isDownloading || !coverLetterText.trim()) return;

    if (!user) {
      // Require registration to claim PDF or let them proceed (as in editor page)
      const params = new URLSearchParams();
      params.set("redirect", window.location.pathname + window.location.search);
      window.location.href = `/login?${params.toString()}`;
      return;
    }

    setErrorMessage(null);
    setIsDownloading(true);

    try {
      const response = await fetch("/api/generate-cover-letter-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetterText: coverLetterText,
          templateId: templateId,
          avatarUrl: customAvatarUrl || user?.user_metadata?.avatar_url || undefined,
          jobTitle: formData.jobTitle,
          jobDescription: formData.jobDescription,
          companyName: formData.companyName,
        }),
      });

      if (!response.ok) {
        let errText = "Failed to generate PDF";
        try {
          const errData = await response.json();
          if (errData.error) errText = errData.error;
        } catch { }
        throw new Error(errText);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const { url } = await response.json();
        if (url) {
          const res = await fetch(url);
          const blob = await res.blob();
          const dlUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = dlUrl;
          a.download = "cover-letter.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(dlUrl);
          return;
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cover-letter.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to download cover letter PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <span className="text-zinc-500 animate-pulse font-bold text-sm uppercase tracking-widest">Loading Cover Letter Studio...</span>
        </div>
      </div>
    );
  }

  // Pre-generate HTML content for the iframe preview
  const livePreviewData: ParsedCoverLetter = editorMode === "guided"
    ? {
      senderLines: localSenderLines,
      date: localDate,
      recipientLines: localRecipientLines,
      salutation: localSalutation,
      bodyParagraphs: localBodyParagraphs,
      signOff: localSignOff,
      signatureName: localSignatureName,
    }
    : parseCoverLetterText(coverLetterText);

  // Provide a dummy avatar image for the modern-avatar template during editing preview
  const avatarUrl = templateId === "modern-avatar" ? (customAvatarUrl || user?.user_metadata?.avatar_url || "/cover_letter.webp") : undefined;
  const previewHtml = generateCoverLetterHtml(livePreviewData, templateId, avatarUrl);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">

      {/* SECTION 1: SETUP SCREEN */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSoftwareApplicationSchema({
            name: "FresherATS Cover Letter Generator",
            url: "https://fresherats.com/ai-cover-letter-generator",
            description: "Create a stunning, targeted cover letter in seconds using AI.",
            applicationCategory: "BusinessApplication"
          }))
        }}
      />
      {step === "setup" && (
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900/50 text-purple-700 dark:text-purple-400 text-xs font-bold mb-4">
              <Sparkles className="h-3.5 w-3.5 fill-purple-200 dark:fill-none" />
              AI Assistant Activated
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
              Cover Letter Generator
            </h1>
            <p className="max-w-xl mx-auto text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              Create a stunning, targeted cover letter in seconds. Select a design, supply the job title, paste your resume details, and let AI build the content.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Input Form Column */}
            <form onSubmit={handleGenerateAI} className="lg:col-span-7 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm space-y-6">

              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-blue-600" /> Personal Details
                </h2>
                {user ? (
                  <span className="text-[10px] bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Synced from resume</span>
                ) : (
                  <span className="text-[10px] text-zinc-400 font-semibold italic">Enter manually or sign in to pre-fill</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. alex@email.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.userPhone}
                    onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. +1 (555) 019-2834"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Location (Optional)</label>
                  <input
                    type="text"
                    value={formData.userLocation}
                    onChange={(e) => setFormData({ ...formData, userLocation: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. New York, NY"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Links / Portfolio (Optional)</label>
                  <input
                    type="text"
                    value={formData.userLinks}
                    onChange={(e) => setFormData({ ...formData, userLinks: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. github.com/alexrivera | portfolio.com"
                  />
                </div>
              </div>

              <div className="border-b border-zinc-100 dark:border-zinc-800 pt-4 pb-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-blue-600" /> Target Job & Company
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. InnovateTech Inc."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Hiring Manager Name / Title</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Hiring Manager"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Company Address (Optional)</label>
                  <input
                    type="text"
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. 100 Enterprise Way, Suite 400, New York, NY"
                  />
                </div>
              </div>

              <div className="border-b border-zinc-100 dark:border-zinc-800 pt-4 pb-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-purple-600" /> AI Prompts & Context
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Job Description (Paste below)</label>
                  <textarea
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Paste the target requirements and responsibilities. Helps the AI customize text metrics and align experience values."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Paste Resume Text (For better matching)</label>
                  <textarea
                    value={formData.resumeText}
                    onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Paste your resume content. The AI extracts skills and projects automatically to validate match descriptions."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Tone of Voice</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="professional">Professional / Formal</option>
                      <option value="enthusiastic">Enthusiastic / Warm</option>
                      <option value="creative">Creative / Passionate</option>
                      <option value="formal">Traditional Business</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Default Style</label>
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value as CoverLetterTemplateId)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="professional">Professional Business</option>
                      <option value="minimalist">Minimalist Modern</option>
                      <option value="creative">Creative Executive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 relative">
                <button
                  type="submit"
                  disabled={isGenerating || !formData.userName || !formData.jobTitle || isAiLocked}
                  title={getMissingFieldsMessage() || "Generate Cover Letter with AI"}
                  className="w-full inline-flex flex-col items-center justify-center gap-1 rounded-2xl bg-blue-600! hover:bg-blue-700! text-white! p-4 text-sm font-extrabold transition-all active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  <div className="flex items-center gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Writing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5" />
                        <span>Generate Cover Letter with AI</span>
                      </>
                    )}
                  </div>
                  {!isFreeTier && !isGenerating && (
                    <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
                      {tier === "tier_3" ? "UNLIMITED" : `${5 - usage.cover_letters} REMAINING`}
                    </span>
                  )}
                </button>
                {isAiLocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {isFreeTier ? "AI Generation is Premium" : "Monthly Limit Reached"}
                    </p>
                    <Link href="/pricing" className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline">
                      {isFreeTier ? "Upgrade to Tier 2" : "Upgrade to Tier 3"}
                    </Link>
                  </div>
                )}
              </div>

            </form>

            {/* Template Selection Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layout className="h-4 w-4 text-pink-500" /> Start with Templates
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-6">
                  Skip the AI generation step and start writing manually with one of our high-quality structured layouts.
                </p>

                <div className="space-y-4">
                  {COVER_LETTER_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleStartWithTemplate(tmpl.id)}
                      className="group p-5 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-900/60 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-extrabold text-sm text-zinc-950 dark:text-white group-hover:text-blue-600 transition-colors">
                          {tmpl.label}
                        </span>
                        <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition-colors group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium">
                        {tmpl.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informative Tip */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-900 p-6 rounded-3xl border border-blue-100/30 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 text-xs leading-relaxed">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white mb-1">ATS Optimization Tip</h4>
                    <p className="font-medium text-zinc-600 dark:text-zinc-400">
                      Applicant Tracking Systems (ATS) scan cover letters for the same keywords as your resume. Using AI matches your achievements naturally and formats layouts safely for database parsers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* SEO Content / Features Marketing Block */}
          <div className="mt-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Why Use an AI Cover Letter Generator?</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Write faster, match ATS requirements, and stand out.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white">AI-Powered Targeting</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Our AI analyzes your job description and resume to create a highly targeted cover letter that hits all the right keywords for ATS.</p>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white">Professional Templates</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Choose from modern, creative, or minimalist designs. Every template is strictly formatted to pass Applicant Tracking Systems.</p>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white">Guided Editor</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Not happy with the AI's first draft? Use our guided studio to polish paragraphs, adjust tone, and perfect your pitch.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LIVE STUDIO BUILDER */}
      {step === "studio" && (
        <div className="flex flex-col h-screen overflow-hidden">

          {/* Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 z-20 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep("setup")}
                className="group flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Setup Form
              </button>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h1 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Cover Letter Studio</h1>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => handleModeChange("guided")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${editorMode === "guided" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                <Layout className="h-3.5 w-3.5" />
                Guided Edit
              </button>
              <button
                onClick={() => handleModeChange("raw")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${editorMode === "raw" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                <FileText className="h-3.5 w-3.5" />
                Raw Text
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading || !coverLetterText.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 text-xs font-extrabold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </header>

          <main className="flex flex-1 overflow-hidden">

            {/* LEFT SIDE: EDITOR */}
            <div className="w-1/2 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">

              {errorMessage && (
                <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-[11px] font-bold flex items-center justify-between">
                  <span>{errorMessage}</span>
                  <button onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/40 dark:bg-zinc-950/20">
                {editorMode === "raw" ? (
                  <div className="h-full flex flex-col">
                    <div className="mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Raw Letter Document</div>
                    <textarea
                      value={coverLetterText}
                      onChange={(e) => handleRawTextChange(e.target.value)}
                      className="flex-1 w-full p-6 font-mono text-xs leading-relaxed border border-zinc-200 dark:border-zinc-800 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 shadow-sm"
                      spellCheck="false"
                      placeholder="Paste cover letter content here..."
                    />
                  </div>
                ) : (
                  <div className="space-y-6 max-w-2xl mx-auto">

                    {/* Template Specific Settings */}
                    {templateId === "modern-avatar" && (
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Avatar Settings</span>
                          {!user && <span className="text-[10px] text-zinc-400 normal-case font-medium">Log in to upload custom avatar</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                            <img src={avatarUrl || "/cover_letter.webp"} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <label className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${user ? "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white cursor-pointer" : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-800"}`}>
                              {isUploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                              <span>{isUploadingAvatar ? "Uploading..." : "Upload New Avatar"}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar || !user} />
                            </label>
                            {user && <p className="text-[10px] text-zinc-500 mt-2">Upload a professional headshot for your modern cover letter.</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sender Details Form */}
                    <div className="space-y-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                      <div className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-400" /> Sender Information
                      </div>
                      {localSenderLines.map((line, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">
                            {idx === 0 ? "Sender Name" : idx === 1 ? "Contact details" : `Extra Details (Line ${idx + 1})`}
                          </label>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => updateGuidedField("sender", e.target.value, idx)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Date Block */}
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm space-y-2">
                      <div className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Date
                      </div>
                      <input
                        type="text"
                        value={localDate}
                        onChange={(e) => updateGuidedField("date", e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Recipient Details Form */}
                    <div className="space-y-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                      <div className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-zinc-400" /> Recipient / Company Information
                      </div>
                      {localRecipientLines.map((line, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">
                            {idx === 0 ? "Recipient Name/Title" : idx === 1 ? "Company Department/Name" : `Company Address (Line ${idx + 1})`}
                          </label>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => updateGuidedField("recipient", e.target.value, idx)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Salutation Block */}
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm space-y-2">
                      <label className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        Salutation
                      </label>
                      <input
                        type="text"
                        value={localSalutation}
                        onChange={(e) => updateGuidedField("salutation", e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Body Paragraphs Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Body Paragraphs</span>
                        <button
                          type="button"
                          onClick={handleAddParagraph}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-all shadow-sm"
                        >
                          <Plus className="h-3 w-3" /> Add Paragraph
                        </button>
                      </div>

                      {localBodyParagraphs.map((para, idx) => (
                        <div key={idx} className="relative group/para bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Paragraph {idx + 1}</span>
                            <div className="flex items-center gap-1.5">
                              {/* AI micro refinement button */}
                              <button
                                type="button"
                                disabled={isEnhancing}
                                onClick={() => handleAIEnhance("polish", idx)}
                                className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"
                                title="Polish this paragraph with AI"
                              >
                                <Sparkles className="h-3 w-3" />
                                <span>Polish</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteParagraph(idx)}
                                disabled={localBodyParagraphs.length <= 1}
                                className="p-1 rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 transition-colors"
                                title="Delete paragraph"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={para}
                            onChange={(e) => updateGuidedField("bodyIdx", e.target.value, idx)}
                            rows={4}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none font-medium text-zinc-700 dark:text-zinc-300"
                            placeholder="Enter paragraph text..."
                          />
                        </div>
                      ))}
                    </div>

                    {/* Sign-off & Signature Block */}
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm space-y-4">
                      <div className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-2">Sign-off & Signature</div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">Valediction</label>
                          <input
                            type="text"
                            value={localSignOff}
                            onChange={(e) => updateGuidedField("signOff", e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">Signature Name</label>
                          <input
                            type="text"
                            value={localSignatureName}
                            onChange={(e) => updateGuidedField("signatureName", e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* AI assistant enhancement bottom bar */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" /> AI Document Refinement Hub
                  </div>
                  {isEnhancing && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" /> Enhancing...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => handleAIEnhance("polish")}
                    disabled={isEnhancing || !coverLetterText.trim()}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-[10px] font-black text-zinc-700 dark:text-zinc-300 hover:border-purple-300 hover:text-purple-600 transition-all text-center"
                  >
                    Polish Document
                  </button>
                  <button
                    onClick={() => handleAIEnhance("longer")}
                    disabled={isEnhancing || !coverLetterText.trim()}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-[10px] font-black text-zinc-700 dark:text-zinc-300 hover:border-purple-300 hover:text-purple-600 transition-all text-center"
                  >
                    Make Longer
                  </button>
                  <button
                    onClick={() => handleAIEnhance("shorter")}
                    disabled={isEnhancing || !coverLetterText.trim()}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-[10px] font-black text-zinc-700 dark:text-zinc-300 hover:border-purple-300 hover:text-purple-600 transition-all text-center"
                  >
                    Make Shorter
                  </button>
                  <button
                    onClick={() => handleAIEnhance("enthusiastic")}
                    disabled={isEnhancing || !coverLetterText.trim()}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-[10px] font-black text-zinc-700 dark:text-zinc-300 hover:border-purple-300 hover:text-purple-600 transition-all text-center"
                  >
                    Tone: Enthusiastic
                  </button>
                  <button
                    onClick={() => handleAIEnhance("formal")}
                    disabled={isEnhancing || !coverLetterText.trim()}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-[10px] font-black text-zinc-700 dark:text-zinc-300 hover:border-purple-300 hover:text-purple-600 transition-all text-center"
                  >
                    Tone: Formal
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: PREVIEW */}
            <div className="w-1/2 flex flex-col bg-zinc-100 dark:bg-zinc-900/50">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Document Preview</span>

                {/* Template Selection */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setTemplateId("professional")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${templateId === "professional" ? "bg-white dark:bg-zinc-800 border-zinc-300 text-zinc-900 dark:text-white shadow-xs" : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    Professional
                  </button>
                  <button
                    onClick={() => setTemplateId("minimalist")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${templateId === "minimalist" ? "bg-white dark:bg-zinc-800 border-zinc-300 text-zinc-900 dark:text-white shadow-xs" : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    Minimalist
                  </button>
                  <button
                    onClick={() => setTemplateId("creative")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${templateId === "creative" ? "bg-white dark:bg-zinc-800 border-zinc-300 text-zinc-900 dark:text-white shadow-xs" : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    Creative
                  </button>
                  <button
                    onClick={() => setTemplateId("modern-avatar")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${templateId === "modern-avatar" ? "bg-white dark:bg-zinc-800 border-zinc-300 text-zinc-900 dark:text-white shadow-xs" : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    Modern Avatar
                  </button>
                </div>
              </div>

              {/* High-fidelity letter container */}
              <div className="flex-1 p-8 overflow-y-auto flex justify-center bg-zinc-200/20 dark:bg-zinc-950/20 scrollbar-hide">
                <div className="w-full max-w-180 h-fit min-h-240 bg-white shadow-2xl rounded-sm overflow-hidden transition-all duration-300">
                  <iframe
                    title="Cover Letter Preview"
                    className="w-full h-240 border-none"
                    srcDoc={previewHtml}
                  />
                </div>
              </div>

            </div>

          </main>
        </div>
      )}

    </div>
  );
}

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950"><div className="flex flex-col items-center gap-3"><Loader2 className="h-10 w-10 text-blue-600 animate-spin" /><span className="text-zinc-500 animate-pulse font-bold text-sm uppercase tracking-widest">Loading Cover Letter Studio...</span></div></div>}>
      <CoverLetterContent />
    </Suspense>
  );
}
