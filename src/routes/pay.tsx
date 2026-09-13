import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, Lock, ShieldCheck, CalendarX2, GraduationCap, Headphones, Loader2, X } from "lucide-react";

import { createSubscriptionOrder } from "@/lib/subscription.functions";
import { validateCoupon } from "@/lib/coupons.functions";
import { SharePaymentButtons } from "@/components/ojusvi/SharePaymentButtons";
import { useOtpCheckout, toE164, loadRazorpay } from "@/hooks/useOtpCheckout";
import { AccountBadge } from "@/components/ojusvi/AccountBadge";

import { FULL_ACCESS_INCLUDED } from "@/lib/subscription-plans";

import logoAsset from "@/assets/ojusvi-logo-round-256.webp";

const logoRound = logoAsset;

export const Route = createFileRoute("/pay")({
  head: () => ({
    meta: [
      { title: "Secure checkout — Ojusvi Annual membership" },
      {
        name: "description",
        content:
          "Complete your Ojusvi Annual membership. ₹249/month billed once for the year. Pay securely by UPI, card or net banking.",
      },
      { property: "og:title", content: "Secure checkout — Ojusvi Annual membership" },
      { property: "og:description", content: "Join Ojusvi — live guided sessions, in your language, at your pace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PayPage,
});

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (response: unknown) => void) => void;
    };
  }
}

type PlanKey = "annual";
type Audience = "self" | "parent";
type Method = "upi" | "card" | "netbanking";

const PLANS = {
  annual: {
    label: "Annual",
    headline: "₹249/month",
    headlineSub: "· billed once for the year",
    sub: "One payment of ₹2,988 today. Renews yearly — cancel before renewal.",
    badge: "Best value · Save ₹1,200",
    totalLabel: "₹2,988",
    totalNote: "Total due today",
    amount: 2988,
    cta: "Pay ₹2,988 securely",
  },
} as const;

const TRUST = [
  { icon: ShieldCheck, label: "Bank-grade secure" },
  { icon: CalendarX2, label: "Cancel anytime" },
  { icon: GraduationCap, label: "Certified instructors" },
  { icon: Headphones, label: "Human support" },
];

const inputClass =
  "h-14 w-full rounded-2xl border border-forest/20 bg-parchment px-5 text-[17px] text-ink placeholder:text-ink/40 outline-none transition focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/40";

const ccClass =
  "h-14 w-24 shrink-0 rounded-2xl border border-forest/20 bg-parchment px-4 text-[17px] text-ink outline-none transition focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/40";


function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function PayPage() {
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createSubscriptionOrder);
  // Optional ?supersedes=<razorpay_subscription_id> — the recurring plan this
  // annual purchase replaces. The order webhook cancels it once paid.
  const search = useSearch({ strict: false }) as { supersedes?: string };
  const supersedesSubscriptionId =
    typeof search.supersedes === "string" && search.supersedes.trim() ? search.supersedes.trim() : undefined;
  const validateCouponFn = useServerFn(validateCoupon);

  const plan: PlanKey = "annual";
  const {
    audience,
    setAudience,
    payerName,
    phone,
    payerCc,
    setPayerCc,
    memberName,
    setMemberName,
    memberPhone,
    setMemberPhone,
    memberCc,
    setMemberCc,
    setPayerName,
    setPhone,
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
    email,
    setEmail,
    busy,
    setBusy,
    error,
    setError,
    resetVerification,
    signOutCheckout,

    requiredFilled,
    canPay,
    handleSendOtp,
    handleVerifyOtp,
    saveProfile,
  } = useOtpCheckout("annual");
  const [method, setMethod] = useState<Method>("upi");
  const [confirming, setConfirming] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    originalAmount: number;
    discountedAmount: number;
    discount: number;
  } | null>(null);

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    if (!verified) {
      setCouponError("Please verify your mobile number first.");
      return;
    }
    setCouponBusy(true);
    setCouponError(null);
    try {
      const result = await validateCouponFn({ data: { code, plan } });
      if (result.valid) {
        setAppliedCoupon({
          code: result.code,
          originalAmount: result.originalAmount,
          discountedAmount: result.discountedAmount,
          discount: result.discount,
        });
      } else {
        setAppliedCoupon(null);
        setCouponError(result.message);
      }
    } catch {
      setAppliedCoupon(null);
      setCouponError("We couldn't check that code just now. Please try again.");
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  const active = PLANS[plan];
  const discountPercent = appliedCoupon
    ? Math.round((appliedCoupon.discount / appliedCoupon.originalAmount) * 100)
    : 0;
  const nameLabel = audience === "parent" ? "Your name (the payer)" : "Name";


  async function handlePay() {
    setError(null);
    if (!verified) {
      setError("Please verify your mobile number first.");
      return;
    }
    if (!canPay) {
      setError("Please fill in your name, mobile number and email.");
      return;
    }
    setBusy(true);
    try {
      await saveProfile();

      let order;
      try {
        order = await createOrderFn({
          data: {
            plan,
            ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
            ...(supersedesSubscriptionId ? { supersedesSubscriptionId } : {}),
          },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        // The coupon was valid at Apply but isn't any more — tell the user, never charge silently.
        if (msg.includes("COUPON_INVALID")) {
          const reason = msg.split("COUPON_INVALID:")[1]?.trim() || "That coupon is no longer valid.";
          setAppliedCoupon(null);
          setCouponError(`${reason} Your coupon was removed — you can pay the full price or try another code.`);
          setError("Your coupon could no longer be applied. Please review the price and pay again.");
          setBusy(false);
          return;
        }
        throw e;
      }

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Could not open the payment window. Please check your connection.");

      // Tracks whether checkout ended in success or an explicit failure, so the
      // dismiss handler doesn't misreport those cases.
      let settled = false;

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount_paise,
        currency: "INR",
        name: "Ojusvi",
        description: order.plan_name,
        order_id: order.order_id,
        prefill: {
          ...(payerName.trim() ? { name: payerName.trim() } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(phone.replace(/\D/g, "") ? { contact: toE164(payerCc, phone) } : {}),
        },
        theme: { color: "#153c25" },
        method: method === "upi" ? { upi: true } : undefined,
        handler: () => {
          // Payment is confirmed server-side by the Razorpay webhook — never on the client.
          settled = true;
          setBusy(false);
          setConfirming(true);
          window.setTimeout(() => navigate({ to: "/thank-you", search: { order: order.order_id } }), 2500);
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            if (!settled) {
              navigate({ to: "/payment-failed", search: { reason: "dismissed", order: order.order_id } });
            }
          },
        },
      });

      rzp.on("payment.failed", () => {
        settled = true;
        setBusy(false);
        navigate({ to: "/payment-failed", search: { reason: "failed", order: order.order_id } });
      });

      rzp.open();
    } catch (e) {
      setBusy(false);
      navigate({
        to: "/payment-failed",
        search: { reason: "order" },
      });
    }
  }

  return (
    <div className="min-h-screen bg-parchment text-ink text-[17px]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-forest/10 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="inline-flex items-center leading-none">
            <img src={logoRound} alt="Ojusvi logo" width={56} height={56} className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <span className="flex items-center gap-2 text-[15px] text-forest/80">
            <Lock className="h-4 w-4" aria-hidden="true" />
            Secure checkout
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">
        <h1 className="font-serif italic text-forest text-[34px] md:text-[44px] leading-tight">
          Complete your membership.
        </h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          A few details, one secure payment, and your Ojusvi days begin.
        </p>

        {verified && !otpSent && (
          <>
            <AccountBadge
              cc={payerCc}
              phone={phone}
              label="Paying as"
              onSignOut={() => void signOutCheckout()}
              className="mt-3"
            />
            <Link
              to="/manage"
              className="mt-1 inline-block text-[15px] text-forest underline underline-offset-4 hover:text-forest/80"
            >
              Manage your membership
            </Link>
          </>
        )}


        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
          {/* LEFT — order summary */}
          <section className="lg:sticky lg:top-24 rounded-3xl border border-forest/12 bg-parchment-deep/60 p-6 shadow-[0_18px_50px_-30px_rgba(21,60,37,0.55)]">
            <h2 className="font-serif italic text-forest text-[26px]">Your plan</h2>

            <div className="mt-6">
              <span className="inline-flex rounded-full bg-amber/15 px-4 py-1.5 text-[14px] font-medium text-amber">
                {active.badge}
              </span>
              <p className="mt-4 font-serif italic text-forest text-[34px] leading-none">
                {active.headline}
                {active.headlineSub && (
                  <span className="ml-2 font-sans not-italic text-[16px] text-ink/60">{active.headlineSub}</span>
                )}
              </p>
              <p className="mt-3 text-ink/70">{active.sub}</p>
            </div>

            <div className="mt-6 flex items-baseline justify-between rounded-2xl bg-parchment px-5 py-4 border border-forest/10">
              <span className="text-ink/70">{active.totalNote}</span>
              <span className="font-serif italic text-forest text-[28px]">
                {active.totalLabel}
                
              </span>
            </div>

            <h3 className="mt-8 font-serif italic text-forest text-[22px]">What's included</h3>
            <ul className="mt-3 space-y-3">
              {FULL_ACCESS_INCLUDED.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                  <span className="text-ink/85">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* RIGHT — details + payment */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-forest/12 bg-parchment-deep/40 p-6">
              <h2 className="font-serif italic text-forest text-[26px]">Who is this membership for?</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {(["self", "parent"] as Audience[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAudience(a);
                      resetVerification();
                    }}
                    aria-pressed={audience === a}
                    className={`h-14 rounded-full px-7 text-[17px] font-medium transition ${
                      audience === a
                        ? "bg-forest text-parchment"
                        : "border border-forest/25 text-forest hover:bg-parchment"
                    }`}
                  >
                    {a === "self" ? "For myself" : "For a parent"}
                  </button>
                ))}
              </div>

              <SharePaymentButtons
                planLabel={PLANS.annual.label}
                priceLabel={PLANS.annual.totalLabel}
                url="https://ojusvi.app/pay"
              />

              <div className="mt-6 space-y-5">
                {audience === "parent" && (
                  <div>
                    <label htmlFor="memberName" className="block pb-2 text-[16px] text-forest">
                      Member's name
                    </label>
                    <input
                      id="memberName"
                      value={memberName}
                      onChange={(e) => {
                        setMemberName(e.target.value);
                        resetVerification();
                      }}
                      className={inputClass}
                      placeholder="e.g. Sushila Devi"
                      autoComplete="off"
                      maxLength={80}
                    />
                    {fieldErrors.memberName && (
                      <p role="alert" className="mt-2 text-[15px] text-terracotta">
                        {fieldErrors.memberName}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label htmlFor="payerName" className="block pb-2 text-[16px] text-forest">
                    {nameLabel}
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
                    Payer's mobile number
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="payerCc"
                      aria-label="Payer's country code"
                      inputMode="tel"
                      value={payerCc}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setPayerCc(`+${digits}`);
                        resetVerification();
                      }}
                      className={ccClass}
                      disabled={verified}
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
                      disabled={verified}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p role="alert" className="mt-2 text-[15px] text-terracotta">
                      {fieldErrors.phone}
                    </p>
                  )}
                  <p className="mt-2 text-[15px] text-ink/60">
                    We'll send a 4-digit code here.
                  </p>
                </div>

                {audience === "parent" && (
                  <div>
                    <label htmlFor="memberPhone" className="block pb-2 text-[16px] text-forest">
                      Member's mobile number
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="memberCc"
                        aria-label="Member's country code"
                        inputMode="tel"
                        value={memberCc}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setMemberCc(`+${digits}`);
                        }}
                        className={ccClass}
                      />
                      <input
                        id="memberPhone"
                        inputMode="numeric"
                        value={memberPhone}
                        onChange={(e) => setMemberPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 14))}
                        className={inputClass}
                        placeholder="Mobile number"
                        autoComplete="off"
                      />
                    </div>
                    {fieldErrors.memberPhone && (
                      <p role="alert" className="mt-2 text-[15px] text-terracotta">
                        {fieldErrors.memberPhone}
                      </p>
                    )}
                    <p className="mt-2 text-[15px] text-ink/60">
                      This number becomes the Ojusvi account.
                    </p>
                  </div>
                )}

                {/* OTP verification of the payer's number */}
                {!verified ? (
                  <div className="rounded-2xl border border-forest/12 bg-parchment/70 p-5">
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!requiredFilled || sendingOtp}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-full border text-[17px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed border-forest/20 bg-parchment-deep text-muted-foreground enabled:border-transparent enabled:bg-forest enabled:text-parchment enabled:hover:bg-forest-deep enabled:active:scale-[0.99]"
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
                          {otpResult && (
                            <p
                              role="status"
                              aria-live="polite"
                              className={`mt-2 flex items-center gap-2 text-[15px] ${
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
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp}
                            className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-forest px-6 text-[17px] font-medium text-parchment transition hover:bg-forest-deep disabled:opacity-60"
                          >
                            {verifyingOtp && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                            Verify OTP
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={resendIn > 0 || sendingOtp}
                            className="h-14 rounded-full border border-forest/25 px-6 text-[17px] text-forest transition hover:bg-parchment-deep disabled:opacity-50"
                          >
                            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p
                    aria-live="polite"
                    className="flex items-center gap-3 rounded-2xl border border-forest/20 bg-sage/15 px-5 py-4 text-[17px] text-forest"
                  >
                    <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Mobile number verified — you're signed in. Please continue to payment.
                  </p>
                )}

                <div>
                  <label htmlFor="email" className="block pb-2 text-[16px] text-forest">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={255}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-forest/12 bg-parchment-deep/40 p-6">
              <h2 className="font-serif italic text-forest text-[26px]">Payment</h2>

              <div className="mt-4 rounded-2xl border border-forest/15 bg-parchment/70 p-5">
                  {appliedCoupon ? (
                    <div>
                      <p className="flex items-center gap-2 text-[17px] text-forest">
                        <Check className="h-5 w-5" aria-hidden="true" />
                        Coupon <strong className="font-medium">{appliedCoupon.code}</strong> applied
                      </p>
                      <p className="mt-2 text-[18px] text-ink">
                        <span className="text-ink/50 line-through">{formatInr(appliedCoupon.originalAmount)}</span>{" "}
                        <span className="font-medium text-forest">{formatInr(appliedCoupon.discountedAmount)}</span>{" "}
                        <span className="text-[15px] text-ink/60">
                          (you save {formatInr(appliedCoupon.discount)} · {discountPercent}% off)
                        </span>
                      </p>
                      <button
                        onClick={removeCoupon}
                        className="mt-2 text-[15px] text-ink/60 underline underline-offset-4 hover:text-forest"
                      >
                        Remove coupon
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="coupon" className="text-[17px] text-ink/80">
                        Have a coupon code?
                      </label>
                      <div className="mt-2 flex gap-3">
                        <input
                          id="coupon"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          className={inputClass}
                          placeholder="Enter code"
                          maxLength={40}
                          autoCapitalize="characters"
                          autoComplete="off"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponBusy || !couponInput.trim() || !verified}
                          className="h-14 shrink-0 rounded-2xl border border-forest px-6 text-[17px] font-medium text-forest transition hover:bg-forest hover:text-parchment disabled:opacity-50"
                        >
                          {couponBusy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : "Apply"}
                        </button>
                      </div>
                      {!verified && (
                        <p className="mt-2 text-[15px] text-ink/60">
                          Verify your mobile number to apply a coupon.
                        </p>
                      )}
                    </div>
                  )}
                  {couponError && (
                    <p role="alert" className="mt-3 text-[16px] text-terracotta">
                      {couponError}
                    </p>
                  )}
              </div>

              <div className="mt-4 space-y-3">
                {(
                  [
                    { key: "upi", label: "UPI", tag: "Fastest" },
                    { key: "card", label: "Credit / Debit card" },
                    { key: "netbanking", label: "Net banking" },
                  ] as { key: Method; label: string; tag?: string }[]
                ).map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMethod(m.key)}
                    aria-pressed={method === m.key}
                    className={`flex h-16 w-full items-center justify-between rounded-2xl border px-5 text-left text-[17px] transition ${
                      method === m.key
                        ? "border-forest bg-parchment text-forest ring-2 ring-forest/25"
                        : "border-forest/20 bg-parchment/60 text-ink/80 hover:border-forest/40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full border ${
                          method === m.key ? "border-forest bg-forest" : "border-forest/35"
                        }`}
                        aria-hidden="true"
                      >
                        {method === m.key && <Check className="h-4 w-4 text-parchment" />}
                      </span>
                      {m.label}
                    </span>
                    {m.tag && (
                      <span className="rounded-full bg-amber/15 px-3 py-1 text-[14px] font-medium text-amber">
                        {m.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <p role="alert" className="mt-5 rounded-2xl bg-terracotta/10 px-4 py-3 text-[16px] text-terracotta">
                  {error}
                </p>
              )}


              <p className="mt-6 text-center text-[17px] text-ink/80">
                Ojusvi Annual —{" "}
                {appliedCoupon ? (
                  <>
                    <span className="text-ink/50 line-through">{formatInr(appliedCoupon.originalAmount)}</span>{" "}
                    <span className="font-medium text-forest">{formatInr(appliedCoupon.discountedAmount)}</span>{" "}
                    <span className="text-[15px] text-ink/60">({discountPercent}% off)</span>
                  </>
                ) : (
                  <span className="font-medium text-forest">{active.totalLabel}</span>
                )}
              </p>

              <button
                onClick={handlePay}
                disabled={busy || confirming || !canPay}
                className="mt-3 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-forest text-parchment text-[19px] font-medium tracking-wide transition hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                {appliedCoupon
                  ? `Pay ${formatInr(appliedCoupon.discountedAmount)} securely`
                  : active.cta}
              </button>
              {confirming && (
                <p role="status" className="mt-4 flex items-center justify-center gap-2 text-[17px] text-forest">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Confirming your payment…
                </p>
              )}
              <p className="mt-3 text-center text-[16px] text-ink/65">
                We'll email your receipt and app link the moment payment is confirmed.
              </p>
            </section>

            <p className="text-center text-ink/70">
              Need help?{" "}
              <a
                href="https://wa.me/919958905337?text=Hello%20%F0%9F%91%8B%F0%9F%91%8B"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-forest"
              >
                WhatsApp
              </a>{" "}
              us
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-forest/12 bg-parchment-deep/50 px-5 py-4"
            >
              <Icon className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
              <span className="text-[16px] text-ink/80">{label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3 text-[15px] leading-relaxed text-ink/60">
          <p>
            Prices include 18% GST. The annual plan is billed once for all 12 months upfront and renews yearly; cancel
            before renewal. Payments already made are non-refundable once the membership period has begun.
          </p>

          <p>
            <Link to="/terms" className="underline underline-offset-4 hover:text-forest">
              Terms
            </Link>{" "}
            ·{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-forest">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link to="/refund" className="underline underline-offset-4 hover:text-forest">
              Refunds &amp; cancellation
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
