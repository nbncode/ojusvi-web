import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { MCP_RATE_LIMIT_MESSAGE, mcpRateLimitExceeded } from "../rate-limit";

export default defineTool({
  name: "list_plans",
  title: "List Ojusvi membership plans",
  description: "List the available Ojusvi membership plans with price in paise and duration in days.",
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
      .from("plans")
      .select("id, name, amount_paise, duration_days, is_default")
      .order("duration_days", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { plans: data ?? [] },
    };
  },
});