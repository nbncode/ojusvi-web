// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router';
// GET /guideview  (the actual PPT; only served with a valid session cookie)
import deckHtml from '@/lib/guide/deck_html';
import { COOKIE_SESSION, htmlResponse, inlineConfig, nextSessionLabel, readCookie, refEncode, verifyToken } from '@/lib/guide/util';

async function handler({ request }: { request: Request }) {
  const env: any = process.env;
  const s = await verifyToken(env.GUIDE_SECRET, readCookie(request, COOKIE_SESSION), 's');
  if (!s) return new Response(null, { status: 302, headers: { Location: '/guidelogin', 'Cache-Control': 'no-store' } });
  const ref = await refEncode(env.GUIDE_SECRET, s.m);
  const first = String(s.n || '').replace(/^'/, '').split(' ')[0];
  return htmlResponse(inlineConfig(deckHtml, { next: nextSessionLabel(env), ref, name: first }));
}

export const Route = createFileRoute('/guideview')({
  server: { handlers: { GET: handler } },
});
