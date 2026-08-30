import { SUBSCRIPTION_PLANS, type SubscriptionPlanKey } from "./subscription-plans";

export type CouponValidation =
  | {
      valid: true;
      code: string;
      originalAmount: number;
      discountedAmount: number;
      discount: number;
    }
  | { valid: false; message: string };

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase();
}

const MIN_PAYABLE_PAISE = 100;

/**
 * Authoritative, server-only coupon validation.
 * Prices always come from SUBSCRIPTION_PLANS — never from the browser.
 */
export async function validateCouponServer(params: {
  rawCode: string;
  plan: SubscriptionPlanKey;
  userId: string;
}): Promise<CouponValidation> {
  const code = normalizeCouponCode(params.rawCode);
  if (!code) return { valid: false, message: "Please enter a coupon code." };

  const planDef = SUBSCRIPTION_PLANS[params.plan];
  if (!planDef) return { valid: false, message: "Please choose a plan first." };
  const originalAmount = planDef.amount_paise;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .select(
      "code,discount_type,value,max_discount,max_redemptions,times_redeemed,per_user_limit,valid_from,valid_until,active",
    )
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error(`[coupons] lookup failed for ${code}: ${error.message}`);
    return { valid: false, message: "We couldn't check that code just now. Please try again." };
  }
  if (!coupon || !coupon.active) return { valid: false, message: "That coupon code isn't valid." };

  const now = Date.now();
  if (coupon.valid_from && new Date(coupon.valid_from).getTime() > now) {
    return { valid: false, message: "This coupon isn't active yet." };
  }
  if (coupon.valid_until && new Date(coupon.valid_until).getTime() < now) {
    return { valid: false, message: "This coupon has expired." };
  }
  if (coupon.max_redemptions !== null && coupon.times_redeemed >= coupon.max_redemptions) {
    return { valid: false, message: "This coupon has been fully claimed." };
  }

  const perUserLimit = coupon.per_user_limit ?? 1;
  const { count, error: redErr } = await supabaseAdmin
    .from("coupon_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("coupon_code", code)
    .eq("user_id", params.userId);
  if (redErr) {
    console.error(`[coupons] redemption count failed for ${code}: ${redErr.message}`);
    return { valid: false, message: "We couldn't check that code just now. Please try again." };
  }
  if ((count ?? 0) >= perUserLimit) {
    return { valid: false, message: "You've already used this coupon." };
  }

  let discount: number;
  if (coupon.discount_type === "percent") {
    discount = Math.floor((originalAmount * Number(coupon.value)) / 100);
    if (coupon.max_discount !== null) discount = Math.min(discount, coupon.max_discount);
  } else {
    discount = Math.floor(Number(coupon.value));
  }
  discount = Math.max(0, Math.min(discount, originalAmount));

  const discountedAmount = originalAmount - discount;
  if (discount <= 0) return { valid: false, message: "That coupon doesn't apply to this plan." };
  if (discountedAmount < MIN_PAYABLE_PAISE) {
    return { valid: false, message: "That coupon can't be used on this plan." };
  }

  return { valid: true, code, originalAmount, discountedAmount, discount };
}
