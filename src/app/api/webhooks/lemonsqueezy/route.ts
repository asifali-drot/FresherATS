import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || 'ywroceaiedji21223';

const STARTER_VARIANTS = ["1828941", "1828978", "0042cfdd-e34d-4a12-9938-97274d150ea3"];
const PRO_VARIANTS = ["1829055", "1829062", "6d1923db-5c3b-4551-a3d6-2cb374a8891a"];

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;
    
    // LemonSqueezy's `variant_id` might be inside `payload.data.attributes.variant_id`
    // or we might look at `first_subscription_item.variant_id` depending on the event.
    // For subscription events, it's typically under `payload.data.attributes.variant_id`
    const attributes = payload.data.attributes;
    
    if (!customData || !customData.user_id) {
      // If we don't have a user ID, we can't update our database
      return NextResponse.json({ error: 'No user ID in custom data' }, { status: 400 });
    }

    const userId = customData.user_id;
    const supabase = createAdminClient();

    if (
      eventName === 'subscription_created' ||
      eventName === 'subscription_updated' ||
      eventName === 'subscription_resumed'
    ) {
      const variantIdStr = String(attributes.variant_id);
      let tier = 'free';

      if (STARTER_VARIANTS.includes(variantIdStr)) {
        tier = 'starter';
      } else if (PRO_VARIANTS.includes(variantIdStr)) {
        tier = 'pro';
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({ user_id: userId, tier: tier, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    } else if (
      eventName === 'subscription_cancelled' ||
      eventName === 'subscription_expired'
    ) {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({ user_id: userId, tier: 'free', updated_at: new Date().toISOString() });

      if (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
