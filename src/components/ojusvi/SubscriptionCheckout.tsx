/**
 * Shared recurring-subscription checkout used by /subscribe (₹349/month) and
 * /offer99 (₹99/month). Mirrors pay.tsx's OTP + Razorpay patterns and visual
 * style, but calls the plain HTTP routes /api/create-subscription and
 * /api/verify-subscription, which authenticate via an explicit Authorization
 * Bearer header (not cookie middleware like the order-flow server function).
 */
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Lock, ShieldCheck, CalendarX2, GraduationCap, Headphones, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SharePaymentButtons } from "@/components/ojusvi/SharePaymentButtons";
import { loadRazorpay, toE164, useOtpCheckout } from "@/hooks/useOtpCheckout";
import { FULL_ACCESS_INCLUDED } from "@/lib/subscription-plans";

import logoAsset from "@/assets/ojusvi-logo-round-256.webp";

const inputClass =
  "h-14 w-full rounded-2xl border border-forest/20 bg-parchment px-5 text-[17px] text-ink placeholder:text-ink/40 outline-none transition focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/40";

const ccClass =
  "h-14 w-24 shrink-0 rounded-2xl border border-forest/20 bg-parchment px-4 text-[17px] text-ink outline-none transition focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/40";


declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (response: unknown) => void) => void;
    };
  }
}




const INCLUDED_99 = [
  "Live yoga sessions",
  "Tambola",
  "Games",
  "Panchang",
  "AI medical record keeper",
  "Medicine reminders",
];

const EXCLUDED_99 = ["Bhajan clubbing", "Satsang", "Other live events (non-yoga)"];

const TRUST = [
  { icon: ShieldCheck, label: "Bank-grade secure" },
  { icon: CalendarX2, label: "Cancel anytime" },
  { icon: GraduationCap, label: "Certified instructors" },
  { icon: Headphones, label: "Human support" },
];

export type SubscriptionPlanParam = "349" | "99";

const PLAN_COPY: Record<
  SubscriptionPlanParam,
  { headline: string; sub: string; description: string; cta: string }
> = {
  "349": {
    headline: "₹349/month",
    sub: "Billed every month. Recurring — cancel anytime.",
    description: "Ojusvi Membership — ₹349/month",
    cta: "Start membership — ₹349/month",
  },
  "99": {
    headline: "₹99/month",
    sub: "Special offer. Billed every month — cancel anytime.",
    description: "Ojusvi Membership — ₹99/month",
    cta: "Start membership — ₹99/month",
  },
};

export function SubscriptionCheckout({ plan }: { plan: SubscriptionPlanParam }) {
  const navigate = useNavigate();
  const copy = PLAN_COPY[plan];
  const failedFrom = plan === "349" ? "/subscribe" : "/offer99";


  const {
    audience,
    setAudience,
    payerName,
    setPayerName,
    phone,
    setPhone,
    payerCc,
    setPayerCc,
    memberName,
    setMemberName,
    memberPhone,
    setMemberPhone,
    memberCc,
    setMemberCc,
    otp,
    setOtp,
    otpSent,
    sendingOtp,
    verifyingOtp,
    verified,
    setVerified,
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
    requiredFilled,
    canPay,
    handleSendOtp,
    handleVerifyOtp,
    saveProfile,
  } = useOtpCheckout(plan);


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

      // These plain HTTP routes read auth from an Authorization header, unlike
      // the order-flow server function which reads cookies via middleware.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setBusy(false);
        setVerified(false);
        setError("Your sign-in expired. Please verify your mobile number again.");
        return;
      }
      const authHeaders = {
        "content-type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      const createRes = await fetch("/api/create-subscription", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ plan }),
      });
      if (!createRes.ok) {
        const body = (await createRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not start the subscription. Please try again.");
      }
      const { subscription_id, key_id } = (await createRes.json()) as {
        subscription_id: string;
        key_id: string;
      };

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay)
        throw new Error("Could not open the payment window. Please check your connection.");

      const rzp = new window.Razorpay({
        key: key_id,
        subscription_id,
        name: "Ojusvi",
        description: copy.description,
        prefill: {
          ...(payerName.trim() ? { name: payerName.trim() } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(phone.replace(/\D/g, "") ? { contact: toE164(payerCc, phone) } : {}),
        },
        theme: { color: "#153c25" },
        handler: async (response: Record<string, unknown>) => {
          try {
            const verifyRes = await fetch("/api/verify-subscription", {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({ ...response, plan }),
            });
            if (!verifyRes.ok) throw new Error("verification failed");
            navigate({ to: "/subscribed", search: { plan } });
} catch {
            setBusy(false);
            navigate({ to: "/payment-failed", search: { reason: "failed", from: failedFrom } });
          }
        },
        modal: {
          ondismiss: () => {
            // User closed checkout — just re-enable the pay button, stay put.
            setBusy(false);
          },
        },
      });

rzp.on("payment.failed", () => {
        setBusy(false);
        navigate({ to: "/payment-failed", search: { reason: "failed", from: failedFrom } });
      });

      rzp.open();
    } catch (e) {
      setBusy(false);
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(msg);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-forest/12 bg-parchment-deep/40 p-6">
        <div className="space-y-5">
          <fieldset>
            <legend className="block pb-2 text-[16px] text-forest">Who is this membership for?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "self", label: "For myself" },
                  { value: "parent", label: "For a parent" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={audience === opt.value}
                  onClick={() => {
                    setAudience(opt.value);
                    resetVerification();
                  }}
                  className={`flex h-14 items-center justify-center rounded-full border text-[17px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
                    audience === opt.value
                      ? "border-transparent bg-forest text-parchment"
                      : "border-forest/20 bg-parchment-deep text-muted-foreground hover:border-forest/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <SharePaymentButtons
            planLabel={plan === "349" ? "Monthly" : "Lite"}
            priceLabel={copy.headline}
            url={plan === "349" ? "https://ojusvi.app/subscribe" : "https://ojusvi.app/offer99"}
          />

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
            <p className="mt-2 text-[15px] text-ink/60">We'll send a 4-digit code here.</p>
          </div>

          {audience === "parent" && (
            <>
              <div>
                <label htmlFor="memberName" className="block pb-2 text-[16px] text-forest">
                  Parent's name
                </label>
                <input
                  id="memberName"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className={inputClass}
                  placeholder="Your parent's name"
                  autoComplete="off"

                  maxLength={80}
                />
                {fieldErrors.memberName && (
                  <p role="alert" className="mt-2 text-[15px] text-terracotta">
                    {fieldErrors.memberName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="memberPhone" className="block pb-2 text-[16px] text-forest">
                  Parent's mobile number
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="memberCc"
                    aria-label="Parent's country code"
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
                    placeholder="Parent's mobile number"
                    autoComplete="off"
                  />
                </div>
                {fieldErrors.memberPhone && (
                  <p role="alert" className="mt-2 text-[15px] text-terracotta">
                    {fieldErrors.memberPhone}
                  </p>
                )}
                <p className="mt-2 text-[15px] text-ink/60">
                  The membership will be activated on this number.
                </p>
              </div>
            </>
          )}

          {/* OTP verification */}
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
        <p className="mt-2 text-ink/70">
          Secure recurring payment via Razorpay — UPI, card or net banking. Cancel anytime.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-2xl border border-terracotta/30 bg-terracotta/10 px-5 py-3 text-[15px] text-terracotta">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={!canPay || busy}
          className="mt-5 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-forest text-[19px] font-medium text-parchment tracking-wide transition hover:bg-forest-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
          {busy ? "Opening secure payment…" : copy.cta}
        </button>

        <ul className="mt-6 grid grid-cols-2 gap-3">
          {TRUST.map((t) => (
            <li key={t.label} className="flex items-center gap-2 text-[14px] text-ink/70">
              <t.icon className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
              {t.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function SubscriptionPlanSummary({ plan }: { plan: SubscriptionPlanParam }) {
  const copy = PLAN_COPY[plan];
  const included = plan === "99" ? INCLUDED_99 : FULL_ACCESS_INCLUDED;
  return (
    <section className="lg:sticky lg:top-24 rounded-3xl border border-forest/12 bg-parchment-deep/60 p-6 shadow-[0_18px_50px_-30px_rgba(21,60,37,0.55)]">
      <h2 className="font-serif italic text-forest text-[26px]">Your plan</h2>

      <div className="mt-6">
        <span className="inline-flex rounded-full bg-amber/15 px-4 py-1.5 text-[14px] font-medium text-amber">
          {plan === "99" ? "Lite · limited access" : "Recurring · monthly"}
        </span>
        <p className="mt-4 font-serif italic text-forest text-[34px] leading-none">{copy.headline}</p>
        <p className="mt-3 text-ink/70">{copy.sub}</p>
      </div>

      <h3 className="mt-8 font-serif italic text-forest text-[22px]">What's included</h3>
      <ul className="mt-3 space-y-3">
        {included.map((item) => (
          <li key={item} className="flex gap-3">
            <Check className="mt-1 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
            <span className="text-ink/85">{item}</span>
          </li>
        ))}
      </ul>

      {plan === "99" && (
        <>
          <h3 className="mt-8 font-serif italic text-forest text-[22px]">Not included</h3>
          <ul className="mt-3 space-y-3">
            {EXCLUDED_99.map((item) => (
              <li key={item} className="flex gap-3 text-ink/50">
                <X className="mt-1 h-5 w-5 shrink-0 text-ink/40" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-forest/10 bg-parchment/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="inline-flex items-center leading-none">
          <LogoImg />
        </Link>
        <span className="flex items-center gap-2 text-[15px] text-forest/80">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Secure checkout
        </span>
      </div>
    </header>
  );
}

function LogoImg() {
  return (
    <img
      src={logoAsset}
      alt="Ojusvi logo"
      width={56}
      height={56}
      className="h-10 md:h-12 w-auto object-contain"
    />
  );
}
