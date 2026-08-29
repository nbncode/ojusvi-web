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
GRANT INSERT ON public.instructor_applications TO anon, authenticated;
GRANT ALL ON public.instructor_applications TO service_role;
ALTER TABLE public.instructor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a valid instructor application"
  ON public.instructor_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(social) BETWEEN 1 AND 200
    AND char_length(whatsapp) BETWEEN 5 AND 20
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(skill) BETWEEN 1 AND 100
    AND char_length(availability) BETWEEN 1 AND 50
  );

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.sync_instructor_application_to_sheet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  hook_url text := 'https://project--4a323bae-13ab-44a7-90f5-de5c9fdceb2e.lovable.app/api/public/hooks/sync-instructor-application';
  hook_secret text := '12345';
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'secret', hook_secret,
    'record', jsonb_build_object(
      'id', NEW.id::text,
      'name', NEW.name,
      'social', NEW.social,
      'whatsapp', NEW.whatsapp,
      'email', NEW.email,
      'skill', NEW.skill,
      'availability', NEW.availability,
      'created_at', to_char(NEW.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );
  PERFORM net.http_post(
    url := hook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_instructor_application_to_sheet
AFTER INSERT ON public.instructor_applications
FOR EACH ROW
EXECUTE FUNCTION public.sync_instructor_application_to_sheet();

REVOKE ALL ON FUNCTION public.sync_instructor_application_to_sheet() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_instructor_application_to_sheet() FROM anon, authenticated;

CREATE TYPE public.payment_intent_type AS ENUM ('self', 'parent', 'family', 'self_magic');
CREATE TYPE public.payment_intent_status AS ENUM ('created', 'paid', 'expired');
CREATE TYPE public.entitlement_source AS ENUM ('self', 'family');
CREATE TYPE public.entitlement_status AS ENUM ('active', 'expired');

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  account_type TEXT CHECK (account_type IN ('self', 'parent')),
  payer_name TEXT,
  member_name TEXT,
  member_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans" ON public.plans FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.plans (id, name, amount_paise, duration_days, is_default)
VALUES ('annual', 'Ojusvi Annual', 298800, 365, true),
       ('monthly', 'Ojusvi Monthly', 34900, 30, false);

CREATE TABLE public.payment_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE,
  intent_type public.payment_intent_type NOT NULL,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  beneficiary_phone TEXT NOT NULL,
  payer_phone TEXT,
  razorpay_order_id TEXT UNIQUE,
  status public.payment_intent_status NOT NULL DEFAULT 'created',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_intents_order ON public.payment_intents(razorpay_order_id);
GRANT ALL ON public.payment_intents TO service_role;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  beneficiary_phone TEXT NOT NULL,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  source public.entitlement_source NOT NULL,
  payer_phone TEXT,
  status public.entitlement_status NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_entitlements_phone ON public.entitlements(beneficiary_phone);
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;