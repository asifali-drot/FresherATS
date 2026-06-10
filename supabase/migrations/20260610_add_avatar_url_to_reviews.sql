-- Migration: Add avatar_url column to reviews table
-- This stores the public URL of the user's profile picture from the avatars bucket
-- so it can be displayed on the review card without needing a join to auth.users.

-- 1. Add the column (idempotent)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 2. Backfill existing rows from auth.users metadata
--    (only fills rows where avatar_url is still NULL and the user has one in metadata)
UPDATE public.reviews r
SET    avatar_url = (
         SELECT u.raw_user_meta_data->>'avatar_url'
         FROM   auth.users u
         WHERE  u.id = r.user_id
       )
WHERE  r.avatar_url IS NULL;

-- Done. New reviews inserted/upserted via the API will include avatar_url automatically.
