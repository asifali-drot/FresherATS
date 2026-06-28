export type BillingType = "free" | "recurring" | "pass" | "pack";
export type PlanId = "free" | "single_monthly" | "pro_monthly" | "pro_quarterly" | "single_resume_pack";

export interface Plan {
  id: PlanId;
  name: string;
  billingType: BillingType;
  priceLabel: string;
  amountCents: number;
  providerPriceId?: string;
  studentProviderPriceId?: string;
  durationDays?: number;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    billingType: "free",
    priceLabel: "$0",
    amountCents: 0,
    features: [
      "Basic ATS analysis",
      "Editable cover letter templates",
      "Unlimited LinkedIn checks",
      "Job tracker — up to 5 jobs",
      "2 PDF downloads / mo",
    ],
  },
  single_monthly: {
    id: "single_monthly",
    name: "Single Monthly",
    billingType: "pass",
    priceLabel: "$3.99 once",
    amountCents: 399,
    durationDays: 30,
    providerPriceId: process.env.LEMONSQUEEZY_SINGLE_MONTHLY_VARIANT_ID || "1828941",
    features: [
      "1 AI optimized resume",
      "1 AI generated cover letter",
      "1 linkedin profile optimized",
      "Valid for 1 month"
    ]
  },
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro Monthly",
    billingType: "pass",
    priceLabel: "$14.99 once",
    amountCents: 1499,
    durationDays: 30,
    providerPriceId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || "1829055",
    features: [
      "Everything in Free",
      "Unlimited AI cover letters",
      "Full LinkedIn optimizer",
      "Advanced ATS formatting analysis",
      "Priority processing",
    ],
    highlighted: true,
  },
  pro_quarterly: {
    id: "pro_quarterly",
    name: "Pro Quarterly",
    billingType: "pass",
    priceLabel: "$29.99 once",
    amountCents: 2999,
    durationDays: 90,
    providerPriceId: process.env.LEMONSQUEEZY_PRO_QUARTERLY_VARIANT_ID || "1829062",
    features: [
      "Pro access for 3 full months",
      "No auto-renew, no surprise charges",
      "Save 33% vs monthly",
      "Full LinkedIn optimizer",
      "Advanced ATS formatting analysis",
    ],
  },
  single_resume_pack: {
    id: "single_resume_pack",
    name: "Single Resume Pack",
    billingType: "pack",
    priceLabel: "$4.99 once",
    amountCents: 499,
    providerPriceId: process.env.LEMONSQUEEZY_RESUME_PACK_VARIANT_ID || "1169210",
    features: [
      "1 AI optimized resume",
      "1 AI generated cover letter",
      "1 linkedin profile optimized"
    ],
  },
};

export function getPlan(id: PlanId): Plan {
  const plan = PLANS[id];
  if (!plan) throw new Error(`Plan not found: ${id}`);
  return plan;
}

// Client-safe export (strips out secret provider IDs)
export type ClientPlan = Omit<Plan, "providerPriceId" | "studentProviderPriceId">;

export const PLAN_INDEX: ClientPlan[] = Object.values(PLANS).map((plan) => {
  const { providerPriceId, studentProviderPriceId, ...safePlan } = plan;
  return safePlan;
});

