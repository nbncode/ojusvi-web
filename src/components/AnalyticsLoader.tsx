import { useEffect } from "react";

const GTM_ID = "GTM-53R49PBJ";
const FB_PIXEL_ID = "1003917755730830";
const IDLE_DELAY_MS = 3000;

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      push?: unknown;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
  }
}

function loadGtm() {
  if (document.getElementById("gtm-script")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

function loadMetaPixel() {
  if (document.getElementById("fb-pixel-script")) return;
  const n: NonNullable<Window["fbq"]> = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue!.push(args);
  } as NonNullable<Window["fbq"]>;
  if (!window.fbq) window.fbq = n;
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];

  const s = document.createElement("script");
  s.id = "fb-pixel-script";
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);

  window.fbq!("init", FB_PIXEL_ID);
  window.fbq!("track", "PageView");
}

/**
 * Loads GTM and the Meta Pixel after first paint — on the first user
 * interaction, or when the main thread goes idle (whichever comes first),
 * so analytics never competes with initial render for main-thread time.
 */
export function AnalyticsLoader() {
  useEffect(() => {
    let done = false;
    let timeout: number | undefined;
    let idleId: number | undefined;
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      window.removeEventListener("load", schedule);
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
    };

    function start() {
      if (done) return;
      done = true;
      cleanup();
      loadGtm();
      loadMetaPixel();
    }

    // After first paint has settled: idle time if available, else a short timeout.
    function schedule() {
      if (done) return;
      timeout = window.setTimeout(start, IDLE_DELAY_MS);
      const ric = (window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }).requestIdleCallback;
      if (ric) idleId = ric(start, { timeout: IDLE_DELAY_MS });
    }

    // First meaningful interaction always wins, so tracking is never missed.
    events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule);

    return cleanup;
  }, []);

  return null;
}
