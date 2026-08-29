CREATE TABLE public.instructor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  social TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  skill TEXT NOT NULL,
  availability TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.instructor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an instructor application"
  ON public.instructor_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);