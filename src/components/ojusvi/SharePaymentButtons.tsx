/**
 * Shared "ask someone else to pay" actions. Replaces the old text-link + modal
 * pattern: a direct WhatsApp share plus a small copy-link button. No dialog.
 */
import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

export function SharePaymentButtons({
  planLabel,
  priceLabel,
  url,
}: {
  /** e.g. "Annual" or "Lite" — used in the prewritten message. */
  planLabel: string;
  /** e.g. "₹2,988" or "₹349/month". */
  priceLabel: string;
  /** Absolute payment page URL that gets shared and copied. */
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const message = `I'd like to join Ojusvi. It's ${priceLabel} for the ${planLabel} plan. Could you help me pay? You can complete the payment here: ${url}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mt-4">
      <p className="text-[16px] text-ink/70">Would you like a family member to pay?</p>
      <div className="mt-3 flex items-center gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 text-[17px] font-medium text-[#06331b] transition hover:brightness-95 active:scale-[0.99]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Share via WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy payment link"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-forest/25 text-forest transition hover:bg-parchment-deep"
        >
          {copied ? (
            <Check className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Copy className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-6 text-[15px] text-ink/65">
        {copied ? "Copied" : ""}
      </p>
    </div>
  );
}
