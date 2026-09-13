/**
 * Manage Membership — account page (noindex). Verifies the mobile number with
 * the shared OTP checkout hook (a carried login skips straight past it), then
 * shows the current plan, order history and the plan-switch actions.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Loader2, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { AccountBadge } from "@/components/ojusvi/AccountBadge";
import { CheckoutHeader } from "@/components/ojusvi/SubscriptionCheckout";
import { toE164, useOtpCheckout } from "@/hooks/useOtpCheckout";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Manage Membership — Ojusvi" },
      {
        name: "description",
        content:
          "View your Ojusvi membership, payment history and switch between the Lite, Monthly and Annual plans.",
      },
      { property: "og:title", content: "Manage Membership — Ojusvi" },
      { property: "og:description", content: "View your Ojusvi membership and switch plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ManagePage,
});

const inputClass =
  "h-14 w-full rounded-2xl border border-forest/20 bg-parchment px-5 text-[17px] text-ink placeholder:text-ink/40 outline-none transition focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/40";
const ccClass =
  "h-14 w-24 shrink-0 rounded-2xl border border-forest/20 bg-parchment px-4 text-[17px] text-ink outline-none transition focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/40";
const primaryBtn =
  "inline-flex h-14 items-center justify-center gap-3 rounded-full bg-forest px-7 text-[17px] font-medium text-parchment transition hover:bg-forest-deep disabled:opacity-60";
const secondaryBtn =
  "inline-flex h-14 items-center justify-center gap-3 rounded-full border border-forest/25 px-7 text-[17px] text-forest transition hover:bg-parchment-deep disabled:opacity-60";

type Membership = {
  tier: string | null;
  plan: string | null;
  status: string | null;
  expires_at: string | null;
  is_active_now: boolean | null;
};

type SubscriptionRow = {
  plan: string | null;
  status: string;
  razorpay_subscription_id: string | null;
  current_period_end: string | null;
  current_end: string | null;
};

type PaymentRow = {
  id: string;
  plan: string | null;
  amount: number | null;
  status: string;
  razorpay_order_id: string | null;
  razorpay_subscription_id: string | null;
  created_at: string;
};

function formatIst(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function planLabel(plan: string | null): string {
  switch (plan) {
    case "99":
      return "Lite ₹99/month";
    case "349":
      return "Monthly ₹349/month";
    case "349_monthly":
    case "monthly":
      return "Monthly";
    case "annual":
      return "Annual";
    default:
      return plan ? plan : "Membership";
  }
}

function tierLabel(tier: string | null): string {
  if (tier === "lite") return "Lite";
  if (tier === "full") return "Full";
  return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "—";
}

function isSuccess(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("captur") || s.includes("paid") || s.includes("success") || s.includes("active");
}

function paymentLine(row: PaymentRow): string {
  const label = planLabel(row.plan);
  const date = formatIst(row.created_at);
  const amount = row.amount != null ? `₹${(row.amount / 100).toLocaleString("en-IN")}` : "—";
  if (row.razorpay_subscription_id && !row.razorpay_order_id) {
    return isSuccess(row.status)
      ? `${label} renewal — ${amount} — ${date}`
      : `${label} renewal failed — ${date}`;
  }
  return `${label} — ${amount} — ${date}`;
}

function ManagePage() {
  const checkout = useOtpCheckout("annual");
  const {
    payerName,
    setPayerName,
    phone,
    setPhone,
    payerCc,
    setPayerCc,
    otp,
    setOtp,
    otpSent,
    sendingOtp,
    verifyingOtp,
    verified,
    otpResult,
    setOtpResult,
    resendIn,
    fieldErrors,
    requiredFilled,
    handleSendOtp,
    handleVerifyOtp,
    resetVerification,
    signOutCheckout,
  } = checkout;

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterText, setFilterText] = useState("");

  const [switching, setSwitching] = useState(false);
  const [switchMessage, setSwitchMessage] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Please verify your mobile number.");

      const [m, s, p] = await Promise.all([
        supabase
          .from("user_membership_status")
          .select("tier, plan, status, expires_at, is_active_now")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("plan, status, razorpay_subscription_id, current_period_end, current_end")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("payments")
          .select("id, plan, amount, status, razorpay_order_id, razorpay_subscription_id, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      setMembership((m.data as Membership | null) ?? null);
      setSubscription((s.data as SubscriptionRow | null) ?? null);
      setPayments(((p.data as PaymentRow[] | null) ?? []) as PaymentRow[]);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load your membership.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (verified) void load();
  }, [verified, load]);

  const visiblePayments = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    const rows = payments.filter((r) => (q ? paymentLine(r).toLowerCase().includes(q) : true));
    const sorted = [...rows].sort((a, b) => {
      const av = sortKey === "amount" ? (a.amount ?? 0) : new Date(a.created_at).getTime();
      const bv = sortKey === "amount" ? (b.amount ?? 0) : new Date(b.created_at).getTime();
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [payments, filterText, sortKey, sortDir]);

  function toggleSort(key: "date" | "amount") {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const subscriptionId = subscription?.razorpay_subscription_id ?? null;
  const currentRecurringPlan =
    subscriptionId && (subscription?.plan === "99" || subscription?.plan === "349")
      ? (subscription.plan as "99" | "349")
      : null;
  const isActive = membership?.is_active_now === true;
  const annualEndIso = subscription?.current_period_end ?? subscription?.current_end ?? membership?.expires_at ?? null;
  const annualEndUnix = annualEndIso ? Math.floor(new Date(annualEndIso).getTime() / 1000) : null;

  async function handleSwitch(toPlan: "99" | "349") {
    setSwitching(true);
    setSwitchMessage(null);
    setSwitchError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please verify your mobile number again.");
      const res = await fetch("/api/switch-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toPlan }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        status?: string;
        redirectTo?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(body.error || body.message || "Could not switch your plan.");
      if (body.status === "checkout_required" && body.redirectTo) {
        window.location.href = body.redirectTo;
        return;
      }
      setSwitchMessage("Your plan is updating — you'll see the change reflected shortly.");
      void load();
    } catch (e) {
      setSwitchError(e instanceof Error ? e.message : "Could not switch your plan.");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment text-ink text-[17px]">
      <CheckoutHeader />
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-10">
        <h1 className="font-serif italic text-forest text-[34px] md:text-[44px] leading-tight">
          Manage your membership.
        </h1>
        <p className="mt-2 text-ink/70">
          See your plan, your payments, and change plans whenever you like.
        </p>

        {verified && !otpSent && (
          <AccountBadge
            cc={payerCc}
            phone={phone}
            label="Signed in as"
            onSignOut={() => void signOutCheckout()}
            className="mt-3"
          />
        )}

        {!verified ? (
          <section className="mt-8 space-y-5 rounded-3xl border border-forest/12 bg-parchment-deep/40 p-6">
            <div>
              <label htmlFor="payerName" className="block pb-2 text-[16px] text-forest">
                Name
              </label>
              <input
                id="payerName"
                value={payerName}
                onChange={(e) => {
                  setPayerName(e.target.value);
                  resetVerification();
                }}
                className={inputClass}
                placeholder="Your name"
                autoComplete="name"
                maxLength={80}
              />
              {fieldErrors.payerName && (
                <p role="alert" className="mt-2 text-[15px] text-terracotta">
                  {fieldErrors.payerName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block pb-2 text-[16px] text-forest">
                Mobile number
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="payerCc"
                  aria-label="Country code"
                  inputMode="tel"
                  value={payerCc}
                  onChange={(e) => {
                    setPayerCc(`+${e.target.value.replace(/\D/g, "").slice(0, 4)}`);
                    resetVerification();
                  }}
                  className={ccClass}
                />
                <input
                  id="phone"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 14));
                    resetVerification();
                  }}
                  className={inputClass}
                  placeholder="Mobile number"
                  autoComplete="tel"
                />
              </div>
              {fieldErrors.phone && (
                <p role="alert" className="mt-2 text-[15px] text-terracotta">
                  {fieldErrors.phone}
                </p>
              )}
              <p className="mt-2 text-[15px] text-ink/60">
                We'll send a 4-digit code to {toE164(payerCc, phone || "…")}.
              </p>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!requiredFilled || sendingOtp}
                className={`${primaryBtn} w-full`}
              >
                {sendingOtp && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                Send OTP
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block pb-2 text-[16px] text-forest">
                    Enter the 4-digit code
                  </label>
                  <input
                    id="otp"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 4));
                      if (otpResult) setOtpResult(null);
                    }}
                    className={`${inputClass} tracking-[0.4em]`}
                    maxLength={4}
                    placeholder="••••"
                    autoComplete="one-time-code"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className={`${primaryBtn} flex-1`}
                  >
                    {verifyingOtp && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendIn > 0 || sendingOtp}
                    className={secondaryBtn}
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            {otpResult && (
              <p
                role="status"
                aria-live="polite"
                className={`flex items-center gap-2 text-[15px] ${
                  otpResult.type === "success" ? "text-forest" : "text-terracotta"
                }`}
              >
                {otpResult.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {otpResult.message}
              </p>
            )}
          </section>
        ) : (
          <>
            {/* Current plan */}
            <section className="mt-8 rounded-3xl border border-forest/12 bg-parchment-deep/40 p-6">
              <h2 className="text-[22px] font-medium text-forest">Your plan</h2>
              {loading ? (
                <p className="mt-3 text-ink/60">Loading…</p>
              ) : loadError ? (
                <p className="mt-3 text-terracotta">{loadError}</p>
              ) : isActive ? (
                <div className="mt-3 space-y-1 text-ink/80">
                  <p className="text-[19px] text-forest">
                    {tierLabel(membership?.tier ?? null)} membership — active
                  </p>
                  <p>{planLabel(membership?.plan ?? subscription?.plan ?? null)}</p>
                  {membership?.expires_at ? (
                    <p className="text-ink/60">
                      {currentRecurringPlan ? "Renews on " : "Valid until "}
                      {formatIst(membership.expires_at)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-ink/80">No active membership.</p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/subscribe" className={primaryBtn}>
                      Subscribe Monthly ₹349
                    </Link>
                    <Link to="/pay" className={secondaryBtn}>
                      Subscribe Annual ₹2,988
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Plan actions */}
            {isActive && (
              <section className="mt-6 rounded-3xl border border-forest/12 bg-parchment-deep/40 p-6">
                <h2 className="text-[22px] font-medium text-forest">Change your plan</h2>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {currentRecurringPlan ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleSwitch(currentRecurringPlan === "99" ? "349" : "99")}
                        disabled={switching}
                        className={primaryBtn}
                      >
                        {switching && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                        {currentRecurringPlan === "99" ? "Switch to Monthly ₹349" : "Switch to Lite ₹99"}
                      </button>
                      <a
                        href={`/pay${subscriptionId ? `?supersedes=${encodeURIComponent(subscriptionId)}` : ""}`}
                        className={secondaryBtn}
                      >
                        Switch to Annual ₹2,988
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href={`/subscribe${annualEndUnix ? `?startAt=${annualEndUnix}` : ""}`}
                        className={primaryBtn}
                      >
                        Switch to Monthly ₹349
                      </a>
                      <a
                        href={`/offer99${annualEndUnix ? `?startAt=${annualEndUnix}` : ""}`}
                        className={secondaryBtn}
                      >
                        Switch to Lite ₹99
                      </a>
                    </>
                  )}
                </div>

                {switchMessage && (
                  <p role="status" aria-live="polite" className="mt-4 text-[16px] text-forest">
                    {switchMessage}
                  </p>
                )}
                {switchError && (
                  <p role="alert" className="mt-4 text-[16px] text-terracotta">
                    {switchError}
                  </p>
                )}

                <p className="mt-5 text-[15px] text-ink/55">
                  Want to cancel your membership entirely? WhatsApp us at{" "}
                  <a
                    href="https://wa.me/919958905337?text=Hello%20%F0%9F%91%8B%F0%9F%91%8B"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 text-forest"
                  >
                    +91 99589 05337
                  </a>{" "}
                  or email{" "}
                  <a href="mailto:hello@ojusvi.app" className="underline underline-offset-4 text-forest">
                    hello@ojusvi.app
                  </a>
                  .
                </p>
              </section>
            )}

            {/* Order history */}
            <section className="mt-6 rounded-3xl border border-forest/12 bg-parchment-deep/40 p-6">
              <h2 className="text-[22px] font-medium text-forest">Your payments</h2>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  aria-label="Filter payments"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className={`${inputClass} sm:max-w-xs`}
                  placeholder="Filter (plan, date, amount)"
                />
                <button type="button" onClick={() => toggleSort("date")} className={secondaryBtn}>
                  Date {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
                <button type="button" onClick={() => toggleSort("amount")} className={secondaryBtn}>
                  Amount {sortKey === "amount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </div>

              {loading ? (
                <p className="mt-4 text-ink/60">Loading…</p>
              ) : visiblePayments.length === 0 ? (
                <p className="mt-4 text-ink/70">No payments yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-forest/10">
                  {visiblePayments.map((row) => (
                    <li key={row.id} className="py-3 text-[16px] text-ink/85">
                      {paymentLine(row)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
