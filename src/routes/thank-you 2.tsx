import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { checkOrderStatus } from "@/lib/subscription.functions";
import logoAsset from "@/assets/ojusvi-logo-round-256.webp.asset.json";

const logoRound = logoAsset.url;

export const Route = createFileRoute("/thank-you")({
  validateSearch: z.object({ order: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Welcome to Ojusvi — payment confirmed" },
      { name: "description", content: "Your Ojusvi membership is confirmed. Download the app and begin today." },
      { property: "og:title", content: "Welcome to Ojusvi — payment confirmed" },
      { property: "og:description", content: "Your Ojusvi membership is confirmed. Download the app and begin today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { order } = Route.useSearch();
  const navigate = useNavigate();
  const checkOrderStatusFn = useServerFn(checkOrderStatus);
  const [state, setState] = useState<"pending" | "active" | "slow">("pending");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let cancelled = false;
    const deadline = Date.now() + 15000;

    async function poll() {
      if (!order) {
        if (!cancelled) setState("slow");
        return;
      }
      while (!cancelled && Date.now() < deadline) {
        const result = await checkOrderStatusFn({ data: { order_id: order } });
        if (result.status === "success") {
          if (!cancelled) setState("active");
          return;
        }
        if (result.status === "failed") {
          if (!cancelled) setState("slow");
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setState("slow");
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [order]);

  useEffect(() => {
    if (state !== "active") return;
    const tick = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    const go = setTimeout(() => navigate({ to: "/download-app" }), 5000);
    return () => {
      clearInterval(tick);
      clearTimeout(go);
    };
  }, [state, navigate]);

  return (
    <main className="min-h-screen bg-parchment text-ink text-[17px]">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <img
          src={logoRound}
          alt="Ojusvi logo"
          width={96}
          height={96}
          className="mb-8 h-20 w-auto object-contain md:h-24"
          decoding="async"
        />
        {state === "active" ? (
          <CheckCircle2 className="h-14 w-14 text-forest" aria-hidden="true" />
        ) : (
          <Loader2 className="h-14 w-14 animate-spin text-forest" aria-hidden="true" />
        )}
        <h1 className="mt-6 font-serif italic text-forest text-[40px] md:text-[52px] leading-tight">
          {state === "active" ? "Welcome to Ojusvi." : "Payment received."}
        </h1>
        <p className="mt-4 text-ink/75">
          {state === "active"
            ? "Your payment is confirmed and your membership is active. Your receipt and app link are on their way."
            : state === "pending"
              ? "Payment received — activating your membership…"
              : "Payment received. Activation is taking a moment — we'll notify you shortly."}
        </p>
        {order && <p className="mt-2 text-[15px] text-ink/50">Reference: {order}</p>}
        {state === "active" && (
          <p className="mt-6 text-[15px] text-ink/60">
            Redirecting to download in {countdown}…
          </p>
        )}
        <Link
          to="/download-app"
          className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-forest px-10 text-[18px] text-parchment tracking-wide transition hover:bg-forest-deep active:scale-[0.99]"
        >
          Download the app
        </Link>
        <p className="mt-6 text-ink/60">
          Need help? Call or WhatsApp us — a real person will pick up.{" "}
          <Link to="/" className="underline underline-offset-4 hover:text-forest">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
