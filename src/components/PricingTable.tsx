"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { ClientPlan } from "@/lib/pricing/plans";
import { toast } from "sonner";
import { track } from "@vercel/analytics";
import Script from "next/script";

// Extend window to include the LemonSqueezy JS SDK
declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
    };
    createLemonSqueezy?: () => void;
  }
}

interface PricingTableProps {
  plans: ClientPlan[];
}

export default function PricingTable({ plans }: PricingTableProps) {
  const { user, loading: subLoading } = useSubscription();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const router = useRouter();

  const freePlan = plans.find((p) => p.id === "free");
  const proMonthly = plans.find((p) => p.id === "pro_monthly");
  const proQuarterly = plans.find((p) => p.id === "pro_quarterly");
  const packPlan = plans.find((p) => p.id === "single_resume_pack");

  const handleCheckout = async (planId: string) => {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    if (planId === "free") return;

    setLoadingCheckout(planId);
    track("checkout_started", { planId });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate checkout");

      if (data.url) {
        // Open as an embedded overlay instead of redirecting
        if (window.LemonSqueezy?.Url?.Open) {
          window.LemonSqueezy.Url.Open(data.url);
        } else {
          // Fallback: redirect if the SDK hasn't loaded yet
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingCheckout(null);
    }
  };

  const planRow = [freePlan, proMonthly, proQuarterly];

  return (
    <div className="w-full">
      {/* Load the LemonSqueezy embed SDK */}
      <Script
        src="https://assets.lemonsqueezy.com/lemon.js"
        strategy="lazyOnload"
        onLoad={() => window.createLemonSqueezy?.()}
      />
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-8">
          Choose the plan that best fits your job search needs. Upgrade anytime to unlock advanced AI features.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-16 items-stretch">
        {planRow.map((t) => {
          if (!t) return null;
          const isHighlighted = t.id === "pro_monthly" || t.id === "pro_quarterly";

          return (
            <div
              key={t.id}
              className={`flex flex-col rounded-3xl bg-white p-8 shadow-xl ring-1 transition-all ${isHighlighted
                  ? "ring-purple-600 ring-2 scale-105 transform z-10"
                  : "ring-gray-200 hover:ring-gray-300"
                }`}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{t.name}</h3>
                  {isHighlighted && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  {t.priceLabel}
                </div>
                {t.billingType === "pass" && <p className="text-sm text-gray-500 mt-2 font-medium">One-time payment</p>}
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {t.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="shrink-0">
                      <Check className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(t.id)}
                disabled={subLoading || loadingCheckout === t.id}
                className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-all text-center block items-center justify-center gap-2 cursor-pointer ${isHighlighted
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
                    : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {loadingCheckout === t.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.billingType === "free" ? "Get Started" : "Choose Plan"}
              </button>
            </div>
          );
        })}
      </div>

      {packPlan && (
        <div className="max-w-6xl mx-auto rounded-3xl bg-gray-50 p-8 ring-1 ring-gray-200 text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{packPlan.name}</h3>
            <p className="text-gray-600 text-sm">{packPlan.features.join(" • ")}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-2xl font-bold">{packPlan.priceLabel}</div>
            <button onClick={() => handleCheckout(packPlan.id)} disabled={loadingCheckout === packPlan.id} className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 flex items-center gap-2 cursor-pointer">
              {loadingCheckout === packPlan.id && <Loader2 className="w-4 h-4 animate-spin" />} Buy Pack
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Compare us to Jobscan at $49.99/mo</p>
      </div>
    </div>
  );
}
