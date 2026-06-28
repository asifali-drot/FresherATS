import crypto from "crypto";
import { PaymentProvider, CheckoutOptions, WebhookEvent } from "./provider";
import { getPlan } from "../pricing/plans";

// The Lemon Squeezy implementation
export class LemonSqueezyProvider implements PaymentProvider {
  private webhookSecret: string;
  private storeUrl: string;

  constructor() {
    this.webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";
    // E.g., fresherats.lemonsqueezy.com
    this.storeUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_URL || "fresherats.lemonsqueezy.com";
  }

  async createCheckout(options: CheckoutOptions): Promise<{ url: string }> {
    const plan = getPlan(options.planId);
    
    if (plan.billingType === "free") {
      throw new Error("Cannot create checkout for free plan");
    }

    const variantId = options.student && plan.studentProviderPriceId
      ? plan.studentProviderPriceId
      : plan.providerPriceId;

    if (!variantId) {
      throw new Error(`No provider price ID found for plan ${options.planId}`);
    }

    // Using the buy link approach with custom data for webhook tracking
    const url = new URL(`https://${this.storeUrl}/checkout/buy/${variantId}`);
    
    // Add custom metadata so the webhook knows who bought what
    url.searchParams.append("checkout[custom][user_id]", options.userId);
    url.searchParams.append("checkout[custom][plan_id]", options.planId);
    
    if (plan.billingType !== "recurring") {
      // For pass or pack, pass the grant type and duration in metadata
      url.searchParams.append("checkout[custom][grant]", plan.billingType);
      if (plan.durationDays) {
        url.searchParams.append("checkout[custom][duration_days]", plan.durationDays.toString());
      }
    }

    // Optional redirects (LemonSqueezy usually handles via dashboard, but API supports it)
    // url.searchParams.append("checkout[success_url]", options.successUrl || "");

    return { url: url.toString() };
  }

  async createBillingPortal(options: { customerId: string; returnUrl?: string }): Promise<{ url: string }> {
    // For Lemon Squeezy, the portal URL is typically returned in the subscription object.
    // If you need a generic link, you can use the Customer Portal link from your LS Dashboard.
    // We'll provide a default redirect to the LS customer portal if a specific one isn't stored.
    const portalUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PORTAL_URL || `https://${this.storeUrl}/billing`;
    return { url: portalUrl };
  }

  async ensureCustomer(options: { userId: string; email: string; existingId?: string }): Promise<string> {
    // Lemon Squeezy creates the customer upon checkout.
    // We return the existing ID or just use the userId as a placeholder until the webhook fires.
    return options.existingId || options.userId;
  }

  async verifyAndParseEvent(rawBody: string, signature: string): Promise<WebhookEvent> {
    if (!this.webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    const hmac = crypto.createHmac("sha256", this.webhookSecret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      throw new Error("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody);

    return {
      id: payload.meta.event_id || payload.meta.custom_data?.event_id || String(Date.now()),
      type: payload.meta.event_name,
      data: payload.data, // Contains attributes, relationships, custom_data in meta
    };
  }
}

export const paymentProvider = new LemonSqueezyProvider();
