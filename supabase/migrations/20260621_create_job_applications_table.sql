-- Create job_applications table to store job tracking details
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'applied', 'interviewing', 'offer', 'rejected')),
  salary TEXT,
  location TEXT,
  notes TEXT,
  applied_date DATE,
  interview_date TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can insert their own job applications" ON public.job_applications;
CREATE POLICY "Users can insert their own job applications" 
ON public.job_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select their own job applications" ON public.job_applications;
CREATE POLICY "Users can select their own job applications" 
ON public.job_applications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own job applications" ON public.job_applications;
CREATE POLICY "Users can update their own job applications" 
ON public.job_applications FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own job applications" ON public.job_applications;
CREATE POLICY "Users can delete their own job applications" 
ON public.job_applications FOR DELETE 
USING (auth.uid() = user_id);
