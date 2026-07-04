/**
 * Admin bypass utility — server-side only.
 *
 * Set ADMIN_USER_IDS in your .env.local as a comma-separated list of
 * Supabase user UUIDs that should receive unrestricted ("pro") access:
 *
 *   ADMIN_USER_IDS=uuid-1,uuid-2
 *
 * Admins bypass ALL tier checks, usage limits, and gating in every API route.
 */

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>;

/**
 * Returns the effective tier for a given user ID.
 * - Admin users always get "pro" regardless of their subscription row.
 * - Otherwise, looks up `user_subscriptions` and falls back to "free".
 */
export async function getEffectiveTier(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  if (isAdmin(userId)) return "pro";

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .single();

  return sub?.tier || "free";
}

/**
 * Returns the OpenRouter model ID for a given user tier.
 * - Paid users (starter / pro / admin) get Claude Sonnet 4.6.
 * - Free and guest users get gpt-4o-mini.
 */
export function getModelForTier(tier: string): string {
  if (tier === "starter" || tier === "pro") {
    return "anthropic/claude-sonnet-4.6";
  }
  return "openai/gpt-4o-mini";
}

/**
 * Returns true if the given user ID is in the ADMIN_USER_IDS env variable.
 */
export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const raw = process.env.ADMIN_USER_IDS ?? "";
  if (!raw.trim()) return false;
  return raw.split(",").map((id) => id.trim()).includes(userId);
}
