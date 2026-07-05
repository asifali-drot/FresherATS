-- ============================================================
-- Add 'admin' to the tier CHECK constraint
-- ============================================================
ALTER TABLE public.user_subscriptions 
  DROP CONSTRAINT IF EXISTS user_subscriptions_tier_check;

ALTER TABLE public.user_subscriptions 
  ADD CONSTRAINT user_subscriptions_tier_check 
  CHECK (tier IN ('free', 'starter', 'pro', 'admin'));
