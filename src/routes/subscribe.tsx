import { createFileRoute } from "@tanstack/react-router";
import {
  CheckoutHeader,
  SubscriptionCheckout,
  SubscriptionPlanSummary,
} from "@/components/ojusvi/SubscriptionCheckout";

export const Route = createFileRoute("/subscribe")({
  head: () => ({
    meta: [
      { title: "Ojusvi Membership — ₹349/month" },
      {
        name: "description",
        content:
          "Start your Ojusvi membership at ₹349/month, recurring. Live guided sessions, panchang, satsang and more — cancel anytime.",
      },
      { property: "og:title", content: "Ojusvi Membership — ₹349/month" },
      { property: "og:description", content: "Daily guided wellness for seniors, in your language. Cancel anytime." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscribePage,
});

function SubscribePage() {
  return (
    <div className="min-h-screen bg-parchment text-ink text-[17px]">
      <CheckoutHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">
        <h1 className="font-serif italic text-forest text-[34px] md:text-[44px] leading-tight">
          Become an Ojusvi member.
        </h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          ₹349/month, recurring — cancel anytime. A few details, one secure payment, and your Ojusvi days begin.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
          <SubscriptionPlanSummary plan="349" />
          <SubscriptionCheckout plan="349" />
        </div>
      </main>
    </div>
  );
}
