// GET /guideview  (the actual PPT; only served with a valid session cookie)
import deckHtml from './_lib/deck_html.js';
import { COOKIE_SESSION, htmlResponse, inlineConfig, nextSessionLabel, readCookie, refEncode, verifyToken } from './_lib/util.js';

export async function onRequestGet({ request, env }) {
  const s = await verifyToken(env.GUIDE_SECRET, readCookie(request, COOKIE_SESSION), 's');
  if (!s) return new Response(null, { status: 302, headers: { Location: '/guidelogin', 'Cache-Control': 'no-store' } });
  const ref = await refEncode(env.GUIDE_SECRET, s.m);
  const first = String(s.n || '').replace(/^'/, '').split(' ')[0];
  return htmlResponse(inlineConfig(deckHtml, { next: nextSessionLabel(env), ref, name: first }));
}
