ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_start timestamptz;

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  plan text,
  amount integer,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own payments"
ON public.payments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments (razorpay_order_id);