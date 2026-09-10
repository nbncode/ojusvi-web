import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  plan: z.enum(["99", "349"]),
});


export const Route = createFileRoute("/api/verify-subscription")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { razorpayCredentials, hmacSha256Hex, safeEqualHex, getUserIdFromRequest, upsertSubscription } =
          await import("@/lib/rzp-subscriptions.server");

        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const creds = razorpayCredentials();
        if (!creds) return Response.json({ error: "Payments are not configured" }, { status: 503 });

        const expected = await hmacSha256Hex(
          creds.keySecret,
          `${body.razorpay_payment_id}|${body.razorpay_subscription_id}`,
        );
        if (!safeEqualHex(expected, body.razorpay_signature.trim().toLowerCase())) {
          return Response.json({ error: "Invalid signature" }, { status: 400 });
        }

        const userId = await getUserIdFromRequest(request);
        const { error } = await upsertSubscription({
          razorpay_subscription_id: body.razorpay_subscription_id,
          user_id: userId,
          plan: body.plan,
          status: "active",
        });

        if (error) {
          console.error(`[verify-subscription] subscription upsert failed: ${error}`);
          return Response.json({ error: "Could not save the subscription" }, { status: 500 });
        }

        return Response.json({ ok: true, status: "active" });
      },
    },
  },
});
