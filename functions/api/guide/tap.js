// POST /api/guide/tap
// Step 2: the visitor tapped "Request access on WhatsApp". Record the time (signed, stateless).
import { callSheet, json, jsonWithCookies, readCookie, setCookie, signToken, verifyToken, COOKIE_PENDING, COOKIE_TAPPED } from '../../_lib/util.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const p = await verifyToken(env.GUIDE_SECRET, readCookie(request, COOKIE_PENDING), 'p');
  if (!p) return json({ ok: false, error: 'start', code: 'no_pending' }, 401);
  const now = Date.now();
  const token = await signToken(env.GUIDE_SECRET, { t: 't', m: p.m, n: p.n, tap: now, exp: now + 3600 * 1000 });
  const log = callSheet(env, { action: 'event', mobile: p.m, name: p.n, event: 'wa_tapped' }).catch((e) => console.error('log failed', e && e.message));
  if (waitUntil) waitUntil(log);
  return jsonWithCookies({ ok: true, tapAt: now }, [setCookie(COOKIE_TAPPED, token, 3600)]);
}
