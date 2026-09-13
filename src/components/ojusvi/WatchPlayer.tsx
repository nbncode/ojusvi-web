import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";

type NextSession = { scheduledStart: string; nextClassFocus: string | null };

type Props = {
  playbackUrl: string;
  startPositionSeconds: number;
  sessionId: string;
  sessionStartedAt: string;
  durationSeconds: number;
};

type Support = "hls" | "native" | "none" | "unknown";

const POLL_MS = 20000;

function formatIstTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
  return `${parts.replace(/\s/g, "").toLowerCase()} IST`;
}

function isMobileUa(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

async function fetchAccess(): Promise<any | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return null;
    const res = await fetch("/api/watch-access", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const REACTIONS = ["🙏", "❤️", "👏"] as const;

type FloatingReaction = { id: number; emoji: string; left: number; drift: number };

export function WatchPlayer({
  playbackUrl,
  startPositionSeconds,
  sessionId,
  sessionStartedAt,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<any>(null);
  const snappingRef = useRef(false);
  const joinedRef = useRef(false);
  const channelRef = useRef<any>(null);
  const reactionSeq = useRef(0);

  const [support, setSupport] = useState<Support>("unknown");
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showJoinBanner, setShowJoinBanner] = useState(false);
  const [snapMessage, setSnapMessage] = useState(false);
  const [ended, setEnded] = useState<{ nextSession: NextSession | null } | null>(null);
  const [mobile, setMobile] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);


  useEffect(() => {
    setMobile(isMobileUa());
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("hls.js");
        const Hls = mod.default;
        if (cancelled) return;
        if (Hls.isSupported()) {
          setSupport("hls");
          return;
        }
      } catch {
        /* fall through to native detection */
      }
      if (cancelled) return;
      const probe = document.createElement("video");
      const can = probe.canPlayType("application/vnd.apple.mpegurl");
      setSupport(can ? "native" : "none");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    },
    [],
  );

  /** Ask the server where "live" is right now, seek there and resume. */
  const snapToLive = useCallback(
    async (announce: boolean) => {
      const video = videoRef.current;
      if (!video || snappingRef.current || !joinedRef.current) return;
      snappingRef.current = true;
      if (announce) setSnapMessage(true);
      try {
        const data = await fetchAccess();
        if (data?.status === "waiting") {
          video.pause();
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
          setEnded({ nextSession: data.nextSession ?? null });
          return;
        }
        if (data?.status === "live" && typeof data.startPositionSeconds === "number") {
          try {
            video.currentTime = data.startPositionSeconds;
          } catch {
            /* seek may fail before metadata; play() still recovers */
          }
        }
        await video.play().catch(() => undefined);
      } finally {
        snappingRef.current = false;
        if (announce) setTimeout(() => setSnapMessage(false), 3000);
      }
    },
    [],
  );

  const join = useCallback(async () => {
    const video = videoRef.current;
    if (!video || joined) return;
    setJoined(true);
    joinedRef.current = true;
    if (startPositionSeconds > 0) setShowJoinBanner(true);

    const seekAndPlay = () => {
      if (startPositionSeconds > 0) {
        try {
          video.currentTime = startPositionSeconds;
        } catch {
          /* ignore */
        }
      }
      void video.play().catch(() => undefined);
    };

    if (support === "hls") {
      const Hls = (await import("hls.js")).default;
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(playbackUrl));
      hls.on(Hls.Events.MANIFEST_PARSED, seekAndPlay);
    } else {
      video.src = playbackUrl;
      video.addEventListener("loadedmetadata", seekAndPlay, { once: true });
      video.load();
    }
  }, [joined, playbackUrl, startPositionSeconds, support]);

  // Block pause from every path: native events, media session, keyboard, tab return.
  useEffect(() => {
    if (!joined || ended) return;
    const video = videoRef.current;
    if (!video) return;

    const onPause = () => void snapToLive(true);
    video.addEventListener("pause", onPause);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        void video.play().catch(() => undefined);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void snapToLive(true);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ms = typeof navigator !== "undefined" ? (navigator as any).mediaSession : null;
    if (ms?.setActionHandler) {
      try {
        ms.setActionHandler("pause", () => void snapToLive(true));
        ms.setActionHandler("stop", () => void snapToLive(true));
      } catch {
        /* unsupported action */
      }
    }

    return () => {
      video.removeEventListener("pause", onPause);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      if (ms?.setActionHandler) {
        try {
          ms.setActionHandler("pause", null);
          ms.setActionHandler("stop", null);
        } catch {
          /* ignore */
        }
      }
    };
  }, [joined, ended, snapToLive]);

  // Server-derived session-end / drift check.
  useEffect(() => {
    if (!joined || ended) return;
    const id = setInterval(async () => {
      const data = await fetchAccess();
      if (data?.status === "waiting") {
        const video = videoRef.current;
        video?.pause();
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        setEnded({ nextSession: data.nextSession ?? null });
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [joined, ended]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  /** Show a floating emoji for ~2s, then drop it. */
  const showReaction = useCallback((emoji: string) => {
    if (!emoji) return;
    const id = ++reactionSeq.current;
    const item: FloatingReaction = {
      id,
      emoji,
      left: 10 + Math.random() * 80,
      drift: Math.round((Math.random() - 0.5) * 60),
    };
    setFloating((prev) => [...prev, item]);
    setTimeout(() => setFloating((prev) => prev.filter((r) => r.id !== id)), 2100);
  }, []);

  // Presence (viewer count) + broadcast reactions — only while joined and playing.
  useEffect(() => {
    if (!joined || ended) return;
    let active = true;

    void (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      if (!active) return;
      const key = Math.random().toString(36).slice(2);
      const channel = supabase.channel(`watch-session-${sessionId}`, {
        config: { presence: { key } },
      });
      channelRef.current = channel;
      channel
        .on("presence", { event: "sync" }, () => {
          setViewers(Object.keys(channel.presenceState()).length);
        })
        .on("broadcast", { event: "reaction" }, ({ payload }: any) =>
          showReaction(payload?.emoji),
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") void channel.track({});
        });
    })();

    return () => {
      active = false;
      const channel = channelRef.current;
      channelRef.current = null;
      setViewers(0);
      if (!channel) return;
      void (async () => {
        try {
          await channel.untrack();
        } catch {
          /* already gone */
        }
        const { supabase } = await import("@/integrations/supabase/client");
        void supabase.removeChannel(channel);
      })();
    };
  }, [joined, ended, sessionId, showReaction]);

  const sendReaction = useCallback(
    (emoji: string) => {
      showReaction(emoji);
      void channelRef.current?.send({
        type: "broadcast",
        event: "reaction",
        payload: { emoji },
      });
    },
    [showReaction],
  );



  if (ended) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-forest tracking-tight">
          Today's session has ended
        </h1>
        {ended.nextSession ? (
          <p className="text-lg text-ink/70">
            Next class:{" "}
            {new Intl.DateTimeFormat("en-IN", {
              timeZone: "Asia/Kolkata",
              weekday: "long",
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).format(new Date(ended.nextSession.scheduledStart))}
            {ended.nextSession.nextClassFocus ? ` — ${ended.nextSession.nextClassFocus}` : ""}
          </p>
        ) : (
          <p className="text-lg text-ink/70">No class currently scheduled — check back soon.</p>
        )}
      </div>
    );
  }

  if (support === "none") {
    return (
      <div className="flex flex-col items-center gap-5 max-w-xl">
        <p className="text-xl text-ink/80">
          Please update your browser to watch, or use the Ojusvi app
        </p>
        <a
          href="https://ojusvi.app/download-app"
          className="inline-flex h-12 items-center justify-center rounded-full bg-forest px-8 text-parchment text-sm font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest-deep"
        >
          Get the Ojusvi app
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] flex flex-col gap-4">
      <div className="relative w-full overflow-hidden rounded-3xl bg-black aspect-video">
        <video
          ref={videoRef}
          controls={false}
          playsInline
          {...{ "webkit-playsinline": "true" }}
          disablePictureInPicture
          className="h-full w-full object-contain"
          onClick={(e) => e.preventDefault()}
        />

        {!joined ? (
          <div className="absolute inset-0 flex items-center justify-center bg-forest-deep/80">
            <button
              type="button"
              onClick={() => void join()}
              disabled={support === "unknown"}
              className="inline-flex min-h-[64px] items-center justify-center rounded-full bg-parchment px-10 text-xl font-semibold text-forest transition active:scale-[0.98] disabled:opacity-60"
            >
              Join Live Class
            </button>
          </div>
        ) : null}

        {snapMessage ? (
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-5 py-2 text-parchment text-[15px]"
            aria-live="polite"
          >
            You paused — rejoining live.
          </div>
        ) : null}

        {joined ? (
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-ink/80 to-transparent px-5 py-4">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-parchment/15 text-parchment"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                setMuted(v === 0);
              }}
              aria-label="Volume"
              className="h-2 w-28 sm:w-40 accent-parchment"
            />

            <div className="ml-auto flex items-center gap-1.5">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => sendReaction(emoji)}
                  aria-label={`Send ${emoji} reaction`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-parchment/15 text-lg leading-none transition active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {joined && !ended ? (
          <>
            <div className="pointer-events-none absolute top-4 left-4 rounded-full bg-ink/60 px-3 py-1 text-[13px] text-parchment">
              {viewers > 0
                ? `${viewers} watching now`
                : "Connecting\u2026"}
            </div>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {floating.map((r) => (
                <span
                  key={r.id}
                  className="animate-reaction-float absolute bottom-24 text-3xl"
                  style={{ left: `${r.left}%`, ["--reaction-drift" as any]: `${r.drift}px` }}
                >
                  {r.emoji}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>


      {joined && showJoinBanner ? (
        <div className="flex items-start gap-3 rounded-2xl bg-forest/10 px-5 py-4 text-left">
          <p className="text-[15px] text-ink/80 flex-1">
            This session started at {formatIstTime(sessionStartedAt)} — you're joining live.
          </p>
          <button
            type="button"
            onClick={() => setShowJoinBanner(false)}
            aria-label="Dismiss"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {mobile ? (
        <a
          href="https://ojusvi.app/download-app"
          className="rounded-2xl bg-forest/10 px-5 py-3 text-[15px] text-forest text-center"
        >
          For the best experience, download the Ojusvi app
        </a>
      ) : null}
    </div>
  );
}
