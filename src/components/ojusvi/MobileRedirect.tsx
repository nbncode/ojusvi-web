import { useCallback, useEffect, useRef, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/us/app/ojusvi/id6792540529";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ojusvi.app";

const REDIRECT_MS = 8000;
const MESSAGE_MS = 5500;
const SCROLL_THRESHOLD = 120; // px of vertical movement treated as intentional

function getMobileStoreUrl(): string | null {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|iPad/.test(ua)) return APP_STORE_URL;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    return APP_STORE_URL;
  if (/android/i.test(ua)) return PLAY_STORE_URL;
  return null;
}

/**
 * Subtle, cancellable mobile auto-redirect notice.
 * Renders a small non-blocking message near the download CTA shortly before
 * redirecting mobile visitors to their app store. Cancels permanently on any
 * intentional interaction (scroll past threshold, tap, click, keypress).
 */
export function MobileRedirectNotice() {
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelledRef = useRef(false);
  const startYRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setShowMessage(false);
  }, []);

  useEffect(() => {
    const url = getMobileStoreUrl();
    if (!url) return; // desktop or unknown: never redirect
    setStoreUrl(url);

    const redirectTimer = window.setTimeout(() => {
      if (!cancelledRef.current) window.location.href = url;
    }, REDIRECT_MS);

    const messageTimer = window.setTimeout(() => {
      if (!cancelledRef.current) setShowMessage(true);
    }, MESSAGE_MS);

    const progressTimer = window.setInterval(() => {
      if (!cancelledRef.current)
        setProgress((p) => Math.min(100, p + 100 / ((REDIRECT_MS - MESSAGE_MS) / 250)));
    }, 250);

    const onScroll = () => {
      const y = window.scrollY;
      if (startYRef.current === null) {
        startYRef.current = y;
        return;
      }
      if (Math.abs(y - startYRef.current) > SCROLL_THRESHOLD) cancel();
    };
    const onPointer = () => cancel();
    const onKey = () => cancel();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearTimeout(messageTimer);
      window.clearInterval(progressTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [cancel]);

  if (!storeUrl || !showMessage || cancelledRef.current) return null;

  const isIos = storeUrl === APP_STORE_URL;

  return (
    <p
      role="status"
      className="md:hidden mt-4 inline-flex items-center gap-2 font-serif italic text-forest/70 text-[15px]"
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
  );
}
