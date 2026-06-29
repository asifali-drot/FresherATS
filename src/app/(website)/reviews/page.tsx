import type { Metadata } from "next";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewCard from "@/components/reviews/ReviewCard";
import StarRating from "@/components/reviews/StarRating";
import { generateReviewAggregateSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "See what job seekers say about FresherATS. Read honest reviews and ratings from real users who improved their resumes with our free ATS checker.",
  openGraph: {
    title: "Reviews | FresherATS",
    description:
      "Real reviews from job seekers who used FresherATS to optimize their resumes and beat ATS systems.",
    url: "https://fresherats.com/reviews",
  },
};

export default async function ReviewsPage() {
  const supabase = await createClient();

  // Fetch user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  const allReviews = reviews ?? [];

  // Calculate stats
  const totalReviews = allReviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round(
        (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
      ) / 10
      : 0;

  const ratingBreakdown = [0, 0, 0, 0, 0];
  allReviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) ratingBreakdown[r.rating - 1]++;
  });

  // Find existing review by user
  const existingReview = user
    ? allReviews.find((r) => r.user_id === user.id) ?? null
    : null;

  return (
    <main className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 pt-12 pb-8 sm:pt-16 sm:pb-12">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-purple-100 rounded-full blur-[140px] -z-10 pointer-events-none opacity-60" />

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 mb-3">
            Community
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Reviews from{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-500 to-purple-600">
              Real Users
            </span>
          </h1>
          <p className="text-zinc-600 max-w-xl mx-auto text-lg">
            See what job seekers say about their experience with FresherATS and how it helped them land interviews.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {/* Stats + Form row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Aggregate stats card */}
          <div className="rounded-3xl border border-zinc-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Overall Rating</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            {/* Big score */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl font-extrabold text-zinc-900">
                {totalReviews > 0 ? averageRating : "—"}
              </span>
              <div>
                <StarRating
                  rating={Math.round(averageRating)}
                  size="md"
                  readonly
                />
                <p className="text-xs text-zinc-400 mt-1">out of 5</p>
              </div>
            </div>

            {/* Rating breakdown bars */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingBreakdown[star - 1];
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500 w-3 text-right">
                      {star}
                    </span>
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-300 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-6 text-right font-medium">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review form */}
          <div className="lg:col-span-2">
            <ReviewForm isLoggedIn={!!user} />
          </div>
        </div>

        {/* All reviews */}
        {allReviews.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-zinc-900">
                All Reviews
              </h2>
              <p className="text-sm text-zinc-400">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"} from
                our community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  rating={review.rating}
                  comment={review.comment}
                  userName={review.user_name}
                  createdAt={review.created_at}
                  avatarUrl={review.avatar_url}
                  isOwner={user?.id === review.user_id}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
            <p className="text-zinc-500 text-lg font-medium">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateReviewAggregateSchema({
            name: "FresherATS",
            ratingValue: totalReviews > 0 ? averageRating : 5,
            ratingCount: totalReviews > 0 ? totalReviews : 1,
            reviews: allReviews.map(r => ({
              authorName: r.user_name || "Anonymous",
              rating: r.rating,
              reviewBody: r.comment || "",
              datePublished: new Date(r.created_at).toISOString()
            }))
          }))
        }}
      />
    </main>
  );
}
