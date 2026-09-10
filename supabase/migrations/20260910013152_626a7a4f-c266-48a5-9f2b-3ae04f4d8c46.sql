GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
CREATE POLICY "Users can read their own entitlements"
ON public.entitlements FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id = auth.uid()
    AND (p.member_phone = public.entitlements.beneficiary_phone
      OR p.payer_phone = public.entitlements.beneficiary_phone
      OR p.payer_phone = public.entitlements.payer_phone)
));

GRANT SELECT ON public.payment_intents TO authenticated;
GRANT ALL ON public.payment_intents TO service_role;
CREATE POLICY "Users can read their own payment intents"
ON public.payment_intents FOR SELECT TO authenticated
USING (auth.uid() = user_id);