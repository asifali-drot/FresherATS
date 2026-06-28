import { PlanId } from "../pricing/plans";

export interface CheckoutOptions {
  userId: string;
  planId: PlanId;
  student?: boolean;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any; // Provider-specific data payload
}

export interface PaymentProvider {
  createCheckout(options: CheckoutOptions): Promise<{ url: string }>;
  createBillingPortal(options: { customerId: string; returnUrl?: string }): Promise<{ url: string }>;
  ensureCustomer(options: { userId: string; email: string; existingId?: string }): Promise<string>;
  verifyAndParseEvent(rawBody: string, signature: string): Promise<WebhookEvent>;
}
