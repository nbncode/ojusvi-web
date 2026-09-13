/**
 * Live-class ("watch") access logic. Server-only.
 *
 * Every "is it live right now?" decision is made by Postgres (see the
 * watch_resolve_session / watch_next_session database functions), never by the
 * Worker's own clock, so a skewed edge node can't leak or block playback.
 *
 * Requires the BUNNY_STREAM_SECURITY_KEY and BUNNY_PULL_ZONE_HOSTNAME secrets
 * for signed HLS playback URLs. The pull zone's allowed-referrers list must
 * contain ojusvi.app for the domain lock to apply.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PLAYBACK_TTL_MINUTES = 120;


export type NextSession = {
  scheduledStart: string;
  nextClassFocus: string | null;
};

export type WatchAccess =
  | { status: "paywall"; reason: "lite" | "lapsed" | "never-subscribed"; expiresAt: string | null }
  | { status: "waiting"; nextSession: NextSession | null }
  | { status: "technical-difficulty" }
  | {
      status: "live";
      sessionId: string;
      playbackUrl: string;
      startPositionSeconds: number;
      sessionStartedAt: string;
      durationSeconds: number;
    };

type ResolvedSession = {
  id: string;
  scheduled_start: string;
  duration_seconds: number | null;
  bunny_video_id: string;
  technical_difficulty: boolean;
  next_class_focus: string | null;
  is_live: boolean;
  elapsed_seconds: number | null;
};

/** Live-now session if there is one, else the soonest upcoming one. */
async function resolveSession(): Promise<ResolvedSession | null> {
  const { data, error } = await supabaseAdmin.rpc("watch_resolve_session");
  if (error) {
    console.error(`[watch] resolve session failed: ${error.message}`);
    return null;
  }
  const rows = (data ?? []) as ResolvedSession[];
  return rows[0] ?? null;
}

async function nextSessionOnly(): Promise<NextSession | null> {
  const { data, error } = await supabaseAdmin.rpc("watch_next_session");
  if (error) {
    console.error(`[watch] next session failed: ${error.message}`);
    return null;
  }
  const row = ((data ?? []) as Array<{ scheduled_start: string; next_class_focus: string | null }>)[0];
  if (!row) return null;
  return { scheduledStart: row.scheduled_start, nextClassFocus: row.next_class_focus };
}

function toNextSession(session: ResolvedSession): NextSession {
  return { scheduledStart: session.scheduled_start, nextClassFocus: session.next_class_focus };
}

/** URL-safe base64 of raw bytes, as Bunny's CDN token auth expects. */
function base64UrlSafe(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\n/g, "").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Bunny CDN pull-zone token authentication (direct play, not the iframe embed):
 * token = base64url( SHA256( security_key + path + expiry ) ), where path is the
 * signed URL path. Returned as a raw HLS playlist URL for hls.js, so the
 * frontend can drive a fully custom player with no Bunny chrome.
 */
export async function bunnyPlaybackUrl(videoId: string, expiresAt: number): Promise<string | null> {
  const securityKey = process.env["BUNNY_STREAM_SECURITY_KEY"];
  const pullZone = process.env["BUNNY_PULL_ZONE_HOSTNAME"];
  if (!securityKey || !pullZone) {
    console.error("[watch] BUNNY_STREAM_SECURITY_KEY or BUNNY_PULL_ZONE_HOSTNAME is not set");
    return null;
  }
  const host = pullZone.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const path = `/${videoId}/playlist.m3u8`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${securityKey}${path}${expiresAt}`),
  );
  const token = base64UrlSafe(new Uint8Array(digest));
  const params = new URLSearchParams({ token, expires: String(expiresAt) });
  return `https://${host}${path}?${params.toString()}`;
}


export async function getWatchAccess(userId: string): Promise<WatchAccess> {
  const { data: membership, error: mErr } = await supabaseAdmin
    .from("user_membership_status")
    .select("tier, is_active_now, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (mErr) console.error(`[watch] membership lookup failed: ${mErr.message}`);

  const row = membership as { tier: string | null; is_active_now: boolean | null; expires_at: string | null } | null;

  if (!row || row.tier !== "full" || !row.is_active_now) {
    return {
      status: "paywall",
      reason: row?.tier === "lite" ? "lite" : row ? "lapsed" : "never-subscribed",
      expiresAt: row?.expires_at ?? null,
    };
  }

  const session = await resolveSession();
  if (!session) return { status: "waiting", nextSession: null };
  if (!session.is_live) return { status: "waiting", nextSession: toNextSession(session) };
  if (session.technical_difficulty) return { status: "technical-difficulty" };

  const elapsed = session.elapsed_seconds ?? 0;
  const duration = session.duration_seconds ?? 0;

  // Today's class has run past its length: flow into the next countdown.
  if (elapsed > duration) {
    return { status: "waiting", nextSession: await nextSessionOnly() };
  }

  const expiresAt = Math.floor(Date.now() / 1000) + PLAYBACK_TTL_MINUTES * 60;
  const playbackUrl = await bunnyPlaybackUrl(session.bunny_video_id, expiresAt);
  if (!playbackUrl) return { status: "technical-difficulty" };

  const { error: aErr } = await supabaseAdmin
    .from("watch_attendance")
    .insert({ session_id: session.id, user_id: userId } as never);
  if (aErr) console.error(`[watch] attendance insert failed: ${aErr.message}`);

  return {
    status: "live",
    sessionId: session.id,
    playbackUrl,
    startPositionSeconds: elapsed,
    sessionStartedAt: session.scheduled_start,
    durationSeconds: duration,
  };
}

export type UpcomingSession = {
  id: string;
  scheduled_start: string;
  duration_seconds: number | null;
  technical_difficulty: boolean;
};

/**
 * The soonest 12 sessions that are upcoming or still inside their live window,
 * filtered by Postgres' own clock (never the Worker's). Safe to expose publicly:
 * no video ids, no user data — just timings, for the site-wide "Live now" hint.
 */
export async function getUpcomingWatchSessions(): Promise<UpcomingSession[]> {
  const { data, error } = await supabaseAdmin.rpc("watch_upcoming_sessions");
  if (error) {
    console.error(`[watch] upcoming sessions failed: ${error.message}`);
    return [];
  }
  return (data ?? []) as UpcomingSession[];
}

/** Logged-out marketing view: only ever "what's coming next". */
export async function getPublicWatchSchedule(): Promise<{ nextSession: NextSession | null }> {
  const session = await resolveSession();
  if (!session) return { nextSession: null };
  if (session.is_live) return { nextSession: await nextSessionOnly() };
  return { nextSession: toNextSession(session) };
}
