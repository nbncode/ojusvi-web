import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { MCP_RATE_LIMIT_MESSAGE, mcpRateLimitExceeded } from "../rate-limit";

/** Normalizes the stored Razorpay/legacy plan value into an access tier. */
function tierFor(plan: string | null | undefined): "full" | "lite" | null {
  switch (plan) {
    case "annual":
    case "monthly":
    case "349":
      return "full";
    case "99":
      return "lite";
    default:
      return null;
  }
}

export default defineTool({
  name: "get_my_membership",
  title: "Get my Ojusvi membership",
  description:
    "Check the signed-in user's Ojusvi membership: plan, access tier, status, current period and expiry.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (mcpRateLimitExceeded(ctx.getUserId() ?? "anonymous")) {
      return { content: [{ type: "text", text: MCP_RATE_LIMIT_MESSAGE }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_start, current_period_end, current_end")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "No membership found for this account." }] };
    }
    const subscription = {
      ...data,
      expires_at: data.current_period_end ?? data.current_end ?? null,
      tier: tierFor(data.plan),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(subscription) }],
      structuredContent: { subscription },
    };
  },
});
