// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router';
// POST /api/guide/unlock
// Step 3: after the WhatsApp round trip, issue the 30-day session cookie.
// The server only enforces a minimum wait since the tap; it cannot see WhatsApp.
import { callSheet, json, jsonWithCookies, readCookie, setCookie, signToken, verifyToken, COOKIE_TAPPED, COOKIE_SESSION, SESSION_DAYS } from '@/lib/guide/util';

async function handler({ request }: { request: Request }) {
  const env: any = process.env;
  const t = await verifyToken(env.GUIDE_SECRET, readCookie(request, COOKIE_TAPPED), 't');
  if (!t) return json({ ok: false, code: 'no_tap', error: 'Please request access on WhatsApp first.' }, 401);
  const minWait = Number(env.MIN_WAIT_MS || 10000);
  const wait = t.tap + minWait - Date.now();
  if (wait > 0) return json({ ok: false, code: 'too_early', retryInMs: wait }, 425);
  const maxAge = SESSION_DAYS * 86400;
  const token = await signToken(env.GUIDE_SECRET, { t: 's', m: t.m, n: t.n, exp: Date.now() + maxAge * 1000 });
  const log = callSheet(env, { action: 'event', mobile: t.m, name: t.n, event: 'unlocked' }).catch((e) => console.error('log failed', e && e.message));
  await log;
  return jsonWithCookies({ ok: true, url: '/guideview' }, [setCookie(COOKIE_SESSION, token, maxAge)]);
}

export const Route = createFileRoute('/api/guide/unlock')({
  server: { handlers: { POST: handler } },
});
