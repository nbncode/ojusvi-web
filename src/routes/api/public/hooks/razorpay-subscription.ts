import { createFileRoute } from "@tanstack/react-router";

/**
 * Razorpay Subscriptions webhook (separate from the one-time payment webhook at
 * /api/public/hooks/razorpay). Configure in the Razorpay dashboard:
 *   https://<your-domain>/api/public/hooks/razorpay-subscription
 * Secret: RAZORPAY_WEBHOOK_SECRET
 */
export const Route = createFileRoute("/api/public/hooks/razorpay-subscription")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { hmacSha256Hex, safeEqualHex, upsertSubscription } = await import(
          "@/lib/rzp-subscriptions.server"
        );

        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook secret not configured", { status: 503 });

        const raw = await request.text();
        const signature = (request.headers.get("x-razorpay-signature") ?? "").trim().toLowerCase();
        const expected = await hmacSha256Hex(secret, raw);
        if (!safeEqualHex(expected, signature)) {
          return new Response("Invalid signature", { status: 400 });
        }

        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const entity = payload?.payload?.subscription?.entity;
        if (!entity?.id) return new Response("ignored", { status: 200 });

        const currentEnd =
          typeof entity.current_end === "number" ? new Date(entity.current_end * 1000).toISOString() : null;

        const { error } = await upsertSubscription({
          razorpay_subscription_id: entity.id as string,
          user_id: (entity.notes?.user_id as string | undefined) ?? null,
          plan: (entity.notes?.plan as string | undefined) ?? null,
          status: (entity.status as string | undefined) ?? "created",
          current_end: currentEnd,
        });
        if (error) {
          console.error(`[razorpay-subscription-webhook] upsert failed: ${error}`, {
            event: payload?.event,
            subscriptionId: entity.id,
          });
        }

        // Additive audit log — never affects the entitlement write or the webhook response.
        try {
          const paymentEntity = payload?.payload?.payment?.entity;
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error: payErr } = await supabaseAdmin.from("payments").insert({
            user_id: (entity.notes?.user_id as string | undefined) ?? null,
            plan: (entity.notes?.plan as string | undefined) ?? null,
            amount: typeof paymentEntity?.amount === "number" ? paymentEntity.amount : null,
            currency: (paymentEntity?.currency as string | undefined) ?? "INR",
            status:
              payload?.event === "subscription.charged"
                ? "success"
                : payload?.event === "subscription.halted"
                  ? "failed"
                  : ((payload?.event as string | undefined) ?? "unknown"),
            razorpay_subscription_id: entity.id as string,
            razorpay_payment_id: (paymentEntity?.id as string | undefined) ?? null,
          });
          if (payErr) {
            console.error(`[razorpay-subscription-webhook] payments insert failed: ${payErr.message}`, {
              event: payload?.event,
              subscriptionId: entity.id,
            });
          }
        } catch (e) {
          console.error(
            `[razorpay-subscription-webhook] payments insert threw: ${e instanceof Error ? e.message : String(e)}`,
          );
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
