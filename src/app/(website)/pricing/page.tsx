"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";

const tiers = [
  {
    name: "Free",
    monthlyPrice: "$0",
    quarterlyPrice: "$0",
    description: "Get started",
    features: [
      { name: "Basic ATS analysis", included: true },
      { name: "Editable cover letter templates", included: true },
      { name: "Unlimited LinkedIn checks", included: true },
      { name: "Job tracker — up to 5 jobs", included: true },
      { name: "2 PDF downloads / mo", included: true }
    ],
    buttonText: "Start free",
    tierKey: "free",
    variantIdMonthly: null as string | null,
    variantIdQuarterly: null as string | null,
  },
  {
    name: "Starter",
    monthlyPrice: "$3.99",
    quarterlyPrice: "$8.99",
    description: "For active applicants",
    isPopular: true,
    features: [
      { name: "Everything in Free", included: true },
      { name: "AI cover letter generator — 10/mo", included: true },
      { name: "Job description keyword matching", included: true },
      { name: "Job tracker — unlimited", included: true },
      { name: "Unlimited downloads & LinkedIn checks", included: true },
    ],
    buttonText: "Choose Starter",
    tierKey: "starter",
    variantIdMonthly: "0042cfdd-e34d-4a12-9938-97274d150ea3",
    variantIdQuarterly: "0042cfdd-e34d-4a12-9938-97274d150ea3",
  },
  {
    name: "Pro",
    monthlyPrice: "$7.99",
    quarterlyPrice: "$18.99",
    description: "For the full toolkit",
    features: [
      { name: "Everything in Starter", included: true },
      { name: "Unlimited AI cover letters", included: true },
      { name: "Full LinkedIn optimizer", included: true },
      { name: "Advanced ATS formatting analysis", included: true },
      { name: "Priority processing", included: true },
    ],
    buttonText: "Choose Pro",
    tierKey: "pro",
    variantIdMonthly: "6d1923db-5c3b-4551-a3d6-2cb374a8891a",
    variantIdQuarterly: "6d1923db-5c3b-4551-a3d6-2cb374a8891a",
  },
];

export default function PricingPage() {
  const { user, tier: currentTier } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">("monthly");
  const router = useRouter();

  const getCheckoutUrl = (t: typeof tiers[0]) => {
    if (!user) return "/login?redirect=/pricing";
    const variantId = billingCycle === "monthly" ? t.variantIdMonthly : t.variantIdQuarterly;
    return `https://fresherats.lemonsqueezy.com/checkout/buy/${variantId}?embed=1&checkout[custom][user_id]=${user.id}`;
  };

  const buttonClasses = (t: typeof tiers[0]) =>
    `w-full rounded-full px-4 py-3 text-sm font-semibold transition-all text-center block ${currentTier === t.tierKey
      ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
      : t.name === "Starter"
        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
        : t.name === "Pro"
          ? "bg-black text-white hover:bg-gray-800"
          : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
    }`;

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-white py-20">
      {/* Load Lemon.js for checkout overlay */}
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" />

      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-8">
            Choose the plan that best fits your job search needs. Upgrade anytime to unlock advanced AI features.
          </p>

          {/* Billing cycle toggle */}
          <div className="flex justify-center items-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === "monthly" ? "quarterly" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Toggle billing cycle"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${billingCycle === "quarterly" ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "quarterly" ? "text-gray-900" : "text-gray-500"}`}>
              Quarterly <span className="text-purple-600 text-xs ml-1 font-bold">(Save 24%)</span>
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-3xl bg-white p-8 shadow-xl ring-1 ${currentTier === t.tierKey
                ? "ring-purple-600 ring-2 scale-105 transform z-10"
                : t.name === "Starter"
                  ? "ring-purple-600 ring-2 scale-105 transform z-10"
                  : "ring-gray-200"
                }`}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{t.name}</h3>
                  {(t as any).isPopular && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">{t.description}</p>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  {billingCycle === "monthly" ? t.monthlyPrice : t.quarterlyPrice}
                  {t.tierKey !== "free" && (
                    <span className="text-lg font-medium text-gray-500 ml-1">
                      /{billingCycle === "monthly" ? "mo" : "qtr"}
                    </span>
                  )}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {t.features.map((feature) => (
                  <li key={feature.name} className="flex items-start">
                    <div className="shrink-0">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-purple-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <span className={`ml-3 text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Free tier or not logged in → plain button */}
              {t.tierKey === "free" || !user ? (
                <button
                  onClick={() => {
                    if (!user) {
                      router.push("/login?redirect=/pricing");
                    }
                  }}
                  disabled={currentTier === t.tierKey}
                  className={buttonClasses(t)}
                >
                  {currentTier === t.tierKey ? "Current Plan" : t.tierKey === "free" ? t.buttonText : "Get Started"}
                </button>
              ) : (
                /* Logged-in paid tiers → Lemon Squeezy overlay anchor */
                <a
                  href={getCheckoutUrl(t)}
                  className={`lemonsqueezy-button ${buttonClasses(t)}`}
                >
                  {currentTier === t.tierKey ? "Current Plan" : t.buttonText}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
