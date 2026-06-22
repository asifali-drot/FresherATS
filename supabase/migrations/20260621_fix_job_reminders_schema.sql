-- Add notification_email column to job_reminders (stores the recipient email for this specific reminder)
ALTER TABLE public.job_reminders
  ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- Extend the status check constraint to allow 'notified' (email was sent by cron or send-now)
-- Drop old constraint first, then re-create with the new allowed values
ALTER TABLE public.job_reminders
  DROP CONSTRAINT IF EXISTS job_reminders_status_check;

ALTER TABLE public.job_reminders
  ADD CONSTRAINT job_reminders_status_check
  CHECK (status IN ('pending', 'done', 'notified'));
