/**
 * Server-only helpers for phone OTP via MSG91.
 * Codes are generated here, stored hashed in public.otp_codes, and delivered
 * through MSG91's Flow API using the approved ##number## template.
 */

/** "9560046103" -> "919560046103". Bare 10-digit numbers are assumed Indian. */
export function normalizePhone(raw: string): string {
  const d = (raw ?? "").replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
}

export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hashOtp(mobile: string, code: string): Promise<string> {
  return sha256(`${mobile}:${code}`);
}

export function generateCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 10000;
  return String(n).padStart(4, "0");
}

export function randomPassword(): string {
  return crypto.randomUUID() + crypto.randomUUID();
}

/** Sends the code through MSG91 Flow. Throws a user-safe error on failure. */
export async function sendViaMsg91(mobile: string, code: string): Promise<void> {
  const authkey = process.env["MSG91_AUTHKEY"];
  const templateId = process.env["MSG91_TEMPLATE_ID"];
  if (!authkey || !templateId) throw new Error("OTP service is not configured yet");

  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { authkey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      template_id: templateId,
      recipients: [{ mobiles: mobile, number: code }],
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { type?: string; message?: string };
  if (!res.ok || body?.type === "error") {
    console.error("MSG91 send failed", res.status, body);
    throw new Error("Could not send the OTP. Please try again.");
  }
}

/**
 * Finds the real Supabase Auth user id for a phone number, creating a
 * placeholder account if one doesn't exist yet. Unlike verifyOtp, this never
 * touches credentials on an existing account and never mints a session — it
 * only guarantees a real auth.users row exists for the phone and returns its
 * id. Safe to call for phones that will never themselves log in (e.g. a
 * parent/beneficiary on a gifted plan).
 */
export async function getOrCreateUserIdForPhone(rawPhone: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const mobile = normalizePhone(rawPhone);
  if (mobile.length < 11) throw new Error(`Invalid phone for account resolution: ${rawPhone}`);

  const { data: foundId } = await supabaseAdmin.rpc("get_user_id_by_phone", { p_phone: mobile });
  if (foundId) return foundId as string;

  const authEmail = `phone-${mobile}@auth.ojusvi.invalid`;
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: authEmail,
    email_confirm: true,
    phone: mobile,
    phone_confirm: true,
    password: randomPassword(),
  });
  if (error || !created?.user) {
    // Race with a concurrent create (e.g. they're verifying their own OTP
    // at the same moment) — re-check before giving up.
    const { data: retryId } = await supabaseAdmin.rpc("get_user_id_by_phone", { p_phone: mobile });
    if (!retryId) throw new Error(`Could not resolve/create account for ${mobile}: ${error?.message}`);
    return retryId as string;
  }
  return created.user.id;
}
