"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  Cloud,
  CloudOff,
  User,
  ArrowRight,
  TrendingUp,
  Award,
  X,
  PlusCircle,
  HelpCircle,
  Star,
  Users,
  Bell,
  CheckSquare,
  Square,
  Mail,
  Linkedin,
  Copy,
  ChevronRight,
  RefreshCw,
  Info
} from "lucide-react";

/* ─── Types ────────────────────────────────────────────────── */

type ApplicationStatus = "saved" | "applied" | "online_test" | "interview" | "offer" | "rejected";

interface JobContact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  linkedin_url?: string;
  notes?: string;
}

interface JobReminder {
  id: string;
  due_at: string;
  type: "followup" | "interview" | "deadline";
  message: string;
  status: "pending" | "done" | "notified";
  notification_email?: string; // recipient email for this specific reminder
}

interface JobApplication {
  id: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  jd_text?: string;
  status: ApplicationStatus;
  salary?: string;
  location?: string;
  notes?: string;
  applied_date?: string;
  excitement_rating: number; // 1-5
  match_score?: number | null;
  matched_keywords?: string[];
  missing_keywords?: string[];
  contacts?: JobContact[];
  reminders?: JobReminder[];
}

const STATUS_COLUMNS: { key: ApplicationStatus; label: string; bg: string; border: string; dot: string; text: string }[] = [
  { key: "saved", label: "Saved", bg: "bg-slate-50/50 dark:bg-slate-900/10", border: "border-slate-200 dark:border-slate-800", dot: "bg-slate-400", text: "text-slate-700 dark:text-slate-300" },
  { key: "applied", label: "Applied", bg: "bg-blue-50/40 dark:bg-blue-900/10", border: "border-blue-150 dark:border-blue-900/20", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
  { key: "online_test", label: "Online Test", bg: "bg-purple-50/40 dark:bg-purple-900/10", border: "border-purple-150 dark:border-purple-900/20", dot: "bg-purple-500", text: "text-purple-700 dark:text-purple-400" },
  { key: "interview", label: "Interview", bg: "bg-amber-50/40 dark:bg-amber-900/10", border: "border-amber-150 dark:border-amber-900/20", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  { key: "offer", label: "Offers", bg: "bg-emerald-50/40 dark:bg-emerald-900/10", border: "border-emerald-150 dark:border-emerald-900/20", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  { key: "rejected", label: "Rejected/Archived", bg: "bg-rose-50/30 dark:bg-rose-900/10", border: "border-rose-150 dark:border-rose-900/20", dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" },
];

export default function JobTrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isScanning, setIsScanning] = useState<string | null>(null);

  // Core tracking states
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  // Keep a stable ref in sync so the auto-send interval can read latest jobs without being a dependency
  const jobsRef = useRef<JobApplication[]>([]);
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated_at" | "company_name" | "job_title" | "match_score">("updated_at");

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [modalForm, setModalForm] = useState({
    company_name: "",
    job_title: "",
    job_url: "",
    jd_text: "",
    status: "saved" as ApplicationStatus,
    salary: "",
    location: "",
    notes: "",
    applied_date: new Date().toISOString().split("T")[0],
    excitement_rating: 3,
  });

  // Drawer / Sidebar Detail State
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Detail CRM / Reminder states (nested modals or inline forms in drawer)
  const [newContact, setNewContact] = useState({ name: "", role: "", email: "", linkedin_url: "", notes: "" });
  const [showAddContact, setShowAddContact] = useState(false);
  const [newReminder, setNewReminder] = useState({ due_at: "", type: "followup" as any, message: "", notification_email: "" });
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [autoSending, setAutoSending] = useState<string[]>([]); // reminder IDs currently being auto-sent

  // Fetch Auth & Initial Data
  useEffect(() => {
    async function loadData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Fetch from Supabase APIs
          const res = await fetch("/api/jobs");
          if (res.ok) {
            const data = await res.json();
            
            // Data from API now includes contacts and reminders due to backend join
            setJobs(data);
            setIsCloudSynced(true);
            localStorage.setItem(`fresher_jobs_v2_${user.id}`, JSON.stringify(data));
          } else {
            // Read cache
            const cache = localStorage.getItem(`fresher_jobs_v2_${user.id}`);
            if (cache) setJobs(JSON.parse(cache));
          }
        } else {
          // Guest User: Fetch from LocalStorage
          const localJobs = localStorage.getItem("fresher_jobs_v2_guest");
          if (localJobs) {
            setJobs(JSON.parse(localJobs));
          }
        }
      } catch (err) {
        console.error("Unexpected error in initialization:", err);
        // Fallback to offline guest state
        const localJobs = localStorage.getItem("fresher_jobs_v2_guest");
        if (localJobs) setJobs(JSON.parse(localJobs));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Auto-scheduler: check for due reminders every 60 seconds and send emails automatically ──
  // Uses jobsRef (not jobs state) so the interval is NOT restarted on every jobs update,
  // which previously caused an infinite send → state update → re-run loop.
  useEffect(() => {
    if (!user) return; // only works for logged-in users

    const checkAndAutoSend = async () => {
      const now = new Date();

      // Read from ref so this closure always sees the latest jobs without being a reactive dependency
      const currentJobs = jobsRef.current;

      // Collect all pending reminders that have reached their due time
      const dueReminders: { reminderId: string; email?: string }[] = [];
      for (const job of currentJobs) {
        for (const r of job.reminders || []) {
          if (r.status === "pending" && new Date(r.due_at) <= now) {
            dueReminders.push({
              reminderId: r.id,
              email: r.notification_email,
            });
          }
        }
      }

      if (dueReminders.length === 0) return;

      // Send each one automatically
      for (const { reminderId, email } of dueReminders) {
        setAutoSending(prev => [...prev, reminderId]);
        try {
          const res = await fetch("/api/reminders/send-now", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reminderId, recipientEmail: email }),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(`📧 Reminder sent to ${data.sentTo}!`, { id: `auto-${reminderId}` });
            // Update local state to notified (use functional update to avoid stale closure)
            setJobs(prev =>
              prev.map(job => ({
                ...job,
                reminders: (job.reminders || []).map(r =>
                  r.id === reminderId ? { ...r, status: "notified" as any } : r
                ),
              }))
            );
          } else {
            console.warn(`[AutoSend] Failed for ${reminderId}:`, data.error);
          }
        } catch (e) {
          console.error(`[AutoSend] Network error for ${reminderId}:`, e);
        } finally {
          setAutoSending(prev => prev.filter(id => id !== reminderId));
        }
      }
    };

    // Run once on mount/user-change, then every 60 seconds.
    // Do NOT include jobs in deps — use jobsRef.current inside the callback instead.
    checkAndAutoSend();
    const interval = setInterval(checkAndAutoSend, 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync to database or local storage helper
  const syncJobs = useCallback(async (updatedJobs: JobApplication[]) => {
    setJobs(updatedJobs);
    
    if (user) {
      localStorage.setItem(`fresher_jobs_v2_${user.id}`, JSON.stringify(updatedJobs));
    } else {
      localStorage.setItem("fresher_jobs_v2_guest", JSON.stringify(updatedJobs));
    }
  }, [user]);

  // Trigger manual scanner
  const handleRunScan = async (jobId: string) => {
    setIsScanning(jobId);
    try {
      if (user) {
        const res = await fetch(`/api/jobs/${jobId}/scan`, { method: "POST" });
        if (res.ok) {
          const resData = await res.json();
          toast.success("Resume ATS match scan finished!");
          
          // Update state with scanned results
          const updated = jobs.map(j => {
            if (j.id === jobId) {
              return {
                ...j,
                match_score: resData.job.match_score,
                matched_keywords: resData.job.matched_keywords,
                missing_keywords: resData.job.missing_keywords,
                updated_at: resData.job.updated_at
              };
            }
            return j;
          });
          syncJobs(updated);
          
          if (selectedJob && selectedJob.id === jobId) {
            setSelectedJob({
              ...selectedJob,
              match_score: resData.job.match_score,
              matched_keywords: resData.job.matched_keywords,
              missing_keywords: resData.job.missing_keywords,
            });
          }
        } else {
          const err = await res.json();
          toast.error(err.error || "Failed to scan resume");
        }
      } else {
        // Mock Scan for Guests
        toast.info("Mock scanning job description against template...");
        await new Promise(r => setTimeout(r, 1500));
        
        const mockScore = Math.floor(Math.random() * 41) + 55; // 55 to 95
        const mockMatched = ["React", "JavaScript", "CSS", "TypeScript", "Next.js", "Tailwind"].slice(0, Math.floor(Math.random() * 4) + 2);
        const mockMissing = ["AWS", "Node.js", "MongoDB", "Express", "Docker"].slice(0, Math.floor(Math.random() * 3) + 2);
        
        const updated = jobs.map(j => {
          if (j.id === jobId) {
            return {
              ...j,
              match_score: mockScore,
              matched_keywords: mockMatched,
              missing_keywords: mockMissing,
              updated_at: new Date().toISOString()
            };
          }
          return j;
        });
        syncJobs(updated);
        toast.success("Offline scanning complete!");
        
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob({
            ...selectedJob,
            match_score: mockScore,
            matched_keywords: mockMatched,
            missing_keywords: mockMissing
          });
        }
      }
    } catch (e: any) {
      toast.error("Scanning failed: " + e.message);
    } finally {
      setIsScanning(null);
    }
  };

  // Insert or Update single record
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.company_name.trim() || !modalForm.job_title.trim()) {
      toast.error("Company Name and Job Title are required.");
      return;
    }

    const isEditing = !!editingJob;
    const nowStr = new Date().toISOString();
    
    let targetJob: JobApplication = {
      id: isEditing ? editingJob!.id : Math.random().toString(36).substring(2, 9),
      created_at: isEditing ? editingJob!.created_at : nowStr,
      updated_at: nowStr,
      user_id: user ? user.id : undefined,
      company_name: modalForm.company_name.trim(),
      job_title: modalForm.job_title.trim(),
      job_url: modalForm.job_url.trim() || undefined,
      jd_text: modalForm.jd_text.trim() || undefined,
      status: modalForm.status,
      salary: modalForm.salary.trim() || undefined,
      location: modalForm.location.trim() || undefined,
      notes: modalForm.notes.trim() || undefined,
      applied_date: modalForm.applied_date || undefined,
      excitement_rating: modalForm.excitement_rating,
      contacts: isEditing ? editingJob!.contacts || [] : [],
      reminders: isEditing ? editingJob!.reminders || [] : [],
      match_score: isEditing ? editingJob!.match_score : null,
      matched_keywords: isEditing ? editingJob!.matched_keywords : [],
      missing_keywords: isEditing ? editingJob!.missing_keywords : [],
    };

    if (user) {
      try {
        if (isEditing) {
          const res = await fetch(`/api/jobs/${targetJob.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name: targetJob.company_name,
              job_title: targetJob.job_title,
              job_url: targetJob.job_url,
              jd_text: targetJob.jd_text,
              status: targetJob.status,
              salary: targetJob.salary,
              location: targetJob.location,
              notes: targetJob.notes,
              applied_date: targetJob.applied_date,
              excitement_rating: targetJob.excitement_rating
            })
          });

          if (!res.ok) throw new Error("Failed to update on cloud");
          const resData = await res.json();
          targetJob = { ...targetJob, ...resData };
          toast.success("Job updated successfully!");
        } else {
          const res = await fetch(`/api/jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name: targetJob.company_name,
              job_title: targetJob.job_title,
              job_url: targetJob.job_url,
              jd_text: targetJob.jd_text,
              status: targetJob.status,
              salary: targetJob.salary,
              location: targetJob.location,
              notes: targetJob.notes,
              applied_date: targetJob.applied_date,
              excitement_rating: targetJob.excitement_rating
            })
          });

          if (!res.ok) throw new Error("Failed to create on cloud");
          const resData = await res.json();
          targetJob = { ...targetJob, ...resData };
          
          if (targetJob.jd_text) {
            toast.success("Job added! Running automated resume matching scan...");
            handleRunScan(targetJob.id);
          } else {
            toast.success("New job application tracked!");
          }
        }

        // Refreshed local state
        const updated = isEditing 
          ? jobs.map(j => j.id === targetJob.id ? { ...j, ...targetJob } : j)
          : [targetJob, ...jobs];
        syncJobs(updated);
      } catch (err: any) {
        toast.error("API Error: " + err.message);
      }
    } else {
      // Local fallback for guest
      const updated = isEditing 
        ? jobs.map(j => j.id === targetJob.id ? targetJob : j)
        : [targetJob, ...jobs];
      
      syncJobs(updated);
      toast.success(isEditing ? "Job updated locally" : "New job tracked locally");

      // Auto trigger mock scan for guest if JD text is newly added
      if (!isEditing && targetJob.jd_text) {
        handleRunScan(targetJob.id);
      }
    }

    setIsModalOpen(false);
    setEditingJob(null);
  };

  // Stage changes via dropdown or drag
  const handleUpdateStage = async (id: string, newStage: ApplicationStatus) => {
    const nowStr = new Date().toISOString();
    const updatedJobs = jobs.map(j => {
      if (j.id === id) return { ...j, status: newStage, updated_at: nowStr };
      return j;
    });
    setJobs(updatedJobs);

    // If moving to Interview, suggest creating a reminder
    if (newStage === "interview") {
      toast.info("Moved to Interview! Remember to schedule prep tasks.", {
        action: {
          label: "Add Reminder",
          onClick: () => {
            const target = updatedJobs.find(j => j.id === id);
            if (target) {
              setSelectedJob(target);
              setIsDrawerOpen(true);
              setShowAddReminder(true);
            }
          }
        }
      });
    }

    if (user) {
      try {
        const res = await fetch(`/api/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStage })
        });
        if (res.ok) {
          localStorage.setItem(`fresher_jobs_v2_${user.id}`, JSON.stringify(updatedJobs));
        }
      } catch (err: any) {
        toast.error("Failed to sync stage update");
        syncJobs(updatedJobs);
      }
    } else {
      syncJobs(updatedJobs);
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const jobToMove = jobs.find(j => j.id === id);
    if (!jobToMove || jobToMove.status === targetStatus) return;

    handleUpdateStage(id, targetStatus);
  };

  // Delete handler
  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job application? This deletes all associated contacts and reminders.")) return;

    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);

    if (user) {
      try {
        const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
        if (res.ok) {
          localStorage.setItem(`fresher_jobs_v2_${user.id}`, JSON.stringify(updated));
          toast.success("Job deleted");
        }
      } catch (err: any) {
        toast.error("Failed to delete from database");
        syncJobs(updated);
      }
    } else {
      syncJobs(updated);
      toast.success("Job deleted locally");
    }

    if (selectedJob?.id === id) {
      setIsDrawerOpen(false);
      setSelectedJob(null);
    }
  };

  // CRM Contacts CRUD Actions
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !selectedJob) return;

    const contactItem: JobContact = {
      id: Math.random().toString(36).substring(2, 9),
      name: newContact.name.trim(),
      role: newContact.role.trim() || undefined,
      email: newContact.email.trim() || undefined,
      linkedin_url: newContact.linkedin_url.trim() || undefined,
      notes: newContact.notes.trim() || undefined,
    };

    if (user) {
      try {
        const res = await fetch(`/api/jobs/${selectedJob.id}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactItem)
        });
        if (res.ok) {
          const dbContact = await res.json();
          
          const updatedJobs = jobs.map(j => {
            if (j.id === selectedJob.id) {
              return { ...j, contacts: [...(j.contacts || []), dbContact] };
            }
            return j;
          });
          syncJobs(updatedJobs);
          setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
          toast.success("Contact added");
        }
      } catch (e) {
        toast.error("Failed to add contact online");
      }
    } else {
      const updatedJobs = jobs.map(j => {
        if (j.id === selectedJob.id) {
          return { ...j, contacts: [...(j.contacts || []), contactItem] };
        }
        return j;
      });
      syncJobs(updatedJobs);
      setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
      toast.success("Contact added locally");
    }

    setNewContact({ name: "", role: "", email: "", linkedin_url: "", notes: "" });
    setShowAddContact(false);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedJob) return;

    if (user) {
      try {
        const res = await fetch(`/api/jobs/${selectedJob.id}/contacts?contactId=${contactId}`, { method: "DELETE" });
        if (res.ok) {
          const updatedJobs = jobs.map(j => {
            if (j.id === selectedJob.id) {
              return { ...j, contacts: (j.contacts || []).filter(c => c.id !== contactId) };
            }
            return j;
          });
          syncJobs(updatedJobs);
          setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
          toast.success("Contact deleted");
        }
      } catch (e) {
        toast.error("Failed to delete contact");
      }
    } else {
      const updatedJobs = jobs.map(j => {
        if (j.id === selectedJob.id) {
          return { ...j, contacts: (j.contacts || []).filter(c => c.id !== contactId) };
        }
        return j;
      });
      syncJobs(updatedJobs);
      setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
      toast.success("Contact deleted locally");
    }
  };

  // Reminders CRUD Actions
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.due_at || !newReminder.message.trim() || !selectedJob) return;

    const reminderItem: JobReminder = {
      id: Math.random().toString(36).substring(2, 9),
      due_at: new Date(newReminder.due_at).toISOString(),
      type: newReminder.type,
      message: newReminder.message.trim(),
      status: "pending",
      notification_email: newReminder.notification_email?.trim() || undefined,
    };

    if (user) {
      try {
        const res = await fetch(`/api/jobs/${selectedJob.id}/reminders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reminderItem)
        });
        if (res.ok) {
          const dbReminder = await res.json();
          const updatedJobs = jobs.map(j => {
            if (j.id === selectedJob.id) {
              return { ...j, reminders: [...(j.reminders || []), dbReminder] };
            }
            return j;
          });
          syncJobs(updatedJobs);
          setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
          toast.success("Reminder set! Sending confirmation email…");

          // Immediately send a confirmation email so the user knows the reminder is active
          try {
            const emailRes = await fetch("/api/reminders/send-now", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reminderId: dbReminder.id,
                recipientEmail: reminderItem.notification_email || undefined,
              }),
            });
            const emailData = await emailRes.json();
            if (emailRes.ok) {
              toast.success(`📧 Confirmation email sent to ${emailData.sentTo}!`);
            } else {
              console.warn("[Reminder] Confirmation email failed:", emailData.error);
              toast.warning("Reminder saved, but confirmation email could not be sent.");
            }
          } catch (emailErr) {
            console.error("[Reminder] Confirmation email network error:", emailErr);
          }
        }
      } catch (e) {
        toast.error("Failed to set reminder online");
      }
    } else {
      const updatedJobs = jobs.map(j => {
        if (j.id === selectedJob.id) {
          return { ...j, reminders: [...(j.reminders || []), reminderItem] };
        }
        return j;
      });
      syncJobs(updatedJobs);
      setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
      toast.success("Reminder set locally!");
    }

    setNewReminder({ due_at: "", type: "followup", message: "", notification_email: "" });
    setShowAddReminder(false);
  };

  const handleToggleReminder = async (reminderId: string, currentStatus: "pending" | "done") => {
    if (!selectedJob) return;
    const nextStatus: "pending" | "done" = currentStatus === "pending" ? "done" : "pending";

    const updatedJobs = jobs.map(j => {
      if (j.id === selectedJob.id) {
        return {
          ...j,
          reminders: (j.reminders || []).map(r => r.id === reminderId ? { ...r, status: nextStatus } : r)
        };
      }
      return j;
    });
    setJobs(updatedJobs);

    if (user) {
      try {
        const res = await fetch(`/api/jobs/${selectedJob.id}/reminders?reminderId=${reminderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) {
          localStorage.setItem(`fresher_jobs_v2_${user.id}`, JSON.stringify(updatedJobs));
        }
      } catch (e) {
        toast.error("Failed to sync reminder status");
      }
    } else {
      syncJobs(updatedJobs);
    }
    setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!selectedJob) return;

    if (user) {
      try {
        const res = await fetch(`/api/jobs/${selectedJob.id}/reminders?reminderId=${reminderId}`, { method: "DELETE" });
        if (res.ok) {
          const updatedJobs = jobs.map(j => {
            if (j.id === selectedJob.id) {
              return { ...j, reminders: (j.reminders || []).filter(r => r.id !== reminderId) };
            }
            return j;
          });
          syncJobs(updatedJobs);
          setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
          toast.success("Reminder deleted");
        }
      } catch (e) {
        toast.error("Failed to delete reminder");
      }
    } else {
      const updatedJobs = jobs.map(j => {
        if (j.id === selectedJob.id) {
          return { ...j, reminders: (j.reminders || []).filter(r => r.id !== reminderId) };
        }
        return j;
      });
      syncJobs(updatedJobs);
      setSelectedJob(updatedJobs.find(j => j.id === selectedJob.id) || null);
      toast.success("Reminder deleted locally");
    }
  };

  // Send reminder email immediately
  const handleSendReminderNow = async (reminderId: string, recipientEmail?: string) => {
    if (!user) {
      toast.error("You must be logged in to send reminder emails.");
      return;
    }
    try {
      const res = await fetch("/api/reminders/send-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId, recipientEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`📧 Reminder email sent to ${data.sentTo}!`);
        // Update status to notified in local state
        const updatedJobs = jobs.map(j => {
          if (j.id === selectedJob?.id) {
            return {
              ...j,
              reminders: (j.reminders || []).map(r =>
                r.id === reminderId ? { ...r, status: "notified" as any } : r
              ),
            };
          }
          return j;
        });
        syncJobs(updatedJobs);
        setSelectedJob(updatedJobs.find(j => j.id === selectedJob?.id) || null);
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch (e: any) {
      toast.error("Network error: " + e.message);
    }
  };

  // Inline Note Updates in Drawer
  const handleSaveNotes = async (val: string) => {
    if (!selectedJob) return;
    
    const updatedJobs = jobs.map(j => {
      if (j.id === selectedJob.id) return { ...j, notes: val, updated_at: new Date().toISOString() };
      return j;
    });
    setJobs(updatedJobs);

    if (user) {
      try {
        await fetch(`/api/jobs/${selectedJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: val })
        });
        localStorage.setItem(`fresher_jobs_v2_${user.id}`, JSON.stringify(updatedJobs));
      } catch (e) {
        console.error("Cloud note save failed");
      }
    } else {
      syncJobs(updatedJobs);
    }
  };

  // Update Excitement rating directly
  const handleUpdateExcitement = async (id: string, stars: number) => {
    const updatedJobs = jobs.map(j => {
      if (j.id === id) return { ...j, excitement_rating: stars };
      return j;
    });
    setJobs(updatedJobs);

    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({ ...selectedJob, excitement_rating: stars });
    }

    if (user) {
      try {
        await fetch(`/api/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ excitement_rating: stars })
        });
        localStorage.setItem(`fresher_jobs_v2_${user.id}`, JSON.stringify(updatedJobs));
      } catch (e) {
        console.error("Cloud excitement save failed");
      }
    } else {
      syncJobs(updatedJobs);
    }
  };

  // Form Trigger Handlers
  const openAddModal = () => {
    setEditingJob(null);
    setModalForm({
      company_name: "",
      job_title: "",
      job_url: "",
      jd_text: "",
      status: "saved",
      salary: "",
      location: "",
      notes: "",
      applied_date: new Date().toISOString().split("T")[0],
      excitement_rating: 3,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobApplication) => {
    setEditingJob(job);
    setModalForm({
      company_name: job.company_name,
      job_title: job.job_title,
      job_url: job.job_url || "",
      jd_text: job.jd_text || "",
      status: job.status,
      salary: job.salary || "",
      location: job.location || "",
      notes: job.notes || "",
      applied_date: job.applied_date || new Date().toISOString().split("T")[0],
      excitement_rating: job.excitement_rating,
    });
    setIsModalOpen(true);
  };

  const handleCardClick = (job: JobApplication) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  // Analytics Computation
  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter(j => j.status !== "rejected" && j.status !== "offer").length;
    const interviews = jobs.filter(j => j.status === "interview").length;
    const offers = jobs.filter(j => j.status === "offer").length;
    const ots = jobs.filter(j => j.status === "online_test").length;
    
    // Funnel rates
    const applied = jobs.filter(j => j.status !== "saved").length;
    const conversionRate = applied > 0 ? Math.round((offers / applied) * 100) : 0;
    const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;

    return { total, active, interviews, offers, ots, conversionRate, interviewRate };
  }, [jobs]);

  // Filters and sorting calculation
  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const matchesSearch = 
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.notes && job.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === "all" || job.status === statusFilter;
        const matchesLocation = locationFilter === "all" || 
          (locationFilter === "remote" && job.location?.toLowerCase().includes("remote")) ||
          (locationFilter === "onsite" && !job.location?.toLowerCase().includes("remote") && !job.location?.toLowerCase().includes("hybrid")) ||
          (locationFilter === "hybrid" && job.location?.toLowerCase().includes("hybrid"));

        return matchesSearch && matchesStatus && matchesLocation;
      })
      .sort((a, b) => {
        if (sortBy === "company_name") return a.company_name.localeCompare(b.company_name);
        if (sortBy === "job_title") return a.job_title.localeCompare(b.job_title);
        if (sortBy === "match_score") return (b.match_score || 0) - (a.match_score || 0);
        // Default to updated_at descending
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [jobs, searchQuery, statusFilter, locationFilter, sortBy]);

  // Grouped jobs for board columns
  const boardGroups = useMemo(() => {
    const groups: Record<ApplicationStatus, JobApplication[]> = {
      saved: [],
      applied: [],
      online_test: [],
      interview: [],
      offer: [],
      rejected: [],
    };
    filteredJobs.forEach(job => {
      groups[job.status].push(job);
    });
    return groups;
  }, [filteredJobs]);

  // Bookmarklet JS string generator
  const bookmarkletCode = useMemo(() => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    
    return `javascript:(function(){
      const title = document.title || '';
      const url = window.location.href;
      let jd = '';
      
      // Basic heuristic for extracting main text content
      const selection = window.getSelection().toString();
      if(selection) {
        jd = selection;
      } else {
        const textBlocks = Array.from(document.querySelectorAll('p, li, div.job-description, section.description')).map(el => el.innerText.trim()).filter(t => t.length > 50);
        jd = textBlocks.slice(0, 10).join('\\n\\n');
      }

      const companyMatches = title.match(/at\\s+([^|\\-\\n]+)/i) || title.match(/([^|\\-\\n]+)\\s+Hiring/i);
      const company = companyMatches ? companyMatches[1].trim() : '';
      const cleanTitle = title.replace(/at\\s+[^|\\-\\n]+/i, '').split(/[|\\-\\n]/)[0].trim();

      const targetUrl = '${origin}/job-tracker?action=add&title=' + encodeURIComponent(cleanTitle) + '&company=' + encodeURIComponent(company) + '&url=' + encodeURIComponent(url) + '&jd=' + encodeURIComponent(jd.slice(0, 5000));
      window.open(targetUrl, '_blank');
    })();`.replace(/\s+/g, ' ');
  }, []);

  // Capture URL parameters for Bookmarklet quick adds
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "add") {
      const title = params.get("title") || "";
      const company = params.get("company") || "";
      const url = params.get("url") || "";
      const jd = params.get("jd") || "";

      setModalForm(prev => ({
        ...prev,
        job_title: title,
        company_name: company,
        job_url: url,
        jd_text: jd,
        status: "saved"
      }));
      setIsModalOpen(true);
      
      // Clean query parameters from URL without reloading
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Briefcase className="h-10 w-10 text-blue-600 animate-spin" />
          <span className="text-zinc-500 animate-pulse font-bold text-sm uppercase tracking-widest">Loading Career Suite...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
      
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#0f172a] via-[#1e1b4b] to-[#1e3a5f] pb-10 pt-12">
        {/* Visual accents */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-200">Job Tracker</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />
                ATS Integrated Scanner
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-2">
                My Job Tracker
              </h1>
              <p className="text-slate-400 text-sm font-medium max-w-xl">
                Organize your applications through entry-level stage milestones. Run automated ATS match-scoring to reveal matched/missing resume keywords.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              
              {/* Bookmarklet installer */}
              <div className="hidden lg:flex items-center gap-2.5 rounded-2xl border border-zinc-700/50 bg-slate-900/60 p-3 text-xs text-slate-300">
                <div className="leading-tight">
                  <div className="font-extrabold text-white">Capture Bookmarklet</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Drag to bookmarks bar</div>
                </div>
                <a
                  href={bookmarkletCode}
                  onClick={(e) => e.preventDefault()}
                  className="rounded-xl bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 px-3 py-1.5 font-bold transition-all text-[11px] cursor-grab active:cursor-grabbing inline-flex items-center gap-1.5"
                  title="Drag this button to your Browser Bookmarks toolbar to capture job posts on Indeed/LinkedIn."
                >
                  <Copy className="h-3.5 w-3.5 text-blue-400" />
                  + Save Job
                </a>
              </div>

              {/* Cloud Status indicator */}
              <div className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-700/50 bg-slate-900/60 p-3 text-xs text-slate-300">
                {isCloudSynced ? (
                  <>
                    <Cloud className="h-4.5 w-4.5 text-green-400" />
                    <div>
                      <div className="font-extrabold text-white">Cloud Backed Up</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-32">{user?.email}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                    <div>
                      <div className="font-extrabold text-white">Local Guest Mode</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        <Link href="/login" className="text-blue-400 hover:underline">Log in</Link> to sync cloud.
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-98 shadow-md cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                Add New Job
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats Dashboard Section ─── */}
      <div className="mx-auto max-w-7xl px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Total Jobs</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{stats.total}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Online Tests</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{stats.ots}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Interviews</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{stats.interviews}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Offers</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{stats.offers}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm col-span-2 md:col-span-1 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Conversion Funnel</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{stats.conversionRate}%</span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Controls & Filtering Bar ─── */}
      <div className="mx-auto max-w-7xl px-6 mt-8">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by company, title, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Location filter */}
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3 py-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
              </select>
            </div>

            {/* Sort order */}
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3 py-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <option value="updated_at">Last Updated</option>
                <option value="company_name">Company Name</option>
                <option value="job_title">Job Title</option>
                <option value="match_score">Highest ATS Score</option>
              </select>
            </div>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            {/* Segmented View Mode Toggle */}
            <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-950 p-1 border border-zinc-200/40 dark:border-zinc-800">
              <button
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "board"
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
                title="Kanban Board view"
              >
                <Grid className="h-4 w-4" />
                Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
                title="Spreadsheet list view"
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ─── Main Content Canvas ─── */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 p-8 shadow-xs">
            <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 mb-6">
              <Briefcase className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Start Organising Your Job Hunt</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mb-8">
              Build your pipeline by creating applications manually, or drag and drop the capture bookmarklet above to scrape roles directly from Job Boards.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-all active:scale-98 cursor-pointer"
            >
              <PlusCircle className="h-5 w-5" />
              Add Your First Job
            </button>
          </div>
        ) : viewMode === "board" ? (
          
          /* ─── KANBAN BOARD VIEW ─── */
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4.5 items-start">
            {STATUS_COLUMNS.map(column => {
              const columnJobs = boardGroups[column.key];
              
              return (
                <div
                  key={column.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, column.key)}
                  className={`rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-3.5 transition-all ${column.bg} min-h-160 flex flex-col`}
                >
                  
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200/50 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                      <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">{column.label}</span>
                    </div>
                    <span className="text-[11px] font-black tracking-widest px-2 py-0.5 rounded-lg bg-zinc-250/20 dark:bg-zinc-800 text-zinc-500">
                      {columnJobs.length}
                    </span>
                  </div>

                  {/* Column Cards Container */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-180 scrollbar-thin">
                    {columnJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400 text-[10px] font-semibold italic">
                        Empty column
                      </div>
                    ) : (
                      columnJobs.map(job => {
                        const score = job.match_score;
                        const scoreColor = score !== undefined && score !== null
                          ? score >= 80 ? "bg-green-500 text-white" : score >= 60 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800";
                        
                        return (
                          <div
                            key={job.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, job.id)}
                            onClick={() => handleCardClick(job)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-grab active:cursor-grabbing group relative"
                          >
                            
                            {/* Card Top: Title + Score Badge */}
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="text-xs font-black text-zinc-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                {job.job_title}
                              </h4>
                              
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${scoreColor} shrink-0`} title="ATS Score">
                                {score !== undefined && score !== null ? `${score}%` : "—"}
                              </span>
                            </div>

                            <div className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 mb-3 truncate">
                              {job.company_name}
                            </div>

                            {/* Excitement Rating */}
                            <div className="flex items-center gap-0.5 mb-3.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateExcitement(job.id, star);
                                  }}
                                  className="text-amber-400 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className="h-3.5 w-3.5"
                                    fill={star <= job.excitement_rating ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth={star <= job.excitement_rating ? 0 : 2}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Details tags */}
                            <div className="space-y-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                              {job.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                  <span className="truncate">{job.location}</span>
                                </div>
                              )}
                              {job.salary && (
                                <div className="flex items-center gap-1.5">
                                  <DollarSign className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                  <span className="truncate">{job.salary}</span>
                                </div>
                              )}
                            </div>

                            {/* Quick indicators */}
                            <div className="flex items-center justify-between border-t border-zinc-150/40 dark:border-zinc-800/80 pt-2.5 mt-3 text-[10px] font-bold text-zinc-400">
                              <div className="flex items-center gap-2">
                                {/* Contacts indicator */}
                                {job.contacts && job.contacts.length > 0 && (
                                  <span className="flex items-center gap-1" title="Linked Contacts">
                                    <Users className="h-3 w-3" />
                                    {job.contacts.length}
                                  </span>
                                )}
                                
                                {/* Reminders indicator */}
                                {job.reminders && job.reminders.length > 0 && (
                                  <span className={`flex items-center gap-1 ${job.reminders.some(r => r.status === "pending") ? "text-amber-500 font-extrabold" : ""}`} title="Reminders scheduled">
                                    <Bell className="h-3 w-3" />
                                    {job.reminders.filter(r => r.status === "pending").length}
                                  </span>
                                )}
                              </div>

                              <span className="text-[9px] font-mono opacity-60">
                                #{job.id.slice(0, 5)}
                              </span>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          
          /* ─── SPREADSHEET LIST VIEW ─── */
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Role & Company</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Status Stage</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">ATS Match</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Excitement</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Location</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400">Salary</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/85">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 text-sm font-semibold italic">
                        No applications matched your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map(job => {
                      const colConf = STATUS_COLUMNS.find(c => c.key === job.status) || STATUS_COLUMNS[0];
                      const score = job.match_score;
                      const scoreColor = score !== undefined && score !== null
                        ? score >= 80 ? "bg-green-500 text-white" : score >= 60 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                        : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800";
                      
                      return (
                        <tr
                          key={job.id}
                          onClick={() => handleCardClick(job)}
                          className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors cursor-pointer"
                        >
                          
                          {/* Role & Company */}
                          <td className="px-6 py-4">
                            <div className="font-extrabold text-zinc-900 dark:text-white text-sm">{job.job_title}</div>
                            <div className="text-xs font-bold text-zinc-500 mt-0.5 flex items-center gap-1.5">
                              {job.company_name}
                              {job.job_url && (
                                <a href={job.job_url} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="text-zinc-400 hover:text-blue-500">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Status Stage Selector */}
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={job.status}
                              onChange={(e) => handleUpdateStage(job.id, e.target.value as ApplicationStatus)}
                              className="text-xs bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-1.5 font-bold outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
                            >
                              {STATUS_COLUMNS.map(col => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                              ))}
                            </select>
                          </td>

                          {/* ATS Match score */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black ${scoreColor}`}>
                              {score !== undefined && score !== null ? `${score}%` : "No JD"}
                            </span>
                          </td>

                          {/* Excitement direct click */}
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleUpdateExcitement(job.id, star)}
                                  className="text-amber-400 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className="h-3.5 w-3.5"
                                    fill={star <= job.excitement_rating ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth={star <= job.excitement_rating ? 0 : 2}
                                  />
                                </button>
                              ))}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-6 py-4">
                            {job.location ? (
                              <span className="text-xs text-zinc-600 dark:text-zinc-300 font-semibold">{job.location}</span>
                            ) : (
                              <span className="text-xs text-zinc-400 font-medium italic">Not specified</span>
                            )}
                          </td>

                          {/* Salary */}
                          <td className="px-6 py-4">
                            {job.salary ? (
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{job.salary}</span>
                            ) : (
                              <span className="text-xs text-zinc-400 font-medium italic">—</span>
                            )}
                          </td>

                          {/* Action controls */}
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(job)}
                                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        )}

      </main>

      {/* ─── ADD/EDIT APPLICATION MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-1002 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-250">
          
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-blue-600" />
                {editingJob ? "Edit Job Tracker Data" : "Track New Job"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveJob} className="p-6 space-y-4 max-h-160 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.job_title}
                    onChange={(e) => setModalForm({ ...modalForm, job_title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Frontend Developer"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.company_name}
                    onChange={(e) => setModalForm({ ...modalForm, company_name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Stripe"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Job Post URL</label>
                  <input
                    type="url"
                    value={modalForm.job_url}
                    onChange={(e) => setModalForm({ ...modalForm, job_url: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. https://stripe.com/careers/jobs"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Job Description (JD Text for Match Scanning)</label>
                  <textarea
                    value={modalForm.jd_text}
                    onChange={(e) => setModalForm({ ...modalForm, jd_text: e.target.value })}
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Paste job details here. If saved, we run an automated resume keyword matching scanner."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Location</label>
                  <input
                    type="text"
                    value={modalForm.location}
                    onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Remote / Hybrid SF"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Salary</label>
                  <input
                    type="text"
                    value={modalForm.salary}
                    onChange={(e) => setModalForm({ ...modalForm, salary: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. $100k - $120k"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Excitement Rating (1-5)</label>
                  <div className="flex items-center gap-1.5 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setModalForm({ ...modalForm, excitement_rating: star })}
                        className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className="h-5 w-5"
                          fill={star <= modalForm.excitement_rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={star <= modalForm.excitement_rating ? 0 : 2}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Stage</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value as ApplicationStatus })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer text-zinc-700 dark:text-zinc-300"
                  >
                    {STATUS_COLUMNS.map(col => (
                      <option key={col.key} value={col.key}>{col.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Form Actions footer */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shadow-blue-100"
                >
                  Save Job
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

      {/* ─── SIDE-OUT DETAIL DRAWER ─── */}
      {isDrawerOpen && selectedJob && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-1002 bg-zinc-950/20 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-850 shadow-2xl z-1003 flex flex-col animate-in slide-in-from-right duration-350">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
              <div>
                <span className="text-[9px] font-mono text-zinc-400">JOB APPLICATION DETAILS</span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white leading-tight mt-1">{selectedJob.job_title}</h3>
                <p className="text-xs font-bold text-zinc-500 mt-1 flex items-center gap-1.5">
                  {selectedJob.company_name}
                  {selectedJob.job_url && (
                    <a href={selectedJob.job_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-500 inline-flex items-center">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* ATS scoring report */}
              <div className="bg-linear-to-br from-slate-50 to-zinc-50 dark:from-zinc-950/40 dark:to-zinc-900/40 rounded-3xl p-5 border border-zinc-200/50 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-blue-500" />
                    <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">ATS Score Matcher</span>
                  </div>
                  
                  {/* Score update action */}
                  <button
                    onClick={() => handleRunScan(selectedJob.id)}
                    disabled={isScanning === selectedJob.id || !selectedJob.jd_text}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isScanning === selectedJob.id ? "animate-spin" : ""}`} />
                    {isScanning === selectedJob.id ? "Scanning..." : "Re-Scan"}
                  </button>
                </div>

                {selectedJob.match_score !== undefined && selectedJob.match_score !== null ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-4">
                      {/* Circular ring score */}
                      <div className="h-16 w-16 rounded-full bg-slate-900 text-white flex flex-col items-center justify-center font-black relative shrink-0 shadow-lg">
                        <span className="text-xl leading-none">{selectedJob.match_score}</span>
                        <span className="text-[7px] font-bold tracking-widest uppercase text-slate-400 mt-0.5">MATCH</span>
                      </div>
                      
                      <div className="text-xs text-zinc-500 leading-relaxed font-medium">
                        {selectedJob.match_score >= 80 
                          ? "🔥 High Match Rate! Your resume highly aligns with the target job keywords."
                          : selectedJob.match_score >= 60 
                            ? "💡 Good alignment, but there are a few notable keyword gaps. Try tailoring your experience keywords."
                            : "⚠️ Weak Alignment. Many critical skills or technologies are missing. Consider editing bullet points."}
                      </div>
                    </div>

                    {/* Matched Keywords */}
                    {selectedJob.matched_keywords && selectedJob.matched_keywords.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-zinc-400">Matched Skills ({selectedJob.matched_keywords.length})</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJob.matched_keywords.map((kw, i) => (
                            <span key={i} className="text-[10px] font-extrabold bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md border border-green-200/50 dark:border-green-900/30">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Keywords */}
                    {selectedJob.missing_keywords && selectedJob.missing_keywords.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-zinc-400">Missing Gaps ({selectedJob.missing_keywords.length})</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJob.missing_keywords.map((kw, i) => (
                            <span key={i} className="text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-900/30">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-4.5 space-y-2">
                    <Info className="h-6 w-6 text-zinc-400 mx-auto" />
                    <div className="text-xs text-zinc-500 font-semibold">
                      {selectedJob.jd_text ? "No scan results found." : "Add a Job Description (JD) to run keyword matching."}
                    </div>
                    {selectedJob.jd_text && (
                      <button
                        onClick={() => handleRunScan(selectedJob.id)}
                        disabled={isScanning === selectedJob.id}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-4 py-2 mt-2"
                      >
                        Run ATS Match Scan
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* CRM Contacts Section */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-zinc-500" />
                    Contacts CRM
                  </h4>
                  <button
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {showAddContact ? "Cancel" : "+ Add Contact"}
                  </button>
                </div>

                {showAddContact && (
                  <form onSubmit={handleAddContact} className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1 col-span-2">
                        <input
                          type="text"
                          required
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="Contact Name *"
                        />
                      </div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={newContact.role}
                          onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="Role (e.g. Recruiter)"
                        />
                      </div>
                      <div className="space-y-1">
                        <input
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="Email Address"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <input
                          type="url"
                          value={newContact.linkedin_url}
                          onChange={(e) => setNewContact({ ...newContact, linkedin_url: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="LinkedIn URL"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-1.5 rounded-lg transition-all"
                    >
                      Save Contact
                    </button>
                  </form>
                )}

                {selectedJob.contacts && selectedJob.contacts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedJob.contacts.map(c => (
                      <div key={c.id} className="bg-white dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-150 dark:border-zinc-850 flex items-start justify-between">
                        <div>
                          <div className="text-xs font-black text-zinc-950 dark:text-white">{c.name}</div>
                          {c.role && <div className="text-[10px] font-bold text-zinc-500 mt-0.5">{c.role}</div>}
                          
                          <div className="flex items-center gap-3 mt-2">
                            {c.email && (
                              <a href={`mailto:${c.email}`} className="text-zinc-400 hover:text-blue-500 text-[10px] font-bold flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {c.email}
                              </a>
                            )}
                            {c.linkedin_url && (
                              <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-[#0077B5] text-[10px] font-bold flex items-center gap-1">
                                <Linkedin className="h-3.5 w-3.5" />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteContact(c.id)}
                          className="p-1 rounded hover:bg-rose-50 text-zinc-350 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs font-semibold italic text-zinc-400">
                    No contacts recorded for this application.
                  </div>
                )}
              </div>

              {/* Reminders Checklist Section */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Bell className="h-4.5 w-4.5 text-zinc-500" />
                    Tasks & Reminders
                  </h4>
                  <button
                    onClick={() => setShowAddReminder(!showAddReminder)}
                    className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {showAddReminder ? "Cancel" : "+ Set Reminder"}
                  </button>
                </div>

                {showAddReminder && (
                  <form onSubmit={handleAddReminder} className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">Reminder Description</label>
                        <input
                          type="text"
                          required
                          value={newReminder.message}
                          onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="e.g. Schedule preparation mock interview"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400">Due Date</label>
                          <input
                            type="datetime-local"
                            required
                            value={newReminder.due_at}
                            onChange={(e) => setNewReminder({ ...newReminder, due_at: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400">Type</label>
                          <select
                            value={newReminder.type}
                            onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as any })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none text-zinc-700 dark:text-zinc-300"
                          >
                            <option value="followup">Follow Up</option>
                            <option value="interview">Interview Deadline</option>
                            <option value="deadline">Application Close</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-zinc-400">Recipient Email (Optional)</label>
                        <input
                          type="email"
                          value={newReminder.notification_email || ""}
                          onChange={(e) => setNewReminder({ ...newReminder, notification_email: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="e.g. your.email@example.com"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-1.5 rounded-lg transition-all"
                    >
                      Save Task
                    </button>
                  </form>
                )}

                {selectedJob.reminders && selectedJob.reminders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedJob.reminders.map(r => {
                      const isOverdue = r.status === "pending" && new Date(r.due_at) < new Date();
                      const isNotified = r.status === "notified";
                      return (
                      <div key={r.id} className={`bg-white dark:bg-zinc-900/60 p-3 rounded-2xl border flex flex-col gap-2 ${
                        isOverdue ? "border-rose-300 dark:border-rose-800/60 bg-rose-50/30" :
                        isNotified ? "border-green-200 dark:border-green-900/40" :
                        "border-zinc-150 dark:border-zinc-850"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleReminder(r.id, r.status === "notified" ? "done" : r.status)}
                              className="text-zinc-400 hover:text-blue-500 transition-colors"
                            >
                              {r.status === "done" || r.status === "notified" ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5" />
                              )}
                            </button>

                            <div className={r.status === "done" ? "line-through text-zinc-400" : ""}>
                              <div className="text-xs font-bold text-zinc-900 dark:text-white">{r.message}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-zinc-400">
                                  {new Date(r.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {isOverdue && (
                                  <span className="text-[9px] font-black uppercase tracking-wide text-rose-600 bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded-full">⚠ Overdue</span>
                                )}
                                {isNotified && (
                                  <span className="text-[9px] font-black uppercase tracking-wide text-green-700 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">✓ Email Sent</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteReminder(r.id)}
                            className="p-1 rounded hover:bg-rose-50 text-zinc-350 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Send Now button — only for pending/overdue reminders when logged in */}
                        {user && (r.status === "pending") && (
                          <button
                            type="button"
                            onClick={() => handleSendReminderNow(r.id, r.notification_email)}
                            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-[10px] font-black uppercase tracking-wide transition-all ${
                              isOverdue
                                ? "bg-rose-600 hover:bg-rose-700 text-white"
                                : "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                            }`}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {isOverdue ? "Send Overdue Email Now" : "Send Test Email Now"}
                          </button>
                        )}
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs font-semibold italic text-zinc-400">
                    No reminders set.
                  </div>
                )}
              </div>

              {/* Note History log */}
              <div className="space-y-2">
                <div className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider">Application Notes</div>
                <textarea
                  defaultValue={selectedJob.notes || ""}
                  onBlur={(e) => handleSaveNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Record application details, interviewer feedback, or salary logs here..."
                />
              </div>

            </div>

            {/* CTAs Footer Action panel */}
            <div className="p-6 border-t border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between gap-3 shrink-0">
              
              <Link
                href={`/ai-cover-letter-generator?action=new&company=${encodeURIComponent(selectedJob.company_name)}&jobTitle=${encodeURIComponent(selectedJob.job_title)}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-purple-600 fill-purple-100 dark:fill-none" />
                Generate Cover Letter
              </Link>
              
              {/* Tailor Resume Deep Link */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    // Set tailor variables
                    window.sessionStorage.setItem("tailorJobTitle", selectedJob.job_title);
                    window.sessionStorage.setItem("tailorCompany", selectedJob.company_name);
                    
                    if (selectedJob.missing_keywords && selectedJob.missing_keywords.length > 0) {
                      window.sessionStorage.setItem("tailorKeywords", JSON.stringify(selectedJob.missing_keywords));
                    }
                    
                    router.push("/editor");
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Tailor Resume
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
