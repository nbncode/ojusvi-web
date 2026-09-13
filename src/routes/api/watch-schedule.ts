import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/watch-schedule")({
  server: {
    handlers: {
      POST: async () => {
        const { getPublicWatchSchedule } = await import("@/lib/watch.server");
        const result = await getPublicWatchSchedule();
        return Response.json(result, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
