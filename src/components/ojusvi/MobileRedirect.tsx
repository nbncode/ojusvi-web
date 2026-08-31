import { useEffect, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/us/app/ojusvi/id6792540529";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ojusvi.app";

const REDIRECT_MS = 4000;
const MESSAGE_MS = 2000;

function getMobileStoreUrl(): string | null {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|iPad/.test(ua)) return APP_STORE_URL;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    return APP_STORE_URL;
  if (/android/i.test(ua)) return PLAY_STORE_URL;
  return null;
}

/**
 * Mobile auto-redirect notice. Redirects mobile visitors to their app store
 * unconditionally after REDIRECT_MS, regardless of scrolling, tapping, or
 * key presses. Desktop never redirects.
 */
export function MobileRedirectNotice() {
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const url = getMobileStoreUrl();
    if (!url) return; // desktop or unknown: never redirect
    setStoreUrl(url);

    const redirectTimer = window.setTimeout(() => {
      window.location.href = url;
    }, REDIRECT_MS);

    const messageTimer = window.setTimeout(() => {
      setShowMessage(true);
    }, MESSAGE_MS);

    const progressTimer = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 100 / ((REDIRECT_MS - MESSAGE_MS) / 250)));
    }, 250);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearTimeout(messageTimer);
      window.clearInterval(progressTimer);
    };
  }, []);

  if (!storeUrl || !showMessage) return null;

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
