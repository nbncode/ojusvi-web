import { createFileRoute } from "@tanstack/react-router";

/**
 * Internal ops cron: email alerts for payments flagged as amount mismatches.
 * Call with header: x-cron-secret: <CRON_SECRET>
 *   POST https://<your-domain>/api/public/cron/alert-mismatches
 */
export const Route = createFileRoute("/api/public/cron/alert-mismatches")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) return new Response("Cron secret not configured", { status: 503 });

        const provided = request.headers.get("x-cron-secret");
        if (!provided || provided !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) return new Response("Resend API key not configured", { status: 503 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: rows, error } = await supabaseAdmin
          .from("payments")
          .select(
            "id, user_id, plan, amount, currency, razorpay_order_id, razorpay_payment_id, created_at",
          )
          .eq("status", "flagged_amount_mismatch")
          .is("alerted_at", null)
          .order("created_at", { ascending: true })
          .limit(20);

        if (error) {
          console.error(`[alert-mismatches] payments query failed: ${error.message}`);
          return new Response("Query failed", { status: 500 });
        }

        if (!rows || rows.length === 0) {
          return Response.json({ alerted: 0 });
        }

        let alerted = 0;

        for (const row of rows) {
          // Expected amount comes from the order record written at creation time.
          let expectedAmount: number | null = null;
          if (row.razorpay_order_id) {
            const { data: orderRow, error: orderErr } = await supabaseAdmin
              .from("razorpay_orders")
              .select("expected_amount")
              .eq("order_id", row.razorpay_order_id)
              .maybeSingle();
            if (orderErr) {
              console.error(
                `[alert-mismatches] razorpay_orders lookup failed: ${orderErr.message}`,
                { orderId: row.razorpay_order_id },
              );
            } else if (orderRow) {
              expectedAmount = orderRow.expected_amount;
            }
          }

          const text = [
            "A payment was flagged for an amount mismatch.",
            "",
            `user_id: ${row.user_id ?? "n/a"}`,
            `plan: ${row.plan ?? "n/a"}`,
            `expected amount (razorpay_orders.expected_amount, paise): ${expectedAmount ?? "unknown"}`,
            `actual amount (payments.amount, paise): ${row.amount ?? "unknown"}`,
            `currency: ${row.currency ?? "n/a"}`,
            `razorpay_order_id: ${row.razorpay_order_id ?? "n/a"}`,
            `razorpay_payment_id: ${row.razorpay_payment_id ?? "n/a"}`,
            `created_at: ${row.created_at}`,
          ].join("\n");

          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${resendKey}`,
              },
              body: JSON.stringify({
                from: "Ojusvi Alerts <alerts@ojusvi.app>",
                to: ["hello@ojusvi.app"],
                subject: `Payment amount mismatch — order ${row.razorpay_order_id ?? "unknown"}`,
                text,
              }),
            });

            if (!res.ok) {
              const body = await res.text();
              console.error(`[alert-mismatches] Resend send failed [${res.status}]: ${body}`, {
                paymentId: row.id,
              });
              continue;
            }
          } catch (err) {
            console.error(
              `[alert-mismatches] Resend request threw: ${err instanceof Error ? err.message : String(err)}`,
              { paymentId: row.id },
            );
            continue;
          }

          const { error: updErr } = await supabaseAdmin
            .from("payments")
            .update({ alerted_at: new Date().toISOString() })
            .eq("id", row.id);
          if (updErr) {
            console.error(`[alert-mismatches] alerted_at update failed: ${updErr.message}`, {
              paymentId: row.id,
            });
          }

          alerted += 1;
        }

        return Response.json({ alerted });
      },
    },
  },
});
