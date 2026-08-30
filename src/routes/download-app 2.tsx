import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Nav } from "@/components/ojusvi/Nav";
import { Footer } from "@/components/ojusvi/Footer";
import logoRound from "@/assets/ojusvi-logo-round.webp";

const APP_STORE_URL = "https://apps.apple.com/us/app/ojusvi/id6792540529";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ojusvi.app";

function getPlatform() {
  const ua = navigator.userAgent || navigator.vendor || "";
  if (/iPhone|iPod/.test(ua)) return "ios";
  if (/iPad/.test(ua)) return "ios";
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

export const Route = createFileRoute("/download-app")({
  head: () => ({
    meta: [
      { title: "Download Ojusvi — iOS & Android" },
      {
        name: "description",
        content:
          "Download Ojusvi on iPhone or Android. Daily yoga, panchang, satsang and quiet companionship in your language.",
      },
      { property: "og:title", content: "Download Ojusvi" },
      {
        property: "og:description",
        content:
          "Get Ojusvi on the App Store or Google Play. 30 days free.",
      },
      { property: "og:url", content: "https://ojusvi.app/download-app" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/download-app" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Ojusvi",
          applicationCategory: "HealthApplication",
          operatingSystem: "iOS, Android",
          url: "https://ojusvi.app/download-app",
          installUrl: [APP_STORE_URL, PLAY_STORE_URL],
          description:
            "Daily yoga, panchang, satsang and quiet companionship in your language, for seniors 55+ and their families.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }),
      },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const platform = getPlatform();
    if (platform === "ios") {
      setRedirecting(true);
      window.location.href = APP_STORE_URL;
    } else if (platform === "android") {
      setRedirecting(true);
      window.location.href = PLAY_STORE_URL;
    }
  }, []);

  // forest token ~ oklch(0.32 0.06 155) — hex approx for QR foreground
  const forestHex = "#1f3a2b";
  const parchmentHex = "#f7f1e3";

  return (
    <div className="min-h-screen bg-parchment text-forest">
      <Nav />
      <main className="mx-auto flex max-w-[720px] flex-col items-center px-6 pt-32 pb-20 text-center md:pt-40">
        {redirecting ? (
          <p className="mb-6 text-[14px] italic text-forest/70">
            Taking you to the store…
          </p>
        ) : null}

        <img
          src={logoRound}
          alt="Ojusvi logo"
          width={96}
          height={96}
          className="h-20 w-auto object-contain md:h-24"
        />

        <h1 className="mt-6 font-serif italic text-forest text-[34px] sm:text-[42px] md:text-[52px] leading-[1.1]">
          Bring Ojusvi home.
        </h1>
        <p className="mt-4 max-w-[460px] text-[16px] md:text-[18px] leading-[1.65] text-ink/80">
          Daily yoga, panchang, satsang and gentle companionship — in your
          language, on your phone.
        </p>

        <div className="mt-12 grid w-full grid-cols-1 gap-10 sm:grid-cols-2">
          <div className="flex flex-col items-center">
            <a
              href={APP_STORE_URL}
              className="inline-flex h-14 w-full max-w-[260px] items-center justify-center rounded-full bg-forest px-6 text-parchment text-[15px] font-medium tracking-wide shadow-md transition active:scale-[0.98] hover:bg-forest-deep"
            >
              Download on the App Store
            </a>
            <div className="mt-6 rounded-2xl bg-parchment p-5 shadow-[0_8px_30px_rgba(31,58,43,0.12)]">
              <QRCodeSVG
                value={APP_STORE_URL}
                title="QR code linking to the Ojusvi app on the Apple App Store"
                role="img"
                aria-label="QR code linking to the Ojusvi app on the Apple App Store"
                size={168}
                fgColor={forestHex}
                bgColor={parchmentHex}
                level="M"
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <a
              href={PLAY_STORE_URL}
              className="inline-flex h-14 w-full max-w-[260px] items-center justify-center rounded-full bg-forest px-6 text-parchment text-[15px] font-medium tracking-wide shadow-md transition active:scale-[0.98] hover:bg-forest-deep"
            >
              Get it on Google Play
            </a>
            <div className="mt-6 rounded-2xl bg-parchment p-5 shadow-[0_8px_30px_rgba(31,58,43,0.12)]">
              <QRCodeSVG
                value={PLAY_STORE_URL}
                title="QR code linking to the Ojusvi app on Google Play"
                role="img"
                aria-label="QR code linking to the Ojusvi app on Google Play"
                size={168}
                fgColor={forestHex}
                bgColor={parchmentHex}
                level="M"
              />
            </div>
          </div>
        </div>

        <p className="mt-8 font-hand text-forest/80 text-[18px]">
          Scan with your phone's camera.
        </p>
      </main>
      <Footer />
    </div>
  );
}
