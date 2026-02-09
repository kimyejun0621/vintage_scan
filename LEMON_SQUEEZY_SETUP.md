# Lemon Squeezy Payment Integration Guide

This document explains how to set up and use the Lemon Squeezy payment integration for Vintage Sniper.

---

## 📋 Overview

We've integrated Lemon Squeezy to sell:
1. **10 Credits Pack** - One-time payment ($3)
2. **Hunter Plan** - Monthly subscription ($12)

When a payment is completed, our webhook automatically updates the Supabase `profiles` table.

---

## 🚀 Quick Start

### Step 1: Run SQL Migration

Execute the SQL migration to add payment columns to your `profiles` table:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Dashboard SQL Editor
```

The migration file is located at: `supabase/migrations/add_payment_columns.sql`

This adds:
- `credits` (integer, default: 3)
- `is_hunter` (boolean, default: false)
- `subscription_id` (text, nullable)
- `customer_id` (text, nullable)

---

### Step 2: Set Up Lemon Squeezy Products

1. Go to https://app.lemonsqueezy.com/products
2. Create two products:
   - **"10 Credits Pack"** - One-time payment, $3
   - **"Hunter Plan"** - Subscription, $12/month

3. For each product, copy:
   - Checkout URL (e.g., `https://your-store.lemonsqueezy.com/checkout/buy/PRODUCT_ID`)
   - Variant ID (found in Product > Variants)

---

### Step 3: Configure Environment Variables

Update your `.env.local` file with the following:

```bash
# Lemon Squeezy Configuration

# Checkout Links (from Products page)
NEXT_PUBLIC_LEMON_LINK_CREDITS=https://vintage-sniper.lemonsqueezy.com/checkout/buy/PRODUCT_ID_CREDITS
NEXT_PUBLIC_LEMON_LINK_HUNTER=https://vintage-sniper.lemonsqueezy.com/checkout/buy/PRODUCT_ID_HUNTER

# Webhook Secret (from Settings > Webhooks)
LEMON_WEBHOOK_SECRET=your_webhook_secret_here

# Variant IDs (from Product variants)
LEMON_VARIANT_ID_CREDITS=123456
LEMON_VARIANT_ID_HUNTER=789012

# Supabase Service Role Key (for webhook to update DB)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**How to get these values:**
- **Checkout URLs**: Products page > Click product > Copy "Checkout URL"
- **Variant IDs**: Products page > Click product > Variants tab > Copy ID
- **Webhook Secret**: Settings > Webhooks > Create webhook > Copy signing secret
- **Service Role Key**: Supabase Dashboard > Settings > API > Copy "service_role" key

---

### Step 4: Set Up Webhook in Lemon Squeezy

1. Go to: https://app.lemonsqueezy.com/settings/webhooks
2. Click "Create webhook"
3. Set URL to: `https://your-domain.com/api/webhooks/lemon`
4. Select events:
   - `order_created`
   - `subscription_created`
   - `subscription_cancelled`
   - `subscription_updated`
5. Copy the signing secret and add it to `.env.local` as `LEMON_WEBHOOK_SECRET`

---

## 🔄 How It Works

### Payment Flow

```
User clicks "Buy" → Redirects to Lemon Squeezy Checkout
                     (with user_id in URL)
                     ↓
                  User pays
                     ↓
            Lemon sends webhook to
            /api/webhooks/lemon
                     ↓
            Webhook verifies signature
                     ↓
            Updates Supabase profiles:
            - Credits: +10
            - Hunter: true/false
```

### User ID in Checkout URL

**CRITICAL**: We append the user ID to the checkout URL:

```typescript
const checkoutUrl = `${baseUrl}?checkout[custom][user_id]=${user.id}`;
```

This allows the webhook to know which user made the purchase.

---

## 🎯 Key Features

### 1. Pricing Page (`/pricing`)
- Shows 3 tiers: Starter (free), Sniper (10 credits), Hunter (subscription)
- Checks if user is authenticated
- Redirects to Lemon Squeezy with user ID in URL

### 2. Webhook Handler (`/api/webhooks/lemon`)
- Verifies webhook signature (security)
- Handles events:
  - `order_created`: Adds 10 credits
  - `subscription_created`: Activates Hunter status
  - `subscription_cancelled`: Deactivates Hunter status
  - `subscription_updated`: Updates status based on subscription state

### 3. Database Updates
- Automatic credit addition (+10 credits)
- Automatic Hunter status toggle (true/false)
- Stores customer_id and subscription_id for future reference

---

## 🧪 Testing

### Test Webhook Locally

1. Use ngrok to expose local server:
```bash
ngrok http 3000
```

2. Update webhook URL in Lemon Squeezy to ngrok URL:
```
https://abc123.ngrok.io/api/webhooks/lemon
```

3. Make a test purchase in Lemon Squeezy test mode

4. Check logs in terminal:
```
[Webhook] Received event: order_created
[Webhook] Credits pack purchased, adding 10 credits
[Webhook] Credits updated: { userId: '...', newCredits: 13 }
```

### Test Environment Variables

Run this to verify your environment variables are set:

```bash
npm run dev
# Visit /pricing and check browser console for any errors
```

---

## 🔐 Security

### Signature Verification

The webhook handler verifies that requests actually come from Lemon Squeezy using HMAC SHA256:

```typescript
function verifySignature(rawBody: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

This prevents unauthorized requests from updating your database.

---

## 📊 Database Schema

After running the migration, your `profiles` table will have:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,

  -- Payment columns (NEW)
  credits INTEGER DEFAULT 3,
  is_hunter BOOLEAN DEFAULT false,
  subscription_id TEXT,
  customer_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### Issue: Webhook returns 401 Invalid Signature
- **Solution**: Make sure `LEMON_WEBHOOK_SECRET` in `.env.local` matches the signing secret from Lemon Squeezy webhook settings

### Issue: Credits not added after purchase
- **Solution**: Check webhook logs in Lemon Squeezy dashboard and verify:
  1. Webhook is firing
  2. `user_id` is present in custom data
  3. `LEMON_VARIANT_ID_CREDITS` matches your product variant ID

### Issue: "Payment configuration error"
- **Solution**: Verify that `NEXT_PUBLIC_LEMON_LINK_CREDITS` and `NEXT_PUBLIC_LEMON_LINK_HUNTER` are set in `.env.local`

### Issue: Database not updating
- **Solution**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)

---

## 📝 Checklist

Before deploying to production:

- [ ] SQL migration run successfully
- [ ] Products created in Lemon Squeezy
- [ ] All environment variables set in `.env.local`
- [ ] Webhook created and pointing to production URL
- [ ] Webhook signature verified (test with real purchase)
- [ ] Test purchase completed successfully
- [ ] Credits added to test user account
- [ ] Subscription activated for test user

---

## 🎉 You're Done!

Your Lemon Squeezy integration is now complete. Users can purchase credits and subscribe to the Hunter plan, and your database will automatically update.

For support, check:
- Lemon Squeezy Docs: https://docs.lemonsqueezy.com
- Webhook Logs: Lemon Squeezy Dashboard > Settings > Webhooks > View logs
