import Link from "next/link";
import { ArrowRight, Star, MessageSquareQuote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ReviewCard from "./ReviewCard";

export default async function LatestReviews() {
  let reviews: any[] = [];
  let stats = { totalReviews: 0, averageRating: 0, ratingBreakdown: [0, 0, 0, 0, 0] };

  try {
    const supabase = await createClient();

    // Fetch all reviews to calculate accurate stats, but only show latest 6
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const allReviews = data;
      reviews = allReviews.slice(0, 6);

      const total = allReviews.length;
      const avg =
        total > 0
          ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total
          : 0;

      const breakdown = [0, 0, 0, 0, 0];
      allReviews.forEach((r: any) => {
        if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating - 1]++;
      });

      stats = {
        totalReviews: total,
        averageRating: Math.round(avg * 10) / 10,
        ratingBreakdown: breakdown,
      };
    }
  } catch (e) {
    console.error("[LatestReviews] Error fetching reviews:", e);
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 mb-3">
            Reviews
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            What our users say
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
            No reviews yet. Be the first to share your experience with FresherATS!
          </p>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors active:scale-[0.98]"
          >
            Write a review <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 mb-3">
            Reviews
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            What our users say
          </h2>
        </div>

        {/* Aggregate stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {stats.averageRating}
              </span>
            </div>
            <div className="text-xs text-zinc-400 leading-tight">
              <span className="font-bold text-zinc-600 dark:text-zinc-400">{stats.totalReviews}</span>
              <br />
              {stats.totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-800 hover:border-purple-200 hover:bg-purple-50 transition-all"
          >
            See all reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Review cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review: any) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            rating={review.rating}
            comment={review.comment}
            userName={review.user_name}
            createdAt={review.created_at}
            avatarUrl={review.avatar_url}
          />
        ))}
      </div>

      {/* CTA if more reviews exist */}
      {stats.totalReviews > 6 && (
        <div className="mt-8 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors"
          >
            View all {stats.totalReviews} reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
