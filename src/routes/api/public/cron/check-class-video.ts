import { createFileRoute } from "@tanstack/react-router";
import { sendEmail } from "@/lib/email.server";

/**
 * Internal ops cron: alerts by email when a live class's video does not look
 * playable shortly after the class was supposed to start.
 * Call with header: x-cron-secret: <CRON_SECRET>
 *   POST https://<your-domain>/api/public/cron/check-class-video
 *
 * LIMITATION — this is NOT full monitoring. It can only detect "the file isn't
 * playable" (missing video id, upload/processing not finished, Bunny API
 * failure). It cannot detect a wrong-but-valid video being attached to a
 * session: if someone links last week's class, or any other perfectly encoded
 * video, Bunny reports status 4/"finished" and this check stays silent.
 *
 * Requires: CRON_SECRET, RESEND_API_KEY, BUNNY_STREAM_API_KEY,
 * BUNNY_STREAM_LIBRARY_ID.
 */

const ALERT_TO = "hello@ojusvi.app";

// Bunny Stream video status: 0 Queued, 1 Processing, 2 Encoding, 3 Finished,
// 4 Resolution finished, 5 Failed. Playable states are 3 and 4.
const READY_STATUSES = new Set([3, 4]);

function formatIst(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export const Route = createFileRoute("/api/public/cron/check-class-video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) return new Response("Cron secret not configured", { status: 503 });

        const provided = request.headers.get("x-cron-secret");
        if (!provided || provided !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const bunnyApiKey = process.env["BUNNY_STREAM_API_KEY"];
        const bunnyLibraryId = process.env["BUNNY_STREAM_LIBRARY_ID"];
        if (!bunnyApiKey || !bunnyLibraryId) {
          return new Response("Bunny Stream API credentials not configured", { status: 503 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const now = Date.now();
        const windowStart = new Date(now - 20 * 60 * 1000).toISOString(); // 20 min ago
        const windowEnd = new Date(now - 5 * 60 * 1000).toISOString(); // 5 min ago

        const { data: rows, error } = await supabaseAdmin
          .from("watch_sessions")
          .select("id, scheduled_start, bunny_video_id")
          .eq("technical_difficulty", false)
          .is("alerted_at", null)
          .gte("scheduled_start", windowStart)
          .lte("scheduled_start", windowEnd)
          .order("scheduled_start", { ascending: true })
          .limit(20);

        if (error) {
          console.error(`[check-class-video] watch_sessions query failed: ${error.message}`);
          return new Response("Query failed", { status: 500 });
        }

        if (!rows || rows.length === 0) {
          return Response.json({ checked: 0, alerted: 0 });
        }

        let alerted = 0;

        for (const row of rows) {
          let ready = false;
          let detail = "";

          if (!row.bunny_video_id) {
            detail = "No bunny_video_id is set on this session.";
          } else {
            try {
              const res = await fetch(
                `https://video.bunnycdn.com/library/${bunnyLibraryId}/videos/${row.bunny_video_id}`,
                { headers: { AccessKey: bunnyApiKey, accept: "application/json" } },
              );

              if (!res.ok) {
                const errorBody = await res.text();
                console.error(
                  `[check-class-video] Bunny lookup failed [${res.status}]: ${errorBody}`,
                  { sessionId: row.id },
                );
                detail = `Bunny API returned ${res.status}: ${errorBody.slice(0, 300)}`;
              } else {
                const video = (await res.json()) as { status?: number };
                const status = typeof video.status === "number" ? video.status : -1;
                ready = READY_STATUSES.has(status);
                if (!ready) detail = `Bunny reports video status ${status} (not finished).`;
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              console.error(`[check-class-video] Bunny request threw: ${message}`, {
                sessionId: row.id,
              });
              detail = `Bunny API request failed: ${message}`;
            }
          }

          if (ready) continue;

          const text = [
            "A class was scheduled to be live, but its video does not look playable.",
            "",
            `scheduled_start (IST): ${formatIst(row.scheduled_start)}`,
            `scheduled_start (UTC): ${row.scheduled_start}`,
            `bunny_video_id: ${row.bunny_video_id ?? "n/a"}`,
            `session_id: ${row.id}`,
            "",
            detail,
            "",
            "Note: this check only detects an unplayable file. It cannot tell whether the correct video was attached.",
          ].join("\n");

          const result = await sendEmail({
            to: ALERT_TO,
            subject: "Today's class video may not be ready",
            body: text,
          });

          if (!result.sent) continue;

          const { error: updErr } = await supabaseAdmin
            .from("watch_sessions")
            .update({ alerted_at: new Date().toISOString() })
            .eq("id", row.id);
          if (updErr) {
            console.error(`[check-class-video] alerted_at update failed: ${updErr.message}`, {
              sessionId: row.id,
            });
          }

          alerted += 1;
        }

        return Response.json({ checked: rows.length, alerted });
      },
    },
  },
});
