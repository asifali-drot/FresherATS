CREATE TABLE IF NOT EXISTS pack_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id text NOT NULL,
  overall int,
  hard_score int,
  values_score int,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE pack_scans ENABLE ROW LEVEL SECURITY;

-- Owner can do all operations
CREATE POLICY "Users can manage their own pack scans"
ON pack_scans
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add index on user_id and created_at for fast lookups
CREATE INDEX IF NOT EXISTS idx_pack_scans_user_created ON pack_scans(user_id, created_at DESC);
