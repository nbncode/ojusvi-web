import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  component: Consent,
});

function normalize(code: string, number: string) {
  return `+${`${code}${number}`.replace(/[^\d]/g, "")}`;
}

function Consent() {
  const { authorization_id } = Route.useSearch();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // phone OTP sign-in state
  const [code, setCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  useEffect(() => {
    if (!signedIn || !authorization_id) return;
    let cancelled = false;
    oauth()
      .getAuthorizationDetails(authorization_id)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) return setError(err.message);
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      })
      .catch((e) => setError(String(e?.message ?? e)));
    return () => {
      cancelled = true;
    };
  }, [signedIn, authorization_id]);

  async function sendOtp() {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: normalize(code, phone) });
    setBusy(false);
    if (err) return setError(err.message);
    setOtpSent(true);
  }

  async function verifyOtp() {
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: normalize(code, phone),
      token: otp,
      type: "sms",
    });
    setBusy(false);
    if (err) return setError(err.message);
    if (data.session) setSignedIn(true);
  }

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: err } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  if (!authorization_id) {
    return (
      <Shell>
        <p className="text-ink/70">This authorization link is missing its request id.</p>
      </Shell>
    );
  }

  if (signedIn === null) {
    return (
      <Shell>
        <p className="text-ink/70">Loading…</p>
      </Shell>
    );
  }

  if (!signedIn) {
    return (
      <Shell title="Sign in to continue">
        <p className="mt-3 text-ink/70">
          Enter your Ojusvi mobile number. We'll send you a one-time code.
        </p>
        {error && <p role="alert" className="mt-4 text-terracotta">{error}</p>}
        {!otpSent ? (
          <div className="mt-6 flex gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Country code"
              className="h-14 w-20 rounded-xl border border-ink/15 bg-parchment px-3 text-[17px]"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="Mobile number"
              aria-label="Mobile number"
              className="h-14 flex-1 rounded-xl border border-ink/15 bg-parchment px-4 text-[17px]"
            />
          </div>
        ) : (
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            placeholder="Enter code"
            aria-label="One-time code"
            className="mt-6 h-14 w-full rounded-xl border border-ink/15 bg-parchment px-4 text-[17px] tracking-[0.3em]"
          />
        )}
        <button
          disabled={busy || (otpSent ? otp.length < 4 : phone.length < 6)}
          onClick={() => (otpSent ? verifyOtp() : sendOtp())}
          className="mt-6 h-14 w-full rounded-full bg-forest px-8 text-[18px] text-parchment transition hover:bg-forest-deep disabled:opacity-50"
        >
          {otpSent ? "Verify code" : "Send code"}
        </button>
      </Shell>
    );
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <Shell title={`Connect ${clientName} to your account`}>
      <p className="mt-3 text-ink/70">
        This lets {clientName} read and update your Ojusvi profile and membership on your behalf.
      </p>
      {error && <p role="alert" className="mt-4 text-terracotta">{error}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          disabled={busy || !details}
          onClick={() => decide(true)}
          className="h-14 rounded-full bg-forest px-8 text-[18px] text-parchment transition hover:bg-forest-deep disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => decide(false)}
          className="h-14 rounded-full border border-ink/20 px-8 text-[18px] text-ink transition hover:bg-ink/5 disabled:opacity-50"
        >
          Deny
        </button>
      </div>
    </Shell>
  );
}

function Shell({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-parchment text-ink text-[17px]">
      <div className="mx-auto max-w-lg px-6 py-24">
        {title && (
          <h1 className="font-serif italic text-forest text-[34px] leading-tight">{title}</h1>
        )}
        {children}
      </div>
    </main>
  );
}