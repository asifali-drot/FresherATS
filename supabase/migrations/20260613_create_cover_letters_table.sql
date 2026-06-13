-- Migration: Create cover_letters table to store generated/downloaded cover letters
-- This supports fetching previous cover letters in the dashboard with full editing capabilities.

-- 1. Create table (idempotent)
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter_text TEXT NOT NULL,
  job_title TEXT,
  job_description TEXT,
  company_name TEXT,
  template_id TEXT DEFAULT 'professional',
  avatar_url TEXT,
  file_path TEXT NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies (drop first to ensure idempotent execution)
DROP POLICY IF EXISTS "Users can insert their own cover letters" ON public.cover_letters;
CREATE POLICY "Users can insert their own cover letters" 
ON public.cover_letters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select their own cover letters" ON public.cover_letters;
CREATE POLICY "Users can select their own cover letters" 
ON public.cover_letters 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cover letters" ON public.cover_letters;
CREATE POLICY "Users can update their own cover letters" 
ON public.cover_letters 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cover letters" ON public.cover_letters;
CREATE POLICY "Users can delete their own cover letters" 
ON public.cover_letters 
FOR DELETE 
USING (auth.uid() = user_id);
