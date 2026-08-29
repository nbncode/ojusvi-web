// Edge function: verify-otp
// Client calls this with { phone, otp }. It checks the code against the stored
// hash; on success it finds-or-creates the Supabase user, sets a fresh random
// password (server-only, never returned), signs in, and returns ONLY the
// session tokens. The client then calls
// supabase.auth.setSession({ access_token, refresh_token }).
//
// Deploy with JWT verification OFF (called before login).
//
// Env: MSG91_AUTHKEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

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
    const { phone, otp } = await req.json();
    const mobile = normalizePhone(phone);
    if (mobile.length < 11 || !otp) return json({ error: "Phone and OTP required" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    // 1. Look up the stored code and validate it.
    const { data: row } = await admin
      .from("otp_codes").select("*").eq("phone", mobile).maybeSingle();
    if (!row) return json({ error: "Invalid or expired OTP" }, 401);

    if (new Date(row.expires_at).getTime() < Date.now()) {
      await admin.from("otp_codes").delete().eq("phone", mobile);
      return json({ error: "Invalid or expired OTP" }, 401);
    }
    if (row.attempts >= 5) {
      await admin.from("otp_codes").delete().eq("phone", mobile);
      return json({ error: "Too many attempts. Request a new code." }, 429);
    }

    const hash = await sha256(mobile + ":" + String(otp).trim());
    if (hash !== row.code_hash) {
      await admin.from("otp_codes").update({ attempts: row.attempts + 1 }).eq("phone", mobile);
      return json({ error: "Invalid or expired OTP" }, 401);
    }

    // Correct code -> consume it (single use).
    await admin.from("otp_codes").delete().eq("phone", mobile);

    // 2. Find-or-create the user and set a fresh server-only password.
    const password = crypto.randomUUID() + crypto.randomUUID();
    let userId: string | null = null;

    const { data: foundId } = await admin.rpc("get_user_id_by_phone", { p_phone: mobile });
    userId = (foundId as string) ?? null;

    if (userId) {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password, phone_confirm: true,
      });
      if (error) { console.error("updateUser", error); return json({ error: "Could not create session" }, 500); }
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        phone: mobile, phone_confirm: true, password,
      });
      if (error || !created?.user) {
        const { data: retryId } = await admin.rpc("get_user_id_by_phone", { p_phone: mobile });
        if (!retryId) { console.error("createUser", error); return json({ error: "Could not create session" }, 500); }
        userId = retryId as string;
        await admin.auth.admin.updateUserById(userId, { password, phone_confirm: true });
      } else {
        userId = created.user.id;
      }
    }

    // 3. Sign in server-side to obtain real session tokens.
    const anon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false },
    });
    let session = null;
    for (const p of [mobile, "+" + mobile]) {
      const { data } = await anon.auth.signInWithPassword({ phone: p, password });
      if (data?.session) { session = data.session; break; }
    }
    if (!session) { console.error("no session"); return json({ error: "Could not create session" }, 500); }

    return json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } catch (e) {
    console.error("verify-otp error", e);
    return json({ error: "Server error" }, 500);
  }
});