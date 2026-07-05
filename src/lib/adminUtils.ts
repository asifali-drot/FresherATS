/**
 * Admin utility — server-side only.
 *
 * Admins are now determined by their `tier` in the `user_subscriptions` table
 * being set to "admin". This role receives Claude Sonnet 4.6 and other perks.
 */

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>;

/**
 * Returns the effective tier for a given user ID.
 * Looks up `user_subscriptions` and falls back to "free".
 * If the user's tier is "admin", they are treated as an admin.
 */
export async function getEffectiveTier(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
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
  if (tier === "starter" || tier === "pro" || tier === "admin") {
    return "anthropic/claude-sonnet-4.6";
  }
  return "openai/gpt-4o-mini";
}


