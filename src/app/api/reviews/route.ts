export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const supabase = await createClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Reviews GET] Error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Calculate aggregate stats
    const totalReviews = reviews?.length ?? 0;
    const averageRating =
      totalReviews > 0
        ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Rating breakdown (count per star)
    const ratingBreakdown = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
    reviews?.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingBreakdown[r.rating - 1]++;
      }
    });

    return NextResponse.json({
      reviews: reviews ?? [],
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error("[Reviews GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { rating, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }
    if (comment.trim().length > 1000) {
      return NextResponse.json(
        { error: "Comment must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Resolve user name from auth metadata
    const metadata = user.user_metadata ?? {};
    const userName =
      metadata.full_name ||
      `${metadata.first_name ?? ""} ${metadata.last_name ?? ""}`.trim() ||
      "Anonymous User";
    const avatarUrl = metadata.avatar_url || null;

    // Upsert: insert new or update existing review for this user
    const { data: review, error: dbError } = await supabase
      .from("reviews")
      .upsert(
        {
          user_id: user.id,
          rating: Math.round(rating),
          comment: comment.trim(),
          user_name: userName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (dbError) {
      console.error("[Reviews POST] DB Error:", dbError.message);
      return NextResponse.json(
        { error: "Failed to save review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[Reviews POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
