import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCarriedLogin, signOutCarriedLogin } from "@/hooks/useCarriedLogin";
import { AccountBadge } from "@/components/ojusvi/AccountBadge";
import { WatchPlayer } from "@/components/ojusvi/WatchPlayer";
import { WatchSignIn } from "@/components/ojusvi/WatchSignIn";
import { Nav } from "@/components/ojusvi/Nav";
import { Footer } from "@/components/ojusvi/Footer";
import { PillarsSection } from "@/components/ojusvi/PillarsSection";
import { DayTimeline } from "@/components/ojusvi/DayTimeline";
import { Voices } from "@/components/ojusvi/Voices";
import { Languages } from "@/components/ojusvi/Languages";
import { FAQ } from "@/components/ojusvi/FAQ";
import { Pricing } from "@/components/ojusvi/Pricing";
import logoAsset from "@/assets/ojusvi-logo-round-256.webp";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "Watch Live Yoga — Ojusvi" },
      
      {
        name: "description",
        content:
          "Join Ojusvi's live daily yoga sessions, guided in your language. Watch on the web with a Full membership — gentle yoga made for seniors, every day.",
      },
      { property: "og:title", content: "Watch Live Yoga — Ojusvi" },
      {
        property: "og:description",
        content:
          "Join Ojusvi's live daily yoga sessions, guided in your language. Watch on the web with a Full membership.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ojusvi.app/watch" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Watch Live Yoga — Ojusvi" },
      {
        name: "twitter:description",
        content:
          "Join Ojusvi's live daily yoga sessions, guided in your language. Watch on the web with a Full membership.",
      },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/watch" }],
  }),

  component: WatchPage,
});

type NextSession = {
  scheduledStart: string;
  nextClassFocus: string | null;
};

type AccessResult =
  | { status: "paywall"; reason: "never-subscribed" | "lite" | "lapsed"; expiresAt: string | null }
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

/* ── shared UI atoms ─────────────────────────────────────────────── */

const primaryCta =
  "inline-flex min-h-[60px] w-full items-center justify-center rounded-full bg-forest px-8 text-center text-base md:text-lg font-medium tracking-wide text-parchment transition hover:bg-forest-deep active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment sm:w-auto";

const textLink =
  "inline-flex min-h-[48px] items-center text-base md:text-lg text-forest underline underline-offset-4 transition hover:text-forest-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment";

function formatSessionDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Annual-first CTA block, used by every paywall variant. */
function PlanCtas({ annualLabel }: { annualLabel: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Link to="/pay" className={primaryCta}>
        {annualLabel}
      </Link>
      <p className="text-base text-ink/85">₹249/month · save ₹1,200 a year vs monthly</p>
      <Link to="/subscribe" className={textLink}>
        Prefer to pay monthly? ₹349/month
      </Link>
    </div>
  );
}

/** Hours/minutes/seconds, labelled in words — not a bare mm:ss. */
function Countdown({ targetIso }: { targetIso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const total = Math.max(0, Math.floor((new Date(targetIso).getTime() - now) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const parts: Array<{ value: number; label: string }> = [];
  if (hours > 0) parts.push({ value: hours, label: hours === 1 ? "hour" : "hours" });
  parts.push({ value: minutes, label: minutes === 1 ? "minute" : "minutes" });
  if (hours === 0) parts.push({ value: seconds, label: seconds === 1 ? "second" : "seconds" });

  return (
    <div className="flex items-end justify-center gap-6" aria-live="polite">
      {parts.map((p) => (
        <div key={p.label} className="text-center">
          <span className="block text-5xl font-semibold tabular-nums tracking-tight text-forest">
            {p.value}
          </span>
          <span className="mt-1 block text-base text-ink/85">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── popups (unchanged behaviour) ────────────────────────────────── */

type WatchPopupRow = {
  id: string;
  title: string | null;
  body: string | null;
  media_url: string | null;
};

function popupDismissed(id: string): boolean {
  try {
    return localStorage.getItem(`ojusvi_popup_dismissed_${id}`) === "1";
  } catch {
    return false;
  }
}

function dismissPopup(id: string) {
  try {
    localStorage.setItem(`ojusvi_popup_dismissed_${id}`, "1");
  } catch {
    // ignore storage failures
  }
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

function WatchPopup({ popup, onDismiss }: { popup: WatchPopupRow; onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5"
      role="dialog"
      aria-modal="true"
      aria-label={popup.title ?? "Announcement"}
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-parchment p-6 text-left shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full text-2xl leading-none text-ink transition hover:bg-parchment-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          ×
        </button>
        {popup.media_url ? (
          isVideoUrl(popup.media_url) ? (
            <video
              src={popup.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="mb-4 mt-6 w-full rounded-xl"
            />
          ) : (
            <img src={popup.media_url} alt="" className="mb-4 mt-6 w-full rounded-xl" />
          )
        ) : null}
        {popup.title ? (
          <h2 className="mb-2 mt-6 text-xl font-semibold text-forest">{popup.title}</h2>
        ) : null}
        {popup.body ? <p className="whitespace-pre-line text-[17px] text-ink/85">{popup.body}</p> : null}
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────── */

function WatchPage() {
  const carried = useCarriedLogin();
  const [result, setResult] = useState<AccessResult | null>(null);
  const [publicNext, setPublicNext] = useState<NextSession | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [popup, setPopup] = useState<WatchPopupRow | null>(null);
  const popupFetchedFor = useRef<string | null>(null);

  const loggedOut = carried.status === "logged-out";

  useEffect(() => {
    if (carried.status === "loading") return;
    let cancelled = false;

    (async () => {
      try {
        if (carried.status === "logged-out") {
          // Show the marketing view immediately; the schedule fills in when it lands.
          setResult({ status: "paywall", reason: "never-subscribed", expiresAt: null });
          const res = await fetch("/api/watch-schedule", { method: "POST" });
          const data = (await res.json()) as { nextSession: NextSession | null };
          if (cancelled) return;
          setPublicNext(data.nextSession ?? null);
          return;
        }

        const { data: sessionData } = await (
          await import("@/integrations/supabase/client")
        ).supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          if (!cancelled) {
            setResult({ status: "paywall", reason: "never-subscribed", expiresAt: null });
          }
          return;
        }
        const res = await fetch("/api/watch-access", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`watch-access ${res.status}`);
        const data = (await res.json()) as AccessResult;
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [carried.status]);

  useEffect(() => {
    const status = result?.status;
    if (status !== "waiting" && status !== "paywall" && status !== "technical-difficulty") {
      setPopup(null);
      return;
    }
    if (popupFetchedFor.current === status && popup) return;
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("watch_popups")
          .select("id, title, body, media_url")
          .or(`active_from.is.null,active_from.lte.${now}`)
          .or(`active_to.is.null,active_to.gte.${now}`)
          .order("created_at", { ascending: false })
          .limit(1);
        if (cancelled || error) return;
        const row = (data?.[0] ?? null) as WatchPopupRow | null;
        popupFetchedFor.current = status;
        if (row && !popupDismissed(row.id)) setPopup(row);
      } catch {
        // ignore popup fetch failures
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [result?.status, popup]);

  const handleSignOut = async () => {
    await signOutCarriedLogin();
    window.location.reload();
  };

  const badge =
    carried.status === "logged-in" ? (
      <div>
        <AccountBadge
          cc={carried.payerCc}
          phone={carried.phone}
          onSignOut={handleSignOut}
          label="Watching as"
        />
        <Link
          to="/manage"
          className="mt-1 inline-flex min-h-[44px] items-center text-base text-forest underline underline-offset-4 hover:text-forest-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        >
          Manage your membership
        </Link>
      </div>
    ) : null;

  const isLive = result?.status === "live" && !loadError;
  const isWaiting = result?.status === "waiting" && !loadError;
  const showMarketing =
    !loadError && (result?.status === "paywall" || result?.status === "technical-difficulty");

  let body: React.ReactNode;
  if (loadError) {
    body = (
      <p className="text-lg text-ink/85">
        Something went wrong loading this page — please refresh.
      </p>
    );
  } else if (!result) {
    body = <WatchSkeleton />;
  } else if (result.status === "paywall") {
    body = (
      <PaywallView
        reason={result.reason}
        expiresAt={result.expiresAt}
        nextSession={publicNext}
        loggedOut={loggedOut}
      />
    );
  } else if (result.status === "waiting") {
    body = <WaitingView nextSession={result.nextSession} />;
  } else if (result.status === "technical-difficulty") {
    body = (
      <p className="max-w-xl text-2xl text-ink/90">
        We're having technical difficulties — please check back shortly.
      </p>
    );
  } else {
    body = (
      <WatchPlayer
        playbackUrl={result.playbackUrl}
        startPositionSeconds={result.startPositionSeconds}
        sessionId={result.sessionId}
        sessionStartedAt={result.sessionStartedAt}
        durationSeconds={result.durationSeconds}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-parchment text-ink">
      {isLive ? <MinimalHeader /> : <Nav />}
      <main className="relative z-[2]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 pb-16 pt-24 text-center md:px-10 md:pt-28">
          {badge}
          {body}
        </div>

        {showMarketing ? (
          <>
            <PillarsSection />
            <DayTimeline />
            <Voices />
            <Pricing />
            <Languages />
            <FAQ
              pricingHref="#pricing"
              questions={[
                "How do the sessions work?",
                "What do I need for a session?",
                "How long are the sessions?",
                "Which devices can I use?",
                "Which languages does Ojusvi support?",
                /* Temporarily hidden — plans & payment questions
                "What's the difference between the monthly and annual plans?",
                "Why is the annual plan cheaper?",
                "Can I cancel?",
                "How do I subscribe?",
                */

                "How can I reach you?",
              ]}
            />
          </>
        ) : null}
      </main>

      {isLive || isWaiting ? null : <Footer />}

      {popup && result && result.status !== "live" ? (
        <WatchPopup
          popup={popup}
          onDismiss={() => {
            dismissPopup(popup.id);
            setPopup(null);
          }}
        />
      ) : null}
    </div>
  );
}

/** Live state: logo only, so the class is the single focus. */
function MinimalHeader() {
  return (
    <header className="border-b border-forest/10 bg-parchment">
      <div className="mx-auto flex max-w-[1200px] items-center px-5 py-4 md:px-10">
        <Link to="/" aria-label="Ojusvi — home" className="inline-flex items-center leading-none">
          <img
            src={logoAsset}
            alt="Ojusvi logo"
            width={56}
            height={56}
            className="h-10 w-auto object-contain md:h-12"
          />
        </Link>
      </div>
    </header>
  );
}

function WatchSkeleton() {
  return (
    <div className="w-full max-w-2xl animate-pulse space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your class…</span>
      <div className="mx-auto h-10 w-3/4 rounded-full bg-forest/10" />
      <div className="mx-auto h-6 w-1/2 rounded-full bg-forest/10" />
      <div className="mx-auto h-[60px] w-full max-w-sm rounded-full bg-forest/10" />
    </div>
  );
}

const LITE_VS_FULL = {
  lite: ["Live yoga on the app", "Tambola, games and panchang", "Medicine reminders and records"],
  full: [
    "Live yoga on the app and on your laptop",
    "Bhajan clubbing, satsang and live events",
    "Everything in Lite, with nothing held back",
  ],
};

function PaywallView({
  reason,
  expiresAt,
  nextSession,
  loggedOut,
}: {
  reason: "never-subscribed" | "lite" | "lapsed";
  expiresAt: string | null;
  nextSession: NextSession | null;
  loggedOut: boolean;
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      {reason === "lite" ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            Live sessions on the website need Full
          </h1>
          <p className="text-lg text-ink/85">
            You're on Lite. Upgrading keeps your same number and simply moves you to Full — no second
            subscription is created.
          </p>
          <div className="grid w-full gap-4 text-left sm:grid-cols-2">
            <div className="rounded-3xl border border-forest/20 bg-parchment-deep/40 p-5">
              <h2 className="font-serif text-[20px] text-forest">Your Lite plan</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[17px] text-ink/85">
                {LITE_VS_FULL.lite.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-forest bg-parchment-deep/60 p-5">
              <h2 className="font-serif text-[20px] text-forest">Full adds</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[17px] text-ink/85">
                {LITE_VS_FULL.full.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <Link to="/manage" className={primaryCta}>
            Upgrade to Full
          </Link>
          <p className="text-base text-ink/85">
            We'll switch your existing plan — you won't be charged twice.
          </p>
          <a
            href="https://ojusvi.app/download-app"
            className={textLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download the App
          </a>
        </>
      ) : reason === "lapsed" ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            Renew your membership
          </h1>
          <p className="text-lg text-ink/85">
            Your membership ended{expiresAt ? ` on ${formatLongDate(expiresAt)}` : ""}. Renew to
            rejoin live classes today.
          </p>
          <PlanCtas annualLabel="Renew Annual — ₹2,988" />
          <a
            href="https://ojusvi.app/download-app"
            className={textLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download the App
          </a>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            Live daily yoga, made for you
          </h1>
          <p className="text-lg text-ink/85">
            Ojusvi brings gentle, guided yoga and wellness to seniors — in your language, at a pace
            that feels right. Join live every day from home.
          </p>
          <div className="grid w-full gap-4 text-left sm:grid-cols-2">
            <div className="rounded-3xl border border-forest/20 bg-parchment-deep/40 p-5">
              <p className="text-[17px] font-medium text-forest">Live yoga sessions on mobile and laptop</p>
            </div>
            <div className="rounded-3xl border border-forest/20 bg-parchment-deep/40 p-5">
              <p className="text-[17px] font-medium text-forest">Panchang, bhajans, satsang and community events</p>
            </div>
            <div className="rounded-3xl border border-forest/20 bg-parchment-deep/40 p-5">
              <p className="text-[17px] font-medium text-forest">Medicine reminders and AI medical record keeper</p>
            </div>
            <div className="rounded-3xl border border-forest/20 bg-parchment-deep/40 p-5">
              <p className="text-[17px] font-medium text-forest">Available in your language</p>
            </div>
          </div>
          <PlanCtas annualLabel="Join Annual — ₹2,988" />
          <p className="text-sm text-ink/70">
            Just want the app?{" "}
            <Link
              to="/offer99"
              className="text-forest underline underline-offset-4 transition hover:text-forest-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
            >
              Lite is ₹99/month — mobile access only.
            </Link>
          </p>
          <a
            href="https://ojusvi.app/download-app"
            className={textLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download the App
          </a>
        </>
      )}

      {loggedOut ? <WatchSignIn /> : null}

      {nextSession ? (
        <p className="text-base text-ink/85">
          Next class: {formatSessionDate(nextSession.scheduledStart)}
          {nextSession.nextClassFocus ? ` — ${nextSession.nextClassFocus}` : ""}.
        </p>
      ) : null}
    </div>
  );
}

const KEEP_READY = [
  "Comfortable clothing",
  "A yoga mat",
  "One yoga belt",
  "Two yoga blocks",
  "A pillow or cushion",
  "A water bottle",
];

function WaitingView({ nextSession }: { nextSession: NextSession | null }) {
  const withinHour = useMemo(() => {
    if (!nextSession) return false;
    const diff = new Date(nextSession.scheduledStart).getTime() - Date.now();
    return diff > 0 && diff <= 90 * 60 * 1000;
  }, [nextSession]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      {nextSession ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            Next class: {formatSessionDate(nextSession.scheduledStart)}
          </h1>
          {nextSession.nextClassFocus ? (
            <p className="text-lg text-ink/85">{nextSession.nextClassFocus}</p>
          ) : null}
          {withinHour ? <Countdown targetIso={nextSession.scheduledStart} /> : null}
        </div>
      ) : (
        <h1 className="text-2xl text-ink/90 md:text-3xl">
          No class currently scheduled — check back soon.
        </h1>
      )}

      <section className="w-full rounded-3xl border border-forest/20 bg-parchment-deep/40 p-6 text-left">
        <h2 className="font-serif text-[22px] text-forest">What to keep ready</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-[17px] text-ink/90">
          {KEEP_READY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="w-full rounded-3xl border border-forest/20 bg-parchment-deep/40 p-6 text-left">
        <h2 className="font-serif text-[22px] text-forest">Prefer your phone?</h2>
        <p className="mt-2 text-[17px] text-ink/90">
          The Ojusvi app reminds you before every class and keeps your medicines and records in one
          place.
        </p>
        <a
          href="https://ojusvi.app/download-app"
          className={`mt-4 ${primaryCta}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download the app
        </a>
      </section>
    </div>
  );
}
