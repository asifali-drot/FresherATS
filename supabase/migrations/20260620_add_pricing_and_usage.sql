-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'tier_2', 'tier_3')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own subscription
CREATE POLICY "Users can view own subscription" 
    ON public.user_subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    billing_cycle_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    pdf_downloads INT NOT NULL DEFAULT 0,
    linkedin_checks INT NOT NULL DEFAULT 0,
    cover_letters INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own usage
CREATE POLICY "Users can view own usage" 
    ON public.usage_tracking FOR SELECT 
    USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_pricing() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (new.id, 'free');
  
  INSERT INTO public.usage_tracking (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create subscription and usage records on signup
CREATE TRIGGER on_auth_user_created_pricing
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_pricing();
