/**
 * Site-wide "is a class live right now?" hint for the nav.
 *
 * Deliberately simple and separate from the real access gating in
 * src/routes/watch.tsx — this only decides whether to show "Live Now".
 *
 * Timings come from Postgres (via the public /api/public/watch-upcoming route,
 * which uses the database clock), never from the browser's idea of "now" for
 * the upcoming filter. The list of 12 lives in memory only.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const REFETCH_MS = 12 * 60 * 60 * 1000; // 12 hours
const FLASH_EARLY_MS = 60 * 1000; // go "live" a minute before start
const DEFAULT_DURATION_SECONDS = 60 * 60;

type UpcomingSession = {
  id: string;
  scheduled_start: string;
  duration_seconds: number | null;
  technical_difficulty: boolean;
};

function endOf(session: UpcomingSession): number {
  const start = new Date(session.scheduled_start).getTime();
  return start + (session.duration_seconds ?? DEFAULT_DURATION_SECONDS) * 1000;
}

/** Soonest session that hasn't finished yet. */
function pickRelevant(sessions: UpcomingSession[]): UpcomingSession | null {
  const now = Date.now();
  const alive = sessions
    .filter((s) => endOf(s) > now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime(),
    );
  return alive[0] ?? null;
}

export function useWatchLiveIndicator(): { isLive: boolean } {
  const [isLive, setIsLive] = useState(false);
  const sessionsRef = useRef<UpcomingSession[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const relevantIdRef = useRef<string | null>(null);
  const troubleRef = useRef(false);
  const mountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const removeChannel = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  /** One pair of timers at a time, for the soonest unfinished session only. */
  const arm = useCallback(() => {
    if (!mountedRef.current) return;
    clearTimers();

    const session = pickRelevant(sessionsRef.current);

    if (session?.id !== relevantIdRef.current) {
      relevantIdRef.current = session?.id ?? null;
      troubleRef.current = session?.technical_difficulty ?? false;
      removeChannel();

      if (session) {
        // Watch for this class being flagged as having technical difficulty.
        const channel = supabase
          .channel(`nav-watch-${session.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "watch_sessions",
              filter: `id=eq.${session.id}`,
            },
            (payload) => {
              const row = payload.new as Partial<UpcomingSession>;
              troubleRef.current = row.technical_difficulty === true;
              if (troubleRef.current) setIsLive(false);
              else arm();
            },
          )
          .subscribe();
        channelRef.current = channel;
      }
    } else {
      troubleRef.current = session?.technical_difficulty ?? troubleRef.current;
    }

    if (!session) {
      setIsLive(false);
      return;
    }

    const now = Date.now();
    const liveAt = new Date(session.scheduled_start).getTime() - FLASH_EARLY_MS;
    const endsAt = endOf(session);

    if (troubleRef.current) {
      setIsLive(false);
    } else {
      setIsLive(now >= liveAt && now < endsAt);
    }

    if (now < liveAt) {
      timersRef.current.push(
        setTimeout(() => {
          if (!troubleRef.current) setIsLive(true);
        }, liveAt - now),
      );
    }

    timersRef.current.push(
      setTimeout(() => {
        setIsLive(false);
        sessionsRef.current = sessionsRef.current.filter((s) => s.id !== session.id);
        arm();
      }, Math.max(endsAt - now, 0)),
    );
  }, [clearTimers, removeChannel]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/public/watch-upcoming", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as { sessions?: UpcomingSession[] };
      if (!mountedRef.current) return;
      sessionsRef.current = body.sessions ?? [];
      arm();
    } catch {
      // A missing hint is fine — never break the nav over it.
    }
  }, [arm]);

  useEffect(() => {
    mountedRef.current = true;
    void load();

    const interval = setInterval(() => void load(), REFETCH_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimers();
      removeChannel();
    };
  }, [load, clearTimers, removeChannel]);

  return { isLive };
}
