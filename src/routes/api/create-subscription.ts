import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({ plan: z.enum(["99", "349"]) });

export const Route = createFileRoute("/api/create-subscription")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { RZP_PLAN_IDS, razorpayCredentials, getUserIdFromRequest } = await import(
          "@/lib/rzp-subscriptions.server"
        );

        const userId = await getUserIdFromRequest(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        let parsed: { plan: "99" | "349" };
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const creds = razorpayCredentials();
        if (!creds) return Response.json({ error: "Payments are not configured" }, { status: 503 });

        const auth = btoa(`${creds.keyId}:${creds.keySecret}`);
        const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
          method: "POST",
          headers: { Authorization: `Basic ${auth}`, "content-type": "application/json" },
          body: JSON.stringify({
            plan_id: RZP_PLAN_IDS[parsed.plan],
            total_count: 120,
            customer_notify: 1,
            notes: { user_id: userId, plan: parsed.plan },
          }),
        });

        if (!res.ok) {
          console.error(`[create-subscription] Razorpay error ${res.status}: ${await res.text()}`);
          return Response.json({ error: "Could not start the subscription" }, { status: 502 });
        }

const subscription = (await res.json()) as { id: string };
        return Response.json({ subscription_id: subscription.id, key_id: creds.keyId });
      },
    },
  },
});
