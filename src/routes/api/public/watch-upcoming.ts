import { createFileRoute } from "@tanstack/react-router";

/**
 * Public, read-only list of the next 12 class slots (timings only) so every
 * visitor's nav can show a "Live now" hint. Uses the database clock, not the
 * browser's. Contains no video ids and no user data.
 */
export const Route = createFileRoute("/api/public/watch-upcoming")({
  server: {
    handlers: {
      GET: async () => {
        const { getUpcomingWatchSessions } = await import("@/lib/watch.server");
        const sessions = await getUpcomingWatchSessions();
        return Response.json({ sessions }, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
