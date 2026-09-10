ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id text,
  ADD COLUMN IF NOT EXISTS current_end timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_razorpay_subscription_id_key
  ON public.subscriptions (razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;