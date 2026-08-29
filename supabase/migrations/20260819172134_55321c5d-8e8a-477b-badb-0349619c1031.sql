CREATE TABLE public.razorpay_orders (
  order_id text PRIMARY KEY,
  user_id uuid,
  beneficiary_user_id uuid,
  plan text,
  expected_amount integer NOT NULL,
  coupon_code text,
  discount_applied integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.razorpay_orders TO service_role;

ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;