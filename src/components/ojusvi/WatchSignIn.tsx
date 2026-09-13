/**
 * Sign-in-only OTP card for existing members (used on /watch). It reuses the
 * same sendOtp / verifyOtp server functions and the same carried-login marker
 * as the checkout pages, but asks for nothing except the mobile number — an
 * existing member should not have to re-enter their name to log in.
 */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, X } from "lucide-react";

import { sendOtp, verifyOtp } from "@/lib/otp.functions";
import { supabase } from "@/integrations/supabase/client";
import { markLoggedIn } from "@/hooks/useCarriedLogin";
import { isValidPhone, toE164 } from "@/hooks/useOtpCheckout";

const inputClass =
  "h-14 w-full rounded-2xl border border-forest/25 bg-parchment px-5 text-[18px] text-ink placeholder:text-ink/50 outline-none transition focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/50";

export function WatchSignIn() {
  const sendOtpFn = useServerFn(sendOtp);
  const verifyOtpFn = useServerFn(verifyOtp);

  const [cc, setCc] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [resendIn]);

  async function handleSend() {
    setResult(null);
    if (!isValidPhone(cc, phone)) {
      setResult({ type: "error", message: "Please enter a valid mobile number." });
      return;
    }
    setSending(true);
    try {
      await sendOtpFn({ data: { phone: toE164(cc, phone) } });
      setSent(true);
      setOtp("");
      setResendIn(45);
    } catch (e) {
      setResult({
        type: "error",
        message: e instanceof Error ? e.message : "Could not send the code. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    setResult(null);
    if (!/^\d{4}$/.test(otp)) {
      setResult({ type: "error", message: "Please enter the 4-digit code." });
      return;
    }
    setVerifying(true);
    try {
      const res = await verifyOtpFn({ data: { phone: toE164(cc, phone), otp } });
      if (!res.success || !res.access_token || !res.refresh_token) {
        setResult({ type: "error", message: res.message || "That code did not work." });
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      });
      if (error) throw new Error(error.message);
      markLoggedIn();
      setResult({ type: "success", message: "Signed in — loading your class…" });
      window.location.reload();
    } catch (e) {
      setResult({
        type: "error",
        message: e instanceof Error ? e.message : "That code did not work. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section
      id="sign-in"
      className="w-full max-w-md rounded-3xl border-2 border-forest/30 bg-parchment-deep/50 p-6 text-left"
    >
      <h2 className="font-serif text-[24px] text-forest">Already a member? Sign in</h2>
      <p className="mt-2 text-[17px] text-ink/85">
        Enter your mobile number and we'll send a 4-digit code.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="signInPhone" className="block pb-2 text-[17px] text-forest">
            Mobile number
          </label>
          <div className="flex items-center gap-3">
            <input
              id="signInCc"
              aria-label="Country code"
              inputMode="tel"
              value={cc}
              onChange={(e) => setCc(`+${e.target.value.replace(/\D/g, "").slice(0, 4)}`)}
              className="h-14 w-24 shrink-0 rounded-2xl border border-forest/25 bg-parchment px-4 text-[18px] text-ink outline-none focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/50"
              disabled={sent}
            />
            <input
              id="signInPhone"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 14))}
              className={inputClass}
              placeholder="Mobile number"
              disabled={sent}
            />
          </div>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="signInOtp" className="block pb-2 text-[17px] text-forest">
                Enter the 4-digit code
              </label>
              <input
                id="signInOtp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={`${inputClass} tracking-[0.4em]`}
                placeholder="••••"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-forest px-6 text-[18px] font-medium text-parchment transition hover:bg-forest-deep disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
              >
                {verifying && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                Sign in
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={resendIn > 0 || sending}
                className="h-14 rounded-full border border-forest/30 px-6 text-[17px] text-forest transition hover:bg-parchment-deep disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-forest px-6 text-[18px] font-medium text-parchment transition hover:bg-forest-deep disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
          >
            {sending && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            Send code
          </button>
        )}

        {result && (
          <p
            role="status"
            aria-live="polite"
            className={`flex items-center gap-2 text-[16px] ${
              result.type === "success" ? "text-forest" : "text-terracotta"
            }`}
          >
            {result.type === "success" ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {result.message}
          </p>
        )}
      </div>
    </section>
  );
}
