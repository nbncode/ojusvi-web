import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SUBSCRIPTION_PLANS } from "./subscription-plans";

const inputSchema = z.object({
  plan: z.enum(["annual", "monthly"]),
  couponCode: z.string().trim().max(40).optional(),
});

/**
 * Creates a Razorpay order for the signed-in user.
 * The amount is resolved server-side from SUBSCRIPTION_PLANS — never from the browser.
 */
export const createSubscriptionOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof inputSchema>) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const plan = SUBSCRIPTION_PLANS[data.plan];

    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Payments are not configured yet. Please try again shortly.");

    // Coupons are re-validated authoritatively here; the browser never sets the price.
    let amount: number = plan.amount_paise;
    let couponCode: string | null = null;
    let discountApplied = 0;
    if (data.couponCode && data.couponCode.trim()) {
      const { validateCouponServer } = await import("./coupons.server");
      const result = await validateCouponServer({
        rawCode: data.couponCode,
        plan: data.plan,
        userId: context.userId,
      });
      if (!result.valid) {
        throw new Error(`COUPON_INVALID: ${result.message}`);
      }
      amount = result.discountedAmount;
      couponCode = result.code;
      discountApplied = result.discount;
    }

    // Purchaser/member details for Razorpay reports. Read with the user's own
    // RLS-scoped client; missing profile is non-fatal.
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email,payer_name,member_name,payer_phone,member_phone,account_type")
      .eq("user_id", context.userId)
      .maybeSingle();

    // For a gifted ("parent") plan, the entitlement goes to the member's own
    // account, not the payer's — resolved/created via the same real-account
    // resolver the OTP login flow uses. The payer gets no subscription from
    // this purchase. Falls back to the payer's own account if resolution
    // fails, rather than blocking the purchase.
    let beneficiaryUserId = context.userId;
    if (profile?.account_type === "parent" && profile?.member_phone) {
      try {
        const { getOrCreateUserIdForPhone } = await import("./otp.server");
        beneficiaryUserId = await getOrCreateUserIdForPhone(profile.member_phone);
      } catch (e) {
        console.error(`[createSubscriptionOrder] beneficiary account resolution failed: ${(e as Error).message}`);
      }
    }

    // Razorpay notes values must be non-empty strings.
    const str = (v: unknown): string | null => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      return s.length > 0 ? s : null;
    };
    const detailNotes: Record<string, string> = {};
    const details: Record<string, unknown> = {
      email: profile?.email,
      payer_name: profile?.payer_name,
      member_name: profile?.member_name,
      payer_phone: profile?.payer_phone,
      member_phone: profile?.member_phone,
      amount_paise: amount,
      duration_days: plan.duration_days,
    };
    for (const [key, value] of Object.entries(details)) {
      const s = str(value);
      if (s) detailNotes[key] = s;
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "content-type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `oj_${Date.now().toString(36)}`,
        notes: {
          user_id: context.userId,
          beneficiary_user_id: beneficiaryUserId,
          plan: plan.id,
          ...(couponCode ? { coupon_code: couponCode, discount_applied: String(discountApplied) } : {}),
          ...detailNotes,
        },
      }),
    });
    if (!res.ok) throw new Error("Could not start the payment. Please try again.");
    const order = (await res.json()) as { id: string };

    // Audit record of the amount we expect for this order, so the webhook can
    // detect tampered/mismatched payment amounts. Non-blocking on failure.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: ordErr } = await supabaseAdmin.from("razorpay_orders").insert({
        order_id: order.id,
        user_id: context.userId,
        beneficiary_user_id: beneficiaryUserId,
        plan: plan.id,
        expected_amount: amount,
        coupon_code: couponCode,
        discount_applied: discountApplied,
      });
      if (ordErr) {
        console.error(`[createSubscriptionOrder] razorpay_orders insert failed: ${ordErr.message}`, {
          orderId: order.id,
        });
      }
    } catch (e) {
      console.error(`[createSubscriptionOrder] razorpay_orders insert threw: ${(e as Error).message}`);
    }


    return {
      order_id: order.id,
      key_id: keyId,
      amount_paise: amount,
      original_amount_paise: plan.amount_paise,
      coupon_code: couponCode,
      discount_applied: discountApplied,
      plan_id: plan.id,
      plan_name: plan.name,
    };
  });

/**
 * Public order-status lookup for the thank-you page. Keyed on the Razorpay
 * order id (unguessable, non-sensitive) rather than the caller's session, so
 * it works whether the entitlement went to the payer or to a gifted member.
 */
export const checkOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { order_id: string }) => z.object({ order_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("status")
      .eq("razorpay_order_id", data.order_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { status: (payment?.status as "success" | "failed" | undefined) ?? "pending" };
  });
