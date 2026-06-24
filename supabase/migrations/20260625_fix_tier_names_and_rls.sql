-- ============================================================
-- Fix 1: Update tier CHECK constraint to use proper plan names
-- Old: ('free', 'tier_2', 'tier_3')
-- New: ('free', 'starter', 'pro')
-- ============================================================
ALTER TABLE public.user_subscriptions 
  DROP CONSTRAINT IF EXISTS user_subscriptions_tier_check;

ALTER TABLE public.user_subscriptions 
  ADD CONSTRAINT user_subscriptions_tier_check 
  CHECK (tier IN ('free', 'starter', 'pro'));

-- Update any existing wrong tier values
UPDATE public.user_subscriptions SET tier = 'starter' WHERE tier = 'tier_2';
UPDATE public.user_subscriptions SET tier = 'pro'     WHERE tier = 'tier_3';

-- ============================================================
-- Fix 2: Add RLS write policies on usage_tracking
-- Without these, upserts from the server silently fail
-- ============================================================

-- Allow users to insert their own usage row (in case trigger didn't run)
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_tracking;

CREATE POLICY "Users can insert own usage"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own usage
CREATE POLICY "Users can update own usage"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Fix 3: Ensure every existing auth user has a usage_tracking row
-- (handles users who signed up before the trigger was added)
-- ============================================================
INSERT INTO public.usage_tracking (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.usage_tracking)
ON CONFLICT (user_id) DO NOTHING;

-- Ensure every existing auth user has a subscription row
INSERT INTO public.user_subscriptions (user_id, tier)
SELECT id, 'free' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;
