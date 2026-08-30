
-- Enums
CREATE TYPE public.payment_intent_type AS ENUM ('self', 'parent', 'family', 'self_magic');
CREATE TYPE public.payment_intent_status AS ENUM ('created', 'paid', 'expired');
CREATE TYPE public.entitlement_source AS ENUM ('self', 'family');
CREATE TYPE public.entitlement_status AS ENUM ('active', 'expired');

-- profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- plans
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
VALUES ('annual', 'Ojusvi Annual', 199900, 365, true);

-- payment_intents
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

-- entitlements
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
