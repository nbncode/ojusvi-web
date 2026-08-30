CREATE TABLE public.coupons (
  code text PRIMARY KEY,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','flat')),
  value numeric NOT NULL CHECK (value > 0),
  max_discount integer,
  max_redemptions integer,
  times_redeemed integer NOT NULL DEFAULT 0,
  per_user_limit integer NOT NULL DEFAULT 1,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id text,
  discount_applied integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX coupon_redemptions_order_code_idx
  ON public.coupon_redemptions (coupon_code, order_id) WHERE order_id IS NOT NULL;
CREATE INDEX coupon_redemptions_user_idx ON public.coupon_redemptions (user_id, coupon_code);

GRANT SELECT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own coupon redemptions"
  ON public.coupon_redemptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.payments
  ADD COLUMN coupon_code text,
  ADD COLUMN discount_applied integer;

CREATE OR REPLACE FUNCTION public.increment_coupon_redeemed(p_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons
  SET times_redeemed = times_redeemed + 1, updated_at = now()
  WHERE code = upper(trim(p_code));
$$;

REVOKE ALL ON FUNCTION public.increment_coupon_redeemed(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_redeemed(text) TO service_role;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();