import { useEffect, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/in/app/ojusvi/id6792540529";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ojusvi.app";

const REDIRECT_MS = 15000;
const MESSAGE_MS = 13000;

// Crawlers, previews and auditing tools must never be redirected: a bot that
// lands on the homepage and gets sent to a store listing can't index the page.
const BOT_RE =
  /bot|crawl|spider|slurp|lighthouse|pagespeed|chrome-lighthouse|headless|preview|facebookexternalhit|whatsapp|embed|bingpreview|google-inspectiontool/i;

function getMobileStoreUrl(): string | null {
  const ua = navigator.userAgent || "";
  if (BOT_RE.test(ua)) return null;
  if (/iPhone|iPod|iPad/.test(ua)) return APP_STORE_URL;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    return APP_STORE_URL;
  if (/android/i.test(ua)) return PLAY_STORE_URL;
  return null;
}

/**
 * Subtle mobile auto-redirect notice.
 * Renders a small non-blocking message near the download CTA shortly before
 * redirecting mobile visitors to their app store. The redirect fires at
 * REDIRECT_MS unless the visitor has interacted with the page; desktop never
 * redirects. A sessionStorage guard limits the redirect to once per session.
 */
export function MobileRedirectNotice() {
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const url = getMobileStoreUrl();
    if (!url) return; // desktop or unknown: never redirect
    setStoreUrl(url);

    if (window.sessionStorage.getItem("ojusvi_store_redirect_shown") === "1") {
      return;
    }

    let cancelled = false;

    const redirectTimer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        window.sessionStorage.setItem("ojusvi_store_redirect_shown", "1");
      } catch {
        // ignore storage errors (e.g. private mode)
      }
      window.location.href = url;
    }, REDIRECT_MS);

    const messageTimer = window.setTimeout(() => {
      if (!cancelled) setShowMessage(true);
    }, MESSAGE_MS);

    const progressTimer = window.setInterval(() => {
      if (!cancelled) {
        setProgress((p) => Math.min(100, p + 100 / ((REDIRECT_MS - MESSAGE_MS) / 250)));
      }
    }, 250);

    const cancelRedirect = () => {
      if (cancelled) return;
      cancelled = true;
      window.clearTimeout(redirectTimer);
      window.clearTimeout(messageTimer);
      window.clearInterval(progressTimer);
    };

    const interactionEvents: Array<keyof WindowEventMap> = ["scroll", "touchstart", "touchmove", "keydown"];
    for (const event of interactionEvents) {
      window.addEventListener(event, cancelRedirect, { passive: true });
    }

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearTimeout(messageTimer);
      window.clearInterval(progressTimer);
      for (const event of interactionEvents) {
        window.removeEventListener(event, cancelRedirect);
      }
    };
  }, []);

  const isIos = storeUrl === APP_STORE_URL;

  // The slot is always rendered on mobile (server-side too) so revealing the
  // message later never shifts the layout below it.
  return (
    <div className="md:hidden mt-4 min-h-[22px]" aria-live="polite">
      <p
        role="status"
        className={`inline-flex items-center gap-2 font-serif italic text-forest/70 text-[15px] transition-opacity duration-300 ${
          storeUrl && showMessage ? "opacity-100" : "opacity-0"
        }`}
      >
        <span
          aria-hidden="true"
          className="relative inline-block h-3 w-3 overflow-hidden rounded-full border border-forest/40"
        >
          <span
            className="absolute inset-y-0 left-0 bg-forest/60 transition-[width] duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </span>
        {isIos ? "Opening the App Store…" : "Opening Google Play…"}
      </p>
    </div>
  );
}