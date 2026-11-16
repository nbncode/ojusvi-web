// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router';
// POST /api/guide/request
// Step 1: save name + mobile to the Access tab (via Apps Script) and start the unlock flow.
import { callSheet, cleanName, normPhone, json, jsonWithCookies, refDecode, setCookie, signToken, COOKIE_PENDING } from '@/lib/guide/util';

async function handler({ request }: { request: Request }) {
  const env: any = process.env;
  if (!env.GUIDE_SECRET) return json({ ok: false, error: 'server not configured' }, 500);
  let b;
  try { b = await request.json(); } catch (e) { return json({ ok: false, error: 'bad request' }, 400); }

  // bots: honeypot filled, or form submitted faster than a human can type
  if (b.hp) return json({ ok: true });                       // pretend success
  const fillMs = Date.now() - Number(b.ts || 0);
  if (!(fillMs > 2500 && fillMs < 6 * 3600 * 1000)) return json({ ok: false, error: 'Please try again.' }, 400);

  // optional Cloudflare Turnstile
  if (env.TURNSTILE_SECRET) {
    const fd = new FormData();
    fd.append('secret', env.TURNSTILE_SECRET);
    fd.append('response', b.cf || '');
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) fd.append('remoteip', ip);
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd }).then((r) => r.json()).catch(() => ({}));
    if (!v.success) return json({ ok: false, error: 'Please try again.' }, 400);
  }

  const name = cleanName(b.name);
  if (!name) return json({ ok: false, error: 'Please enter your name.', field: 'name' }, 400);
  const mobile = normPhone(b.mobile);
  if (!mobile) return json({ ok: false, error: 'Please enter a valid 10-digit mobile number.', field: 'mobile' }, 400);
  const consent = b.consent === true ? 'Yes' : 'No';

  let inviter = '';
  if (b.ref) {
    const m = await refDecode(env.GUIDE_SECRET, String(b.ref));
    if (m && m !== mobile) inviter = m;
  }

  try {
    await callSheet(env, { action: 'upsert', name, mobile, consent, inviter, source: 'Guide page (unverified)' });
  } catch (e) {
    console.error('sheet write failed', e && e.message);
    return json({ ok: false, error: 'Something went wrong on our side. Please try again in a minute.' }, 424);
  }

  const token = await signToken(env.GUIDE_SECRET, { t: 'p', m: mobile, n: name, exp: Date.now() + 3600 * 1000 });
  return jsonWithCookies({ ok: true, name }, [setCookie(COOKIE_PENDING, token, 3600)]);
}

export const Route = createFileRoute('/api/guide/request')({
  server: { handlers: { POST: handler } },
});
