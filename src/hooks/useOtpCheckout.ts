/**
 * Shared identity-capture + OTP-verification + profile-save logic for the
 * checkout pages (/pay, /subscribe, /offer99). Payment submission stays with
 * each caller — the order flow and the subscription flow genuinely differ.
 */
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { sendOtp, verifyOtp } from "@/lib/otp.functions";
import { supabase } from "@/integrations/supabase/client";
import { markLoggedIn, useCarriedLogin } from "@/hooks/useCarriedLogin";

export type CheckoutPlan = "annual" | "monthly" | "349" | "99";
export type Audience = "self" | "parent";

/** Combine an editable ISD code and a number into E.164 (single leading +). */
export function toE164(cc: string, number: string): string {
  const code = cc.replace(/\D/g, "");
  const rest = number.replace(/\D/g, "");
  return `+${code}${rest}`;
}

export function isValidPhone(cc: string, number: string): boolean {
  const code = cc.replace(/\D/g, "");
  const rest = number.replace(/\D/g, "");
  if (code === "91") return /^[6-9]\d{9}$/.test(rest);
  return code.length >= 1 && code.length <= 4 && rest.length >= 6 && rest.length <= 14;
}

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function useOtpCheckout(plan: CheckoutPlan) {
  const sendOtpFn = useServerFn(sendOtp);
  const verifyOtpFn = useServerFn(verifyOtp);

  const isSubscriptionPlan = plan === "349" || plan === "99";

  const [audience, setAudience] = useState<Audience>("self");
  const [payerName, setPayerName] = useState("");
  const [phone, setPhone] = useState("");
  const [payerCc, setPayerCc] = useState("+91");
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberCc, setMemberCc] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpResult, setOtpResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carried = useCarriedLogin();

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [resendIn]);

  // A login carried over from another checkout page in this tab: prefill and
  // skip straight to payment, exactly as a fresh OTP verification would.
  useEffect(() => {
    if (carried.status !== "logged-in") return;
    setAudience(carried.audience);
    setPayerName(carried.payerName);
    setPayerCc(carried.payerCc);
    setPhone(carried.phone);
    setMemberName(carried.memberName);
    setMemberCc(carried.memberCc);
    setMemberPhone(carried.memberPhone);
    setEmail(carried.email);
    setVerified(true);
  }, [carried]);

  /** Editing details after verification invalidates the verified state. */
  function resetVerification() {
    setOtpSent(false);
    setVerified(false);
    setOtp("");
  }

  const requiredFilled = useMemo(() => {
    const base = payerName.trim().length >= 2 && isValidPhone(payerCc, phone);
    if (audience === "self") return base;
    return base && memberName.trim().length >= 2 && isValidPhone(memberCc, memberPhone);
  }, [payerName, payerCc, phone, audience, memberName, memberCc, memberPhone]);

  const canPay = verified && requiredFilled && /.+@.+\..+/.test(email);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (payerName.trim().length < 2) errs.payerName = "Please enter your name.";
    if (!isValidPhone(payerCc, phone))
      errs.phone =
        payerCc.replace(/\D/g, "") === "91"
          ? "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9."
          : "Please enter a valid mobile number.";
    if (audience === "parent") {
      if (memberName.trim().length < 2)
        errs.memberName = isSubscriptionPlan
          ? "Please enter your parent's name."
          : "Please enter the member's name.";
      if (!isValidPhone(memberCc, memberPhone))
        errs.memberPhone =
          memberCc.replace(/\D/g, "") === "91"
            ? "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9."
            : "Please enter a valid mobile number.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSendOtp() {
    setError(null);
    setOtpResult(null);
    if (!validate()) return;
    setSendingOtp(true);
    try {
      await sendOtpFn({ data: { phone: toE164(payerCc, phone) } });
      setOtpSent(true);
      setOtp("");
      setFieldErrors((f) => ({ ...f, otp: "" }));
      setOtpResult(null);
      setResendIn(45);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send the OTP. Please try again.";
      setError(msg);
      setOtpResult({ type: "error", message: msg });
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    setOtpResult(null);
    if (!/^\d{4}$/.test(otp)) {
      const msg = "Please enter the 4-digit code.";
      setFieldErrors((f) => ({ ...f, otp: msg }));
      setOtpResult({ type: "error", message: msg });
      return;
    }
    setVerifyingOtp(true);
    setFieldErrors((f) => ({ ...f, otp: "" }));
    try {
      const result = await verifyOtpFn({ data: { phone: toE164(payerCc, phone), otp } });
      if (!result.success) {
        setOtpResult({ type: "error", message: result.message });
        setError(result.message);
        return;
      }
      if (!result.access_token || !result.refresh_token)
        throw new Error("Could not sign you in. Please try again.");

      const { data: sessionData, error: sessErr } = await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
      if (sessErr) throw new Error(sessErr.message);
      if (!sessionData.user?.id) throw new Error("Could not sign you in. Please try again.");

      setOtpResult({ type: "success", message: "Verified — mobile number confirmed." });
      setVerified(true);
      markLoggedIn();
      try {
        await saveProfile();
      } catch {
        // Non-blocking: the profile is saved again at payment time.
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "That code did not work. Please try again.";
      setError(msg);
      setOtpResult({ type: "error", message: msg });
    } finally {
      setVerifyingOtp(false);
    }
  }

  /** Saved right after OTP verification (email may be null) and again at payment time. */
  async function saveProfile() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please verify your mobile number first.");
    const trimmedEmail = email.trim();
    const row = {
      user_id: userId,
      account_type: audience,
      payer_name: payerName.trim(),
      member_name: audience === "parent" ? memberName.trim() : payerName.trim(),
      member_phone: audience === "parent" ? toE164(memberCc, memberPhone) : toE164(payerCc, phone),
      payer_phone: toE164(payerCc, phone),
      email: trimmedEmail.length > 0 ? trimmedEmail : null,
      updated_at: new Date().toISOString(),
    };
    const { error: pErr } = await supabase.from("profiles").upsert(row as never, { onConflict: "user_id" });
    if (pErr) throw new Error(pErr.message);
  }

  return {
    plan,
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
    validate,
    handleSendOtp,
    handleVerifyOtp,
    saveProfile,
  };
}
