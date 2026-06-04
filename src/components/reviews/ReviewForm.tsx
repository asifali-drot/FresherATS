"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, CheckCircle2, AlertCircle, Loader2, LogIn, Pencil } from "lucide-react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  isLoggedIn: boolean;
  existingReview?: {
    rating: number;
    comment: string;
  } | null;
}

export default function ReviewForm({ isLoggedIn, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const isEditing = !!existingReview;

  // Sync if existingReview changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
          <LogIn className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-2">
          Share your experience
        </h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          Log in to leave a review and help other job seekers discover FresherATS.
        </p>
        <Link
          href="/login?redirect=/reviews"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4" />
          Log in to review
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (rating === 0) {
      setFeedback({ type: "error", message: "Please select a star rating" });
      return;
    }
    if (!comment.trim()) {
      setFeedback({ type: "error", message: "Please write a comment" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to submit review" });
        return;
      }

      setFeedback({
        type: "success",
        message: isEditing
          ? "Your review has been updated!"
          : "Thank you for your review!",
      });

      // Reload after a short delay to show the new review
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setFeedback({ type: "error", message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-100 bg-white p-6 sm:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
          {isEditing ? <Pencil className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900">
            {isEditing ? "Update your review" : "Write a review"}
          </h3>
          <p className="text-xs text-zinc-400">
            {isEditing
              ? "Edit your existing review below"
              : "Share your experience with FresherATS"}
          </p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-zinc-700 mb-2">
          Your rating
        </label>
        <StarRating rating={rating} onChange={setRating} size="lg" />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="review-comment" className="block text-sm font-bold text-zinc-700 mb-1.5">
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Tell us what you liked, what helped you, or what could be better..."
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all resize-none"
        />
        <p className="mt-1 text-xs text-zinc-400 text-right">{comment.length}/500</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {isEditing ? "Update review" : "Submit review"}
          </>
        )}
      </button>
    </form>
  );
}
