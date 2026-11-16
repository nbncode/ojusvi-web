// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router';
// POST /api/guide/semp
// User-level flag only: reached the SEMP section and viewed >= 5 slides. No body is read; no slide data exists.
// Identity comes from the signed session cookie, never from the browser payload.
import { callSheet, json, readCookie, verifyToken, COOKIE_SESSION } from '@/lib/guide/util';

async function handler({ request }: { request: Request }) {
  const env: any = process.env;
  const s = await verifyToken(env.GUIDE_SECRET, readCookie(request, COOKIE_SESSION), 's');
  if (!s) return json({ ok: false }, 401);
  try {
    await callSheet(env, { action: 'semp', mobile: s.m, name: s.n });
  } catch (e) {
    console.error('semp flag failed', e && e.message);
    return json({ ok: false }, 424);
  }
  return json({ ok: true });
}

export const Route = createFileRoute('/api/guide/semp')({
  server: { handlers: { POST: handler } },
});
