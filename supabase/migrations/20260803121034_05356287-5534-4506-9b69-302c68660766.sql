CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text,
  status text NOT NULL DEFAULT 'inactive',
  current_period_end timestamptz,
  razorpay_order_id text,
  razorpay_payment_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);