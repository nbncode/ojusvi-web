import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfileTool from "./tools/get-my-profile";
import updateMyProfileTool from "./tools/update-my-profile";
import listPlansTool from "./tools/list-plans";
import getMyMembershipTool from "./tools/get-my-membership";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "ojusvi-wellness-journey",
  title: "Ojusvi Wellness Journey",
  version: "0.1.0",
  instructions:
    "Tools for Ojusvi, a wellness app for seniors 55+ and their families. Use `get_my_profile` and `update_my_profile` to read or edit the signed-in user's membership profile, `list_plans` to see membership plans and pricing, and `get_my_membership` to check membership status and validity.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfileTool, updateMyProfileTool, listPlansTool, getMyMembershipTool],
});