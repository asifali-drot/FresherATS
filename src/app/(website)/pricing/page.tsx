"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";

const tiers = [
  {
    name: "Free Tier",
    price: "$0",
    description: "Perfect for getting started with your job search.",
    features: [
      { name: "Basic Resume Analysis", included: true },
      { name: "2 PDF Downloads / month", included: true },
      { name: "2 LinkedIn Checks / month", included: true },
      { name: "Access to all Resume Templates", included: true },
      { name: "Job Description Matching", included: false },
      { name: "AI Cover Letter Generator", included: false },
      { name: "Full LinkedIn Optimizer", included: false },
    ],
    buttonText: "Current Plan",
    tierKey: "free",
  },
  {
    name: "Tier 2",
    price: "$9.99/mo",
    description: "Boost your application with AI tailoring.",
    features: [
      { name: "Advanced Resume Analysis", included: true },
      { name: "Unlimited PDF Downloads", included: true },
      { name: "Unlimited LinkedIn Checks", included: true },
      { name: "Access to all Resume Templates", included: true },
      { name: "Job Description Matching", included: true },
      { name: "AI Cover Letter Generator (5/month)", included: true },
      { name: "Full LinkedIn Optimizer", included: false },
    ],
    buttonText: "Upgrade to Tier 2",
    tierKey: "tier_2",
  },
  {
    name: "Tier 3",
    price: "$19.99/mo",
    description: "The ultimate job seeker toolkit.",
    features: [
      { name: "Advanced Resume Analysis", included: true },
      { name: "Unlimited PDF Downloads", included: true },
      { name: "Unlimited LinkedIn Checks", included: true },
      { name: "Access to all Resume Templates", included: true },
      { name: "Job Description Matching", included: true },
      { name: "Unlimited AI Cover Letters", included: true },
      { name: "Full LinkedIn Optimizer", included: true },
    ],
    buttonText: "Upgrade to Tier 3",
    tierKey: "tier_3",
  },
];

export default function PricingPage() {
  const { tier: currentTier } = useSubscription();

  const handleUpgrade = (targetTier: string) => {
    alert(`This is a mock upgrade. In the future, this will open a Stripe checkout for ${targetTier}.`);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose the plan that best fits your job search needs. Upgrade anytime to unlock advanced AI features.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-3xl bg-white p-8 shadow-xl ring-1 ${currentTier === t.tierKey || t.name === "Tier 2"
                ? "ring-purple-600 ring-2 scale-105 transform z-10"
                : "ring-gray-200"
                }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{t.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{t.description}</p>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  {t.price}
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
                    <span
                      className={`ml-3 text-sm ${feature.included ? "text-gray-700" : "text-gray-400"
                        }`}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(t.tierKey)}
                disabled={currentTier === t.tierKey}
                className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-all ${currentTier === t.tierKey
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : t.name === "Tier 2"
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
                    : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                {currentTier === t.tierKey ? "Current Plan" : t.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
