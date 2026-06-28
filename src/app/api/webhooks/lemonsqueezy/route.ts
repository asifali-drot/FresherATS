import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentProvider } from "@/lib/payments/lemonsqueezy";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    // Verify signature and parse using the provider seam
    const event = await paymentProvider.verifyAndParseEvent(rawBody, signature);
    const supabase = createAdminClient();

    // Idempotency check
    const { data: existingEvent } = await supabase
      .from("processed_webhook_events")
      .select("event_id")
      .eq("event_id", event.id)
      .single();

    if (existingEvent) {
      console.log(`Webhook event ${event.id} already processed.`);
      return NextResponse.json({ received: true, message: "Already processed" });
    }

    const eventName = event.type;
    const attributes = event.data?.attributes || {};
    const customData = event.data?.meta?.custom_data || {};
    const userId = customData.user_id;

    if (!userId) {
      console.warn("No user_id found in custom_data. Cannot process event.", eventName);
      // Still return 200 so the provider doesn't retry
      return NextResponse.json({ received: true, warning: "No user_id" });
    }

    console.log(`Processing ${eventName} for user ${userId}`);

    // Begin processing based on event name
    if (eventName === "order_created") {
      // Handles one-time payments (pass, pack)
      let grant = customData.grant;
      let durationDays = parseInt(customData.duration_days || "90", 10);
      
      const variantId = String(
        attributes.first_order_item?.variant_id || 
        attributes.variant_id || 
        event.data.relationships?.order_items?.data?.[0]?.variant_id || 
        ""
      );

      // Fallback mappings if customData is missing
      if (!grant && variantId) {
        if (variantId === "1829055") {
          grant = "pass";
          durationDays = 30;
        } else if (variantId === "1829062") {
          grant = "pass";
          durationDays = 90;
        } else if (variantId === "1828941") {
          grant = "pass";
          durationDays = 30;
        } else if (variantId === "1169210") {
          grant = "pack";
        }
      }
      
      if (grant === "pass") {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        const { error } = await supabase.from("pass_grants").insert({
          user_id: userId,
          source: `lemonsqueezy_${event.data.id || variantId}`,
          access_expires_at: expiresAt.toISOString(),
        });

        if (error) throw new Error(`Pass grant error: ${error.message}`);
      } else if (grant === "pack") {
        // Since we don't have atomic increment in simple RPC without creating a function, 
        // we just insert a new purchase record per pack, and entitlements will sum them up.
        const { error } = await supabase.from("purchases").insert({
          user_id: userId,
          kind: "single_resume_pack",
          credits_remaining: 1, // 1 pack = 1 credit in this model
        });

        if (error) throw new Error(`Purchase pack error: ${error.message}`);
      }
    } else if (
      eventName === "subscription_created" ||
      eventName === "subscription_updated" ||
      eventName === "subscription_resumed" ||
      eventName === "subscription_cancelled" ||
      eventName === "subscription_expired"
    ) {
      // Handles recurring subscriptions
      const status = attributes.status || "active";
      const variantId = String(attributes.variant_id);
      const subscriptionId = String(event.data.id);
      const endsAt = attributes.renews_at || attributes.ends_at; // LemonSqueezy dates
      const cancelAtPeriodEnd = attributes.ends_at !== null && status !== "expired";
      
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          provider_subscription_id: subscriptionId,
          status: status,
          price_id: variantId,
          current_period_end: endsAt || new Date().toISOString(),
          cancel_at_period_end: cancelAtPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_subscription_id" }
      );

      if (error) throw new Error(`Subscription upsert error: ${error.message}`);
    }

    // Record idempotency
    const { error: idempotencyError } = await supabase
      .from("processed_webhook_events")
      .insert({ event_id: event.id });

    if (idempotencyError) {
      console.error("Failed to record idempotency:", idempotencyError.message);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    // Return 500 for critical errors so Lemon Squeezy retries, 
    // or 400 for bad signatures
    const status = error.message.includes("signature") ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
