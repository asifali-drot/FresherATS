-- Drop existing job_applications table if it exists to clean up schema conflicts
DROP TABLE IF EXISTS public.job_reminders CASCADE;
DROP TABLE IF EXISTS public.job_contacts CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  jd_text TEXT,
  salary TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'online_test', 'interview', 'offer', 'rejected')),
  excitement_rating INT DEFAULT 3 CHECK (excitement_rating >= 1 AND excitement_rating <= 5),
  match_score INT,
  matched_keywords TEXT[],
  missing_keywords TEXT[],
  applied_date DATE,
  notes TEXT
);

-- Create job_contacts table
CREATE TABLE public.job_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  linkedin_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_reminders table
CREATE TABLE public.job_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'followup' CHECK (type IN ('followup', 'interview', 'deadline')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_reminders ENABLE ROW LEVEL SECURITY;

-- Job Applications Policies
CREATE POLICY "Users can insert their own job applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own job applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own job applications" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job applications" ON public.job_applications FOR DELETE USING (auth.uid() = user_id);

-- Job Contacts Policies
CREATE POLICY "Users can select contacts of their jobs" ON public.job_contacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert contacts of their jobs" ON public.job_contacts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update contacts of their jobs" ON public.job_contacts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete contacts of their jobs" ON public.job_contacts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);

-- Job Reminders Policies
CREATE POLICY "Users can select reminders of their jobs" ON public.job_reminders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert reminders of their jobs" ON public.job_reminders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update reminders of their jobs" ON public.job_reminders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete reminders of their jobs" ON public.job_reminders FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.job_applications WHERE id = job_id AND user_id = auth.uid())
);
