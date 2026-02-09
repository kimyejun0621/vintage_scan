-- Add payment-related columns to profiles table
-- This migration adds columns needed for Lemon Squeezy payment integration

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_hunter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_customer_id ON profiles(customer_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.credits IS 'Number of scan credits available (default: 3 free)';
COMMENT ON COLUMN profiles.is_hunter IS 'Whether user has active Hunter subscription';
COMMENT ON COLUMN profiles.subscription_id IS 'Lemon Squeezy subscription ID';
COMMENT ON COLUMN profiles.customer_id IS 'Lemon Squeezy customer ID';
