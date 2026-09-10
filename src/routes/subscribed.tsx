import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";

import logoAsset from "@/assets/ojusvi-logo-round-256.webp";

export const Route = createFileRoute("/subscribed")({
  validateSearch: z.object({ plan: z.enum(["349", "99"]).optional() }),
  head: () => ({
    meta: [
      { title: "Welcome to Ojusvi — membership active" },
      {
        name: "description",
        content: "Your Ojusvi membership is active. Download the app and begin today.",
      },
      { property: "og:title", content: "Welcome to Ojusvi — membership active" },
      { property: "og:description", content: "Your Ojusvi membership is active. Download the app and begin today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscribedPage,
});

function SubscribedPage() {
  const { plan } = Route.useSearch();
  const planLabel = plan === "99" ? "₹99/month" : plan === "349" ? "₹349/month" : null;

  return (
    <main className="min-h-screen bg-parchment text-ink text-[17px]">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <img
          src={logoAsset}
          alt="Ojusvi logo"
          width={96}
          height={96}
          className="mb-8 h-20 w-auto object-contain md:h-24"
          decoding="async"
        />
        <CheckCircle2 className="h-14 w-14 text-forest" aria-hidden="true" />
        <h1 className="mt-6 font-serif italic text-forest text-[40px] md:text-[52px] leading-tight">
          Welcome to Ojusvi.
        </h1>
        <p className="mt-4 text-ink/75">
          {planLabel
            ? `Your membership (${planLabel}, recurring) is active. Your receipt and app link are on their way.`
            : "Your membership is active. Your receipt and app link are on their way."}
        </p>
        <Link
          to="/download-app"
          className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-forest px-10 text-[18px] text-parchment tracking-wide transition hover:bg-forest-deep active:scale-[0.99]"
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
