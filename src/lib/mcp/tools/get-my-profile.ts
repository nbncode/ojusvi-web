import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { MCP_RATE_LIMIT_MESSAGE, mcpRateLimitExceeded } from "../rate-limit";

export default defineTool({
  name: "get_my_profile",
  title: "Get my Ojusvi profile",
  description:
    "Read the signed-in user's Ojusvi profile: account type (self or parent), payer name, member name and member phone.",
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
      .from("profiles")
      .select("account_type, payer_name, member_name, member_phone, payer_phone, updated_at")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "No profile found for this account yet." }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { profile: data },
    };
  },
});