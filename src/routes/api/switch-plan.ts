import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({ toPlan: z.enum(["99", "349"]) });

export const Route = createFileRoute("/api/switch-plan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { RZP_PLAN_IDS, getUserIdFromRequest } = await import(
            "@/lib/rzp-subscriptions.server"
          );

          const userId = await getUserIdFromRequest(request);
          if (!userId) return new Response("Unauthorized", { status: 401 });

          let parsed: { toPlan: "99" | "349" };
          try {
            parsed = bodySchema.parse(await request.json());
          } catch {
            return Response.json({ error: "Invalid request body" }, { status: 400 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: sub, error: selErr } = await supabaseAdmin
            .from("subscriptions")
            .select("razorpay_subscription_id, plan")
            .eq("user_id", userId)
            .maybeSingle();

          if (selErr) {
            console.error(`[switch-plan] subscription lookup failed: ${selErr.message}`);
            return Response.json(
              { error: "Could not look up your current plan. Please try again." },
              { status: 500 },
            );
          }

          const subscriptionId = sub?.razorpay_subscription_id;
          if (!subscriptionId) {
            return Response.json(
              {
                error:
                  "You do not have a monthly subscription to switch. Changing to or from the annual plan needs a new checkout.",
              },
              { status: 400 },
            );
          }

          const newPlanId = RZP_PLAN_IDS[parsed.toPlan];
          const scheduleChangeAt = parsed.toPlan === "349" ? "now" : "cycle_end";

          const { attemptSubscriptionUpdate, cancelSubscription } = await import(
            "@/lib/plan-switch.server"
          );

          const update = await attemptSubscriptionUpdate(
            subscriptionId,
            newPlanId,
            scheduleChangeAt,
            userId,
          );
          if (update.success) return Response.json({ status: "updated" });

          // Expected for UPI mandates: Razorpay does not allow in-place plan
          // changes. Cancel at cycle end so paid-for access is kept, and send
          // the user through a real checkout to authorise the new mandate.
          await cancelSubscription(subscriptionId, true, userId);

          return Response.json({
            status: "checkout_required",
            redirectTo: parsed.toPlan === "349" ? "/subscribe" : "/offer99",
          });
        } catch (e) {
          console.error(`[switch-plan] unexpected failure: ${String(e)}`);
          return Response.json(
            { error: "Something went wrong while switching your plan. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});
