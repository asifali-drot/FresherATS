-- Store TipTap ProseMirror JSON for resume editing in Resume Studio
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS resume_document jsonb;

COMMENT ON COLUMN analyses.resume_document IS 'TipTap/ProseMirror JSON document for Resume Studio editor';

CREATE INDEX IF NOT EXISTS idx_analyses_resume_document ON analyses USING gin (resume_document);
