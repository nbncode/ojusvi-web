/**
 * Small, unobtrusive "who is signed in" line, shown once a mobile number has
 * been verified (or carried over from an earlier login). Generic on purpose —
 * checkout pages and the watch page both use it.
 */

export function maskPhone(cc: string, number: string): string {
  const code = (cc ?? "").replace(/\D/g, "");
  const digits = (number ?? "").replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const prefix = code ? `+${code} ` : "";
  if (!last4) return `${prefix}••••`.trim();
  return `${prefix}••••${last4}`;
}

type Props = {
  cc: string;
  phone: string;
  onSignOut: () => void;
  /** Leading verb, e.g. "Watching as" (default) or "Paying as". */
  label?: string;
  className?: string;
};

export function AccountBadge({ cc, phone, onSignOut, label = "Watching as", className = "" }: Props) {
  return (
    <p className={`text-[16px] text-ink/85 ${className}`}>
      {label} {maskPhone(cc, phone)} —{" "}
      <button
        type="button"
        onClick={onSignOut}
        className="min-h-[44px] px-1 underline underline-offset-4 text-forest hover:text-forest/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
      >
        not you?
      </button>
    </p>
  );
}
