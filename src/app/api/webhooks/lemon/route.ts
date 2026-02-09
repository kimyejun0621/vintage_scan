import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Verify Lemon Squeezy webhook signature
 * This ensures the webhook actually came from Lemon Squeezy
 */
function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMON_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Missing LEMON_WEBHOOK_SECRET environment variable');
    return false;
  }

  // Compute HMAC SHA256 hash
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');

  // Compare signatures (timing-safe comparison)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

/**
 * Extract user ID from custom data
 */
function extractUserId(customData: any): string | null {
  try {
    // Lemon Squeezy sends custom data in meta.custom_data
    if (customData?.user_id) {
      return customData.user_id;
    }
    return null;
  } catch (err) {
    console.error('Failed to extract user ID:', err);
    return null;
  }
}

/**
 * Handle order_created event (One-time purchases)
 */
async function handleOrderCreated(data: any) {
  const userId = extractUserId(data.meta?.custom_data);
  const variantId = data.attributes?.first_order_item?.variant_id?.toString();
  const creditsVariantId = process.env.LEMON_VARIANT_ID_CREDITS;

  console.log('[Webhook] Order Created:', {
    userId,
    variantId,
    orderId: data.id,
  });

  if (!userId) {
    console.error('[Webhook] No user_id found in custom data');
    return { error: 'Missing user_id' };
  }

  // Check if this is the Credits Pack
  if (variantId === creditsVariantId) {
    console.log('[Webhook] Credits pack purchased, adding 10 credits');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Webhook] Failed to fetch profile:', error);
      return { error: 'Failed to fetch profile' };
    }

    const currentCredits = profile?.credits || 0;
    const newCredits = currentCredits + 10;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        credits: newCredits,
        customer_id: data.attributes?.customer_id?.toString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[Webhook] Failed to update credits:', updateError);
      return { error: 'Failed to update credits' };
    }

    console.log('[Webhook] Credits updated:', { userId, newCredits });
    return { success: true, message: 'Credits added' };
  }

  return { success: true, message: 'Order processed (not credits)' };
}

/**
 * Handle subscription_created event
 */
async function handleSubscriptionCreated(data: any) {
  const userId = extractUserId(data.meta?.custom_data);
  const variantId = data.attributes?.variant_id?.toString();
  const hunterVariantId = process.env.LEMON_VARIANT_ID_HUNTER;

  console.log('[Webhook] Subscription Created:', {
    userId,
    variantId,
    subscriptionId: data.id,
  });

  if (!userId) {
    console.error('[Webhook] No user_id found in custom data');
    return { error: 'Missing user_id' };
  }

  // Check if this is the Hunter Plan
  if (variantId === hunterVariantId) {
    console.log('[Webhook] Hunter subscription activated');

    const { error } = await supabase
      .from('profiles')
      .update({
        is_hunter: true,
        subscription_id: data.id.toString(),
        customer_id: data.attributes?.customer_id?.toString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[Webhook] Failed to activate subscription:', error);
      return { error: 'Failed to activate subscription' };
    }

    console.log('[Webhook] Hunter subscription activated:', { userId });
    return { success: true, message: 'Subscription activated' };
  }

  return { success: true, message: 'Subscription processed (not hunter)' };
}

/**
 * Handle subscription_cancelled event
 */
async function handleSubscriptionCancelled(data: any) {
  const subscriptionId = data.id.toString();

  console.log('[Webhook] Subscription Cancelled:', { subscriptionId });

  // Find user by subscription_id and deactivate
  const { error } = await supabase
    .from('profiles')
    .update({
      is_hunter: false,
      subscription_id: null,
    })
    .eq('subscription_id', subscriptionId);

  if (error) {
    console.error('[Webhook] Failed to cancel subscription:', error);
    return { error: 'Failed to cancel subscription' };
  }

  console.log('[Webhook] Subscription cancelled:', { subscriptionId });
  return { success: true, message: 'Subscription cancelled' };
}

/**
 * Handle subscription_updated event
 * (e.g., when subscription renews)
 */
async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id.toString();
  const status = data.attributes?.status;

  console.log('[Webhook] Subscription Updated:', { subscriptionId, status });

  // If subscription is not active, deactivate Hunter status
  if (status !== 'active') {
    const { error } = await supabase
      .from('profiles')
      .update({ is_hunter: false })
      .eq('subscription_id', subscriptionId);

    if (error) {
      console.error('[Webhook] Failed to update subscription:', error);
      return { error: 'Failed to update subscription' };
    }
  }

  return { success: true, message: 'Subscription updated' };
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';

    // Verify signature
    if (!verifySignature(rawBody, signature)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const data = payload.data;

    console.log('[Webhook] Received event:', eventName);

    // Route to appropriate handler
    let result;
    switch (eventName) {
      case 'order_created':
        result = await handleOrderCreated(data);
        break;

      case 'subscription_created':
        result = await handleSubscriptionCreated(data);
        break;

      case 'subscription_cancelled':
        result = await handleSubscriptionCancelled(data);
        break;

      case 'subscription_updated':
        result = await handleSubscriptionUpdated(data);
        break;

      default:
        console.log('[Webhook] Unhandled event:', eventName);
        return NextResponse.json({
          message: 'Event received but not processed',
        });
    }

    // Return response
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
