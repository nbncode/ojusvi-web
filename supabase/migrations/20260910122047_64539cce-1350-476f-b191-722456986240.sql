CREATE TABLE public.plan_switch_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  razorpay_subscription_id text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.plan_switch_failures TO service_role;
ALTER TABLE public.plan_switch_failures ENABLE ROW LEVEL SECURITY;

-- No client access: block all public Data API access with restrictive policies.
CREATE POLICY "service_role_all_plan_switch_failures" ON public.plan_switch_failures
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "deny_authenticated_plan_switch_failures" ON public.plan_switch_failures
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_anon_plan_switch_failures" ON public.plan_switch_failures
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.razorpay_orders
  ADD COLUMN supersedes_subscription_id text;

-- razorpay_orders is accessed by service_role and authenticated inserts/updates via existing backend functions; ensure column is usable.
GRANT SELECT, INSERT, UPDATE ON public.razorpay_orders TO service_role;

-- Add indexes for common lookups.
CREATE INDEX IF NOT EXISTS idx_plan_switch_failures_user_id ON public.plan_switch_failures(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_switch_failures_created_at ON public.plan_switch_failures(created_at);
CREATE INDEX IF NOT EXISTS idx_razorpay_orders_supersedes_subscription_id ON public.razorpay_orders(supersedes_subscription_id);