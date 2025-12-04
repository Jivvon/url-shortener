-- Add Polar subscription fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_polar_subscription_id ON profiles(polar_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_polar_customer_id ON profiles(polar_customer_id);
