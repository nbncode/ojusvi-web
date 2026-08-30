// Edge function: send-otp
// Client calls this with { phone }. It generates a 4-digit code, stores a
// hashed copy (10-min expiry) and sends the code to the user via MSG91 using
// your existing approved template (the ##number## one).
//
// Deploy with JWT verification OFF (called before login).
//
// Env:
//   MSG91_AUTHKEY       -> your MSG91 auth key (already set)
//   MSG91_TEMPLATE_ID   -> 6a26503ce8517be9bb037863  (your approved template)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  -> auto-injected in edge functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

// -> "919560046103". Assumes India (+91) for a bare 10-digit number.
function normalizePhone(raw: string): string {
  const d = (raw ?? "").replace(/\D/g, "");
  return d.length === 10 ? "91" + d : d;
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { phone } = await req.json();
    const mobile = normalizePhone(phone);
    if (mobile.length < 11) return json({ error: "Invalid phone number" }, 400);

    const authkey = Deno.env.get("MSG91_AUTHKEY");
    const templateId = Deno.env.get("MSG91_TEMPLATE_ID");
    if (!authkey || !templateId) return json({ error: "OTP service not configured" }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Simple rate limit: one code per 45s per number.
    const { data: existing } = await admin
      .from("otp_codes").select("last_sent_at").eq("phone", mobile).maybeSingle();
    if (existing && Date.now() - new Date(existing.last_sent_at).getTime() < 45_000) {
      return json({ error: "Please wait a moment before requesting another code" }, 429);
    }

    // Generate + store the code (hashed).
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, "0");
    const code_hash = await sha256(mobile + ":" + code);
    const { error: upErr } = await admin.from("otp_codes").upsert({
      phone: mobile,
      code_hash,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
      attempts: 0,
      last_sent_at: new Date().toISOString(),
    });
    if (upErr) { console.error("store otp", upErr); return json({ error: "Server error" }, 500); }

    // Send it via MSG91 (your ##number## template).
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: { authkey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        template_id: templateId,
        recipients: [{ mobiles: mobile, number: code }],
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.type === "error") {
      console.error("MSG91 send failed", res.status, body);
      return json({ error: "Could not send the OTP" }, 502);
    }

    return json({ success: true });
  } catch (e) {
    console.error("send-otp error", e);
    return json({ error: "Server error" }, 500);
  }
});