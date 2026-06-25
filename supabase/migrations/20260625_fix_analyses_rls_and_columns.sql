-- ============================================================
-- Fix: Add missing RLS policies for analyses table UPDATE/SELECT
-- Without these, resume saves silently fail on the server side
-- ============================================================

-- Enable RLS on analyses if not already enabled
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure idempotent execution
DROP POLICY IF EXISTS "Users can select own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Guests can select and create analyses" ON public.analyses;

-- Allow users to SELECT their own analyses
CREATE POLICY "Users can select own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to UPDATE their own analyses (THIS IS THE CRITICAL ONE FOR SAVING)
CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to INSERT their own analyses
CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- ============================================================
-- Ensure resume_document column exists and is properly typed
-- ============================================================
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS resume_document jsonb;

-- Create GIN index for better query performance on resume_document
CREATE INDEX IF NOT EXISTS idx_analyses_resume_document 
  ON public.analyses USING gin (resume_document);

-- ============================================================
-- Fix: Initialize resume_document for any rows that are missing it
-- This converts optimized_resume text to a basic resume_document structure
-- (only for rows that have optimized_resume but no resume_document)
-- ============================================================
UPDATE public.analyses
SET resume_document = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content', 
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', COALESCE(optimized_resume, '')))
    )
  )
)
WHERE resume_document IS NULL 
  AND optimized_resume IS NOT NULL
  AND LENGTH(TRIM(optimized_resume)) > 0;

-- ============================================================
-- Verify: Check how many analyses rows were updated
-- ============================================================
-- Run this SELECT to see the results:
-- SELECT COUNT(*) as total_rows, 
--        COUNT(CASE WHEN resume_document IS NOT NULL THEN 1 END) as rows_with_document,
--        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as rows_owned_by_users
-- FROM public.analyses;
