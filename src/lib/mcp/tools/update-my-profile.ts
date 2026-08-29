import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { MCP_RATE_LIMIT_MESSAGE, mcpRateLimitExceeded } from "../rate-limit";

export default defineTool({
  name: "update_my_profile",
  title: "Update my Ojusvi profile",
  description:
    "Update the signed-in user's Ojusvi profile fields (payer name, member name, member phone, account type).",
  inputSchema: {
    payer_name: z.string().trim().optional().describe("Name of the person paying / the account holder."),
    member_name: z.string().trim().optional().describe("Name of the member using Ojusvi, when paying for a parent."),
    member_phone: z.string().trim().optional().describe("Member's phone number in E.164 format, e.g. +919876543210."),
    account_type: z.enum(["self", "parent"]).optional().describe("Whether the membership is for the payer or a parent."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (mcpRateLimitExceeded(ctx.getUserId() ?? "anonymous")) {
      return { content: [{ type: "text", text: MCP_RATE_LIMIT_MESSAGE }], isError: true };
    }
    const updates = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined && v !== ""),
    );
    if (Object.keys(updates).length === 0) {
      return { content: [{ type: "text", text: "Nothing to update." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", ctx.getUserId())
      .select("account_type, payer_name, member_name, member_phone")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "No profile found to update." }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { profile: data },
    };
  },
});