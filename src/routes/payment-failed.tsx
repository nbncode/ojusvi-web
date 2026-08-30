import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";

import logoAsset from "@/assets/ojusvi-logo-round-256.webp";

const logoRound = logoAsset;

const searchSchema = z.object({
  reason: z.enum(["failed", "dismissed", "order"]).optional(),
  order: z.string().optional(),
});

export const Route = createFileRoute("/payment-failed")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Payment not completed — Ojusvi" },
      {
        name: "description",
        content:
          "Your payment could not be completed. No money was deducted. You can try again or start with a free trial.",
      },
      { property: "og:title", content: "Payment not completed — Ojusvi" },
      {
        property: "og:description",
        content:
          "Your payment could not be completed. No money was deducted. You can try again or start with a free trial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentFailed,
});

const MESSAGES: Record<"failed" | "dismissed" | "order", { heading: string; body: string }> = {
  failed: {
    heading: "Your payment didn't go through.",
    body:
      "The transaction was declined or interrupted by your bank/UPI app. No money has been deducted from your account.",
  },
  dismissed: {
    heading: "Payment window closed.",
    body:
      "It looks like you closed the payment screen before completing the transaction. Nothing has been charged.",
  },
  order: {
    heading: "We couldn't start your payment.",
    body:
      "There was a problem preparing your order. This is usually temporary — please try again in a moment.",
  },
};

function PaymentFailed() {
  const { reason, order } = Route.useSearch();
  const currentReason: keyof typeof MESSAGES =
    reason === "failed" || reason === "dismissed" || reason === "order" ? reason : "failed";
  const message = MESSAGES[currentReason];

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
        <XCircle className="h-14 w-14 text-terracotta" aria-hidden="true" />
        <h1 className="mt-6 font-serif italic text-forest text-[40px] md:text-[52px] leading-tight">
          {message.heading}
        </h1>
        <p className="mt-4 max-w-lg text-ink/75">{message.body}</p>

        {order && (
          <p className="mt-2 text-[15px] text-ink/50">
            Reference: <span className="font-medium">{order}</span>
          </p>
        )}

        <div className="mt-8 flex w-full max-w-md flex-col gap-4">
          <Link
            to="/pay"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-forest px-10 text-[18px] text-parchment tracking-wide transition hover:bg-forest-deep active:scale-[0.99]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Try payment again
          </Link>

          <Link
            to="/download-app"
            className="inline-flex h-14 items-center justify-center rounded-full border border-forest/25 px-10 text-[18px] text-forest transition hover:bg-parchment-deep"
          >
            Start 30 days free
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-[17px] text-ink/70">
          <p>Need help? We're here.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+919958905337"
              className="inline-flex items-center gap-2 text-forest underline underline-offset-4 hover:text-forest-deep"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call us
            </a>
            <a
              href="https://wa.me/919958905337?text=Hello%20%F0%9F%91%8B%F0%9F%91%8B"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-forest underline underline-offset-4 hover:text-forest-deep"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp us
            </a>
          </div>
        </div>

        <p className="mt-12 text-sm">
          <Link to="/" className="text-forest underline underline-offset-4 hover:text-forest-deep">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
