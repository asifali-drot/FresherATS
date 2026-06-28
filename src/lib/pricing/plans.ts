export type BillingType = "free" | "recurring" | "pass" | "pack";
export type PlanId = "free" | "pro_monthly" | "job_search_pass" | "single_resume_pack";

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
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro",
    billingType: "recurring",
    priceLabel: "$14.99/mo",
    amountCents: 1499,
    // Note: We use process.env to avoid leaking these into the client bundle
    // if this file is imported from client components. But we must be careful
    // since process.env might be undefined on client. Thus, only use server-side.
    providerPriceId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
    studentProviderPriceId: process.env.LEMONSQUEEZY_PRO_MONTHLY_STUDENT_VARIANT_ID,
    features: [
      "Everything in Free",
      "Unlimited AI cover letters",
      "Full LinkedIn optimizer",
      "Advanced ATS formatting analysis",
      "Priority processing",
    ],
    highlighted: true,
  },
  job_search_pass: {
    id: "job_search_pass",
    name: "Job Search Pass",
    billingType: "pass",
    priceLabel: "$29.99 once",
    amountCents: 2999,
    durationDays: 90,
    providerPriceId: process.env.LEMONSQUEEZY_JOB_PASS_VARIANT_ID,
    studentProviderPriceId: process.env.LEMONSQUEEZY_JOB_PASS_STUDENT_VARIANT_ID,
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
    providerPriceId: process.env.LEMONSQUEEZY_RESUME_PACK_VARIANT_ID,
    features: ["1 Optimized Resume", "1 AI Cover Letter", "One-time use"],
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
