/**
 * Server-only sliding-window rate limiting backed by public.rate_limit_events.
 * The table is service_role-only (RLS enabled, no policies), so limits cannot
 * be read or tampered with from the browser.
 */

/** Best-effort client IP for this stack (Cloudflare / proxy headers). */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return (
    headers.get("cf-connecting-ip")?.trim() ||
    first ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Counts hits for `bucket`/`key` inside the rolling window and records this one
 * when it is under the limit. Fails open on infrastructure errors so a database
 * hiccup never blocks legitimate sign-ins.
 */
export async function consumeRateLimit(opts: {
  bucket: string;
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const { bucket, key, limit, windowSeconds } = opts;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .eq("key", key)
    .gte("created_at", since);

  if (error) {
    console.error("rate limit read failed", error);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }

  const used = count ?? 0;
  if (used >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: windowSeconds };
  }

  const { error: insertError } = await supabaseAdmin
    .from("rate_limit_events")
    .insert({ bucket, key });
  if (insertError) console.error("rate limit write failed", insertError);

  // Opportunistic cleanup of old rows (cheap, service_role only).
  if (Math.random() < 0.05) {
    await supabaseAdmin
      .from("rate_limit_events")
      .delete()
      .lt("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  }

  return { allowed: true, remaining: limit - used - 1, retryAfterSeconds: 0 };
}
