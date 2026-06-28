import { createAdminClient } from "@/lib/supabase/admin";

export interface EntitlementState {
  isPro: boolean;
  plan: "free" | "pro_monthly" | "pass";
  proUntil?: string;
  passExpiresAt?: string;
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  credits: number;
}

export async function getEntitlement(userId: string): Promise<EntitlementState> {
  const supabase = createAdminClient();

  // Fetch active subscriptions
  const { data: subData } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end, price_id")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .single();

  // Fetch unexpired pass grants
  const { data: passData } = await supabase
    .from("pass_grants")
    .select("access_expires_at")
    .eq("user_id", userId)
    .gt("access_expires_at", new Date().toISOString())
    .order("access_expires_at", { ascending: false })
    .limit(1)
    .single();

  // Aggregate total credits
  const { data: creditsData } = await supabase
    .from("purchases")
    .select("credits_remaining")
    .eq("user_id", userId);

  const totalCredits = creditsData 
    ? creditsData.reduce((sum, row) => sum + row.credits_remaining, 0)
    : 0;

  const hasActiveSub = !!subData;
  const hasActivePass = !!passData;
  const isPro = hasActiveSub || hasActivePass;

  let plan: "free" | "pro_monthly" | "pass" = "free";
  if (hasActiveSub) plan = "pro_monthly";
  else if (hasActivePass) plan = "pass";

  return {
    isPro,
    plan,
    proUntil: hasActiveSub ? subData.current_period_end : (hasActivePass ? passData.access_expires_at : undefined),
    passExpiresAt: passData?.access_expires_at,
    subscriptionStatus: subData?.status,
    cancelAtPeriodEnd: subData?.cancel_at_period_end,
    credits: totalCredits,
  };
}

export async function requirePro(userId: string) {
  const entitlement = await getEntitlement(userId);
  if (!entitlement.isPro) {
    throw new Error("Payment Required: Pro tier is required for this feature.");
  }
}

export async function consumeCredit(userId: string, kind: string = "single_resume_pack"): Promise<boolean> {
  const supabase = createAdminClient();

  // We find the oldest purchase with credits remaining and decrement it
  // Note: For actual concurrency, this should be an RPC call.
  // We'll do a simple select + update for now.
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, credits_remaining")
    .eq("user_id", userId)
    .eq("kind", kind)
    .gt("credits_remaining", 0)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!purchase) {
    return false; // No credits available
  }

  const { error } = await supabase
    .from("purchases")
    .update({ credits_remaining: purchase.credits_remaining - 1 })
    .eq("id", purchase.id)
    .gt("credits_remaining", 0);

  if (error) {
    console.error("Failed to consume credit:", error);
    return false;
  }

  return true;
}
