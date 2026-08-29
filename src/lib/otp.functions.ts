import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Phone OTP sign-in.
 * sendOtp  -> stores a hashed 4-digit code (10 min) and texts it via MSG91.
 * verifyOtp -> validates the code, finds/creates the Supabase auth user and
 *              returns a real session for supabase.auth.setSession().
 */

export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string }) => z.object({ phone: z.string().min(6).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const { generateCode, hashOtp, normalizePhone, sendViaMsg91 } = await import("./otp.server");
    const mobile = normalizePhone(data.phone);
    if (mobile.length < 11) throw new Error("Please enter a valid mobile number");

    // Per-IP throttle: stops someone burning SMS credit across many numbers.
    const { getRequest } = await import("@tanstack/react-start/server");
    const { clientIpFromHeaders, consumeRateLimit } = await import("./rate-limit.server");
    const ip = clientIpFromHeaders(getRequest().headers);
    const ipLimit = await consumeRateLimit({
      bucket: "otp_send_ip",
      key: ip,
      limit: 5,
      windowSeconds: 3600,
    });
    if (!ipLimit.allowed) {
      throw new Error("Too many requests from this device. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("otp_codes")
      .select("last_sent_at")
      .eq("phone", mobile)
      .maybeSingle();
    if (existing?.last_sent_at && Date.now() - new Date(existing.last_sent_at).getTime() < 45_000) {
      throw new Error("Please wait a moment before requesting another code");
    }

    const code = generateCode();
    const code_hash = await hashOtp(mobile, code);
    const { error } = await supabaseAdmin.from("otp_codes").upsert({
      phone: mobile,
      code_hash,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
      attempts: 0,
      last_sent_at: new Date().toISOString(),
    });
    if (error) {
      console.error("store otp", error);
      throw new Error("Could not send the OTP. Please try again.");
    }

    await sendViaMsg91(mobile, code);
    return { success: true as const };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; otp: string }) =>
    z.object({ phone: z.string().min(6).max(20), otp: z.string().regex(/^\d{4,8}$/) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { hashOtp, normalizePhone, randomPassword } = await import("./otp.server");
    const mobile = normalizePhone(data.phone);
    if (mobile.length < 11) return { success: false as const, message: "Please enter a valid mobile number" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin.from("otp_codes").select("*").eq("phone", mobile).maybeSingle();
    if (!row) return { success: false as const, message: "Invalid or expired OTP" };

    if (new Date(row.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from("otp_codes").delete().eq("phone", mobile);
      return { success: false as const, message: "Invalid or expired OTP" };
    }
    if ((row.attempts ?? 0) >= 5) {
      await supabaseAdmin.from("otp_codes").delete().eq("phone", mobile);
      return { success: false as const, message: "Too many attempts. Request a new code." };
    }

    const expected = await hashOtp(mobile, String(data.otp).trim());
    if (expected !== row.code_hash) {
      await supabaseAdmin
        .from("otp_codes")
        .update({ attempts: (row.attempts ?? 0) + 1 })
        .eq("phone", mobile);
      return { success: false as const, message: "Invalid or expired OTP" };
    }

    // Supabase phone/password sign-in is not enabled because MSG91 owns OTP
    // delivery. Use a private deterministic email identity only to exchange
    // the verified phone OTP for a real Supabase session.
    const password = randomPassword();
    const authEmail = `phone-${mobile}@auth.ojusvi.invalid`;
    const { data: foundId } = await supabaseAdmin.rpc("get_user_id_by_phone", { p_phone: mobile });
    let userId = (foundId as string | null) ?? null;

    if (userId) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: authEmail,
        email_confirm: true,
        password,
        phone_confirm: true,
      });
      if (error) {
        console.error("updateUser", error);
        throw new Error("Could not create session");
      }
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        email_confirm: true,
        phone: mobile,
        phone_confirm: true,
        password,
      });
      if (error || !created?.user) {
        const { data: retryId } = await supabaseAdmin.rpc("get_user_id_by_phone", { p_phone: mobile });
        if (!retryId) {
          console.error("createUser", error);
          throw new Error("Could not create session");
        }
        userId = retryId as string;
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: authEmail,
          email_confirm: true,
          password,
          phone_confirm: true,
        });
        if (updateError) {
          console.error("updateUser after create conflict", updateError);
          throw new Error("Could not create session");
        }
      } else {
        userId = created.user.id;
      }
    }

    // Sign in server-side to mint real session tokens.
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env["SUPABASE_URL"];
    const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!supabaseUrl || !publishableKey) throw new Error("Could not create session");
    const anon = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: signed, error: signInError } = await anon.auth.signInWithPassword({
      email: authEmail,
      password,
    });
    if (!signed.session) {
      console.error("session sign-in failed", signInError);
      throw new Error("Could not create session");
    }

    // Consume the OTP only after the session has been minted successfully.
    await supabaseAdmin.from("otp_codes").delete().eq("phone", mobile);
    return {
      success: true as const,
      access_token: signed.session.access_token,
      refresh_token: signed.session.refresh_token,
    };
  });
