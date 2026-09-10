/**
 * Helpers for the recurring Razorpay Subscriptions flow.
 * Server-only. Uses Web Crypto (crypto.subtle) so it runs on Cloudflare Workers.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const RZP_PLAN_99 = "plan_TX64GyVbF5BofB";
export const RZP_PLAN_349 = "plan_TXpUDz8CRl09rR";

export const RZP_PLAN_IDS = {
  "99": RZP_PLAN_99,
  "349": RZP_PLAN_349,
} as const;

export type RzpPlanKey = keyof typeof RZP_PLAN_IDS;

export function razorpayCredentials() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

/** Hex HMAC-SHA256 using Web Crypto (Workers-compatible). */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time-ish comparison of two hex strings. */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Resolves the signed-in user from the request's Bearer token, mirroring the
 * check used by the existing authenticated order flow. Returns null when the
 * caller is not logged in.
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub as string;
}

type SubscriptionUpsert = {
  razorpay_subscription_id: string;
  user_id?: string | null;
  plan?: string | null;
  status?: string;
  current_end?: string | null;
};

/**
 * Upsert keyed on razorpay_subscription_id, done as an explicit
 * select-then-update/insert (the uniqueness is a partial index, which
 * PostgREST's on_conflict inference cannot target).
 */
export async function upsertSubscription(values: SubscriptionUpsert): Promise<{ error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const patch: {
    razorpay_subscription_id: string;
    updated_at: string;
    plan?: string | null;
    status?: string;
    current_end?: string | null;
  } = {
    razorpay_subscription_id: values.razorpay_subscription_id,
    updated_at: new Date().toISOString(),
  };
  if (values.plan !== undefined) patch.plan = values.plan;
  if (values.status !== undefined) patch.status = values.status;
  if (values.current_end !== undefined) patch.current_end = values.current_end;

  const { data: existing, error: selErr } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("razorpay_subscription_id", values.razorpay_subscription_id)
    .maybeSingle();
  if (selErr) return { error: selErr.message };

  if (existing) {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update(patch)
      .eq("razorpay_subscription_id", values.razorpay_subscription_id);
    return error ? { error: error.message } : {};
  }

  if (!values.user_id) return { error: "No user_id available to create the subscription row" };

  // A user may already have a row from the one-time flow — keyed on user_id.
  const { data: byUser, error: userSelErr } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("user_id", values.user_id)
    .maybeSingle();
  if (userSelErr) return { error: userSelErr.message };

  if (byUser) {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update(patch)
      .eq("user_id", values.user_id);
    return error ? { error: error.message } : {};
  }

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .insert({ ...patch, user_id: values.user_id });
  return error ? { error: error.message } : {};
}
