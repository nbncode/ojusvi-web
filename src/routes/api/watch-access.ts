import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/watch-access")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getUserIdFromRequest } = await import("@/lib/rzp-subscriptions.server");
        const userId = await getUserIdFromRequest(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const { getWatchAccess } = await import("@/lib/watch.server");
        const result = await getWatchAccess(userId);
        return Response.json(result, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
