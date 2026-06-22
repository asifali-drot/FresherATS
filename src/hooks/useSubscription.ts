"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export type Tier = "free" | "starter" | "pro";

export interface Usage {
  pdf_downloads: number;
  linkedin_checks: number;
  cover_letters: number;
}

export function useSubscription() {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<Tier>("free");
  const [usage, setUsage] = useState<Usage>({
    pdf_downloads: 0,
    linkedin_checks: 0,
    cover_letters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch tier
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("tier")
          .eq("user_id", user.id)
          .single();

        if (subData) {
          setTier(subData.tier as Tier);
        }

        // Fetch usage
        const { data: usageData } = await supabase
          .from("usage_tracking")
          .select("pdf_downloads, linkedin_checks, cover_letters")
          .eq("user_id", user.id)
          .single();

        if (usageData) {
          setUsage({
            pdf_downloads: usageData.pdf_downloads || 0,
            linkedin_checks: usageData.linkedin_checks || 0,
            cover_letters: usageData.cover_letters || 0,
          });
        }
      }

      setLoading(false);
    };

    fetchSubscription();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          fetchSubscription();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, tier, usage, loading };
}
