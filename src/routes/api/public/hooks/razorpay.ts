import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

/**
 * Razorpay webhook.
 * Configure this URL in Razorpay dashboard:
 *   https://<your-domain>/api/public/hooks/razorpay
 * Secret used here is RAZORPAY_WEBHOOK_SECRET.
 */
export const Route = createFileRoute("/api/public/hooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 503 });

        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const raw = await request.text();
        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const event = payload.event as string | undefined;
        const isSuccess = event === "payment.captured" || event === "order.paid";
        const isFailure = event === "payment.failed";
        if (!isSuccess && !isFailure) {
          return new Response("ignored", { status: 200 });
        }

        const paymentEntity = payload.payload?.payment?.entity ?? {};
        const orderEntity = payload.payload?.order?.entity ?? {};
        const orderId: string | undefined = paymentEntity.order_id ?? orderEntity.id;
        const paymentId: string | undefined = paymentEntity.id;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // notes.user_id (the payer) and notes.beneficiary_user_id (who the
        // entitlement actually goes to) are set unconditionally by
        // createSubscriptionOrder.
        const notes = { ...(orderEntity.notes ?? {}), ...(paymentEntity.notes ?? {}) } as Record<string, string>;
        const noteUserId = notes["user_id"] ?? null;
        const beneficiaryUserId = notes["beneficiary_user_id"] || noteUserId;
        const notePlan = notes["plan"] ?? null;
        const noteCoupon = notes["coupon_code"] ?? null;
        const noteDiscount = notes["discount_applied"] ? Number(notes["discount_applied"]) : null;
        if (!noteUserId) {
          console.error(
            `[razorpay-webhook] Could not resolve user_id for event=${event} order_id=${orderId ?? "n/a"} payment_id=${paymentId ?? "n/a"}`,
          );
        }

        const amount: number | null =
          typeof paymentEntity.amount === "number"
            ? paymentEntity.amount
            : typeof orderEntity.amount === "number"
              ? orderEntity.amount
              : null;
        const currency: string = paymentEntity.currency ?? orderEntity.currency ?? "INR";

        // Expected-amount check against the record written at order creation.
        let amountMismatch = false;
        if (orderId) {
          const { data: expectedRow, error: expErr } = await supabaseAdmin
            .from("razorpay_orders")
            .select("expected_amount")
            .eq("order_id", orderId)
            .maybeSingle();
          if (expErr) {
            console.error(`[razorpay-webhook] razorpay_orders lookup failed: ${expErr.message}`, { orderId });
          } else if (!expectedRow) {
            console.warn(
              `[razorpay-webhook] No expected-amount record found for orderId=${orderId} — proceeding (legacy order)`,
            );
          } else if (expectedRow.expected_amount !== amount) {
            amountMismatch = true;
            console.error(
              `[razorpay-webhook] AMOUNT MISMATCH orderId=${orderId} paymentId=${paymentId ?? "n/a"} expected_amount=${expectedRow.expected_amount} actual_amount=${amount}`,
            );
          }
        }

        // Append-only audit log of every payment attempt — always the PAYER, since
        // this is their receipt/transaction history.
        const { error: payErr } = await supabaseAdmin.from("payments").insert({
          user_id: noteUserId,
          plan: notePlan,
          amount,
          currency,
          status: amountMismatch ? "flagged_amount_mismatch" : isSuccess ? "success" : "failed",
          razorpay_order_id: orderId ?? null,
          razorpay_payment_id: paymentId ?? null,
          coupon_code: noteCoupon,
          discount_applied: Number.isFinite(noteDiscount) ? noteDiscount : null,
          member_name: notes["member_name"] ?? null,
          member_phone: notes["member_phone"] ?? null,
        });
        if (payErr) {
          console.error(`[razorpay-webhook] payments insert failed: ${payErr.message}`, {
            event,
            orderId,
            paymentId,
          });
        }

        if (amountMismatch) return new Response("ok", { status: 200 });

        if (isFailure) return new Response("ok", { status: 200 });


        if (!orderId) {
          console.error(`[razorpay-webhook] Missing order id for event=${event}`);
          return new Response("ok", { status: 200 });
        }

        // Coupon redemption is tracked against the PAYER (they're the one who used
        // the code) and only ever counted on a confirmed successful payment.
        if (noteCoupon) {
          const { error: redErr } = await supabaseAdmin.from("coupon_redemptions").insert({
            coupon_code: noteCoupon,
            user_id: noteUserId,
            order_id: orderId,
            discount_applied: Number.isFinite(noteDiscount) ? (noteDiscount as number) : 0,
            member_name: notes["member_name"] ?? null,
            member_phone: notes["member_phone"] ?? null,
          });
          if (redErr) {
            if (!/duplicate key/i.test(redErr.message)) {
              console.error(`[razorpay-webhook] coupon_redemptions insert failed: ${redErr.message}`, {
                orderId,
                noteCoupon,
              });
            }
          } else {
            const { error: incErr } = await supabaseAdmin.rpc("increment_coupon_redeemed", {
              p_code: noteCoupon,
            });
            if (incErr) {
              console.error(`[razorpay-webhook] coupon increment failed: ${incErr.message}`, { noteCoupon });
            }
          }
        }

        // The actual entitlement — goes to the BENEFICIARY (payer for a "self"
        // plan, the gifted member's own account for a "parent" plan).
        if (beneficiaryUserId) {
          const days =
            notePlan && notePlan in SUBSCRIPTION_PLANS
              ? SUBSCRIPTION_PLANS[notePlan as keyof typeof SUBSCRIPTION_PLANS].duration_days
              : 30;
          const periodStart = new Date();
          const periodEnd = new Date(periodStart.getTime() + days * 24 * 60 * 60 * 1000);
          const { error: subErr } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: beneficiaryUserId,
              plan: notePlan,
              status: "active",
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId ?? null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (subErr) {
            console.error(`[razorpay-webhook] subscriptions upsert failed: ${subErr.message}`, {
              beneficiaryUserId,
              orderId,
            });
          }
        }

        // If the entitlement went to someone other than the payer (a gifted
        // "parent" plan), make sure that person has a basic profile row too —
        // so their own future login on their own phone isn't missing info.
        if (beneficiaryUserId && beneficiaryUserId !== noteUserId) {
          const beneficiaryProfile: Record<string, unknown> = {
            user_id: beneficiaryUserId,
            account_type: "self",
          };
          if (notes["member_name"]) beneficiaryProfile.member_name = notes["member_name"];
          if (notes["member_phone"]) beneficiaryProfile.member_phone = notes["member_phone"];
          if (notes["payer_name"]) beneficiaryProfile.payer_name = notes["payer_name"];
          if (notes["payer_phone"]) beneficiaryProfile.payer_phone = notes["payer_phone"];

          const { error: benProfErr } = await supabaseAdmin
            .from("profiles")
            .upsert(beneficiaryProfile, { onConflict: "user_id" });
          if (benProfErr) {
            console.error(`[razorpay-webhook] beneficiary profile upsert failed: ${benProfErr.message}`, {
              orderId,
              beneficiaryUserId,
            });
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
