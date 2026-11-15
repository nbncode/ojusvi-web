// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router';
// GET /guidelogin  (login page; people with a valid session go straight to the guide)
import loginHtml from '@/lib/guide/login_html';
import { COOKIE_SESSION, htmlResponse, inlineConfig, nextSessionLabel, readCookie, verifyToken } from '@/lib/guide/util';

async function handler({ request }: { request: Request }) {
  const env: any = process.env;
  const url = new URL(request.url);
  if (!url.searchParams.has('relogin')) {
    const s = await verifyToken(env.GUIDE_SECRET, readCookie(request, COOKIE_SESSION), 's');
    if (s) return new Response(null, { status: 302, headers: { Location: '/guideview', 'Cache-Control': 'no-store' } });
  }
  const cfg = { next: nextSessionLabel(env), turnstile: env.TURNSTILE_SITEKEY || '' };
  return htmlResponse(inlineConfig(loginHtml, cfg), { 'X-Robots-Tag': 'noindex, follow' });
}

export const Route = createFileRoute('/guidelogin')({
  server: { handlers: { GET: handler } },
});
