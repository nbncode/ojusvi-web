import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { MCP_RATE_LIMIT_MESSAGE, mcpRateLimitExceeded } from "../rate-limit";

export default defineTool({
  name: "get_my_membership",
  title: "Get my Ojusvi membership",
  description:
    "Check the signed-in user's Ojusvi membership: plan, status and current period.",
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
      .select("plan, status, current_period_start, current_period_end")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "No membership found for this account." }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { subscription: data },
    };
  },
});
