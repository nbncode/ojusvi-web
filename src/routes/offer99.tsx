import { createFileRoute } from "@tanstack/react-router";
import { CheckoutHeader, SubscriptionCheckout } from "@/components/ojusvi/SubscriptionCheckout";

export const Route = createFileRoute("/offer99")({
  head: () => ({
    meta: [
      { title: "Ojusvi Lite — ₹99/month special offer" },
      {
        name: "description",
        content:
          "Limited offer: Ojusvi Lite membership at ₹99/month, recurring. Live yoga sessions, panchang, games, medicine reminders and more — cancel anytime.",
      },
      { property: "og:title", content: "Ojusvi Lite — ₹99/month special offer" },
      { property: "og:description", content: "Daily guided wellness for seniors, in your language. Cancel anytime." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Offer99Page,
});

function Offer99Page() {
  return (
    <div className="min-h-screen bg-parchment text-ink text-[17px]">
      <CheckoutHeader />
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-10">
        <h1 className="font-serif italic text-forest text-[34px] md:text-[44px] leading-tight">
          Ojusvi Lite for ₹99/month.
        </h1>
        <p className="mt-2 text-ink/70">
          A special offer — live yoga membership, billed monthly, cancel anytime. Just your name, mobile number and email.
        </p>

        <div className="mt-8">
          <SubscriptionCheckout plan="99" />
        </div>
      </main>
    </div>
  );
}
