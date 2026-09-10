/**
 * Carries an OTP login across /pay, /subscribe and /offer99 within the same
 * tab for 30 minutes from the original verification. App-level session-carry
 * logic layered on top of the existing Supabase client.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "ojusvi_login_at";
const WINDOW_MS = 30 * 60 * 1000;

export type CarriedProfile = {
  audience: "self" | "parent";
  payerName: string;
  payerCc: string;
  phone: string;
  memberName: string;
  memberCc: string;
  memberPhone: string;
  email: string;
};

export type CarriedLogin =
  | { status: "loading" }
  | { status: "logged-out" }
  | ({ status: "logged-in"; verified: true } & CarriedProfile);

/** Reverse of toE164: "+919876543210" -> { cc: "+91", number: "9876543210" }. */
function splitE164(value: string | null | undefined): { cc: string; number: string } {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return { cc: "+91", number: "" };
  if (digits.startsWith("91") && digits.length === 12) {
    return { cc: "+91", number: digits.slice(2) };
  }
  if (digits.length > 10) {
    return { cc: `+${digits.slice(0, digits.length - 10)}`, number: digits.slice(-10) };
  }
  return { cc: "+91", number: digits };
}

export function markLoggedIn() {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* sessionStorage unavailable */
  }
}

export function useCarriedLogin(): CarriedLogin {
  const [state, setState] = useState<CarriedLogin>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function clearAndSignOut(removeKey: boolean) {
      if (removeKey) {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
      try {
        await supabase.auth.signOut();
      } catch {
        /* ignore */
      }
      if (!cancelled) setState({ status: "logged-out" });
    }

    (async () => {
      let stored: string | null = null;
      try {
        stored = sessionStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }

      // No login in this tab: clear any leftover session from a closed tab.
      if (!stored) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await clearAndSignOut(false);
          return;
        }
        if (!cancelled) setState({ status: "logged-out" });
        return;
      }

      const at = Number(stored);
      if (!Number.isFinite(at) || Date.now() - at > WINDOW_MS) {
        await clearAndSignOut(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) {
        await clearAndSignOut(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, account_type, payer_name, member_name, payer_phone, member_phone")
        .eq("user_id", userId)
        .maybeSingle();

      const row = (profile ?? {}) as {
        email?: string | null;
        account_type?: string | null;
        payer_name?: string | null;
        member_name?: string | null;
        payer_phone?: string | null;
        member_phone?: string | null;
      };

      const payer = splitE164(row.payer_phone);
      const member = splitE164(row.member_phone);

      if (cancelled) return;
      setState({
        status: "logged-in",
        verified: true,
        audience: row.account_type === "parent" ? "parent" : "self",
        payerName: row.payer_name ?? "",
        payerCc: payer.cc,
        phone: payer.number,
        memberName: row.member_name ?? "",
        memberCc: member.cc,
        memberPhone: member.number,
        email: row.email ?? "",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
