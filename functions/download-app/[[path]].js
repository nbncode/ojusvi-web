const PLAY = "https://play.google.com/store/apps/details?id=com.ojusvi.app";
const IOS = "https://apps.apple.com/in/app/ojusvi/id6792540529";
const FALLBACK = "https://ojusvi.app/download"; // desktop / unknown

async function sha256(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const ua = request.headers.get("user-agent") || "";
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  // Carry UTMs into Play referrer for install attribution
  const utm = new URLSearchParams();
  for (const k of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]) {
    const v = url.searchParams.get(k); if (v) utm.set(k, v);
  }
  if (!utm.has("utm_source")) utm.set("utm_source", "meta");

  let target = FALLBACK, platform = "desktop";
  if (isAndroid) { target = `${PLAY}&referrer=${encodeURIComponent(utm.toString())}`; platform = "android"; }
  else if (isIOS) { target = IOS; platform = "ios"; }

  // Fire Meta CAPI event without delaying the redirect
  const fbclid = url.searchParams.get("fbclid");
  const ip = request.headers.get("cf-connecting-ip") || "";
  if (env.META_PIXEL_ID && env.META_CAPI_TOKEN) {
    const now = Math.floor(Date.now() / 1000);
    const user_data = { client_user_agent: ua, client_ip_address: ip };
    if (fbclid) user_data.fbc = `fb.1.${Date.now()}.${fbclid}`;
    user_data.external_id = [await sha256(ip + ua)];
    const body = {
      data: [{
        event_name: "StoreRedirect",
        event_time: now,
        action_source: "website",
        event_source_url: request.url,
        event_id: crypto.randomUUID(),
        user_data,
        custom_data: { platform, ...Object.fromEntries(utm) }
      }]
    };
    ctx.waitUntil(fetch(
      `https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events?access_token=${env.META_CAPI_TOKEN}`,
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
    ));
  }

  return new Response(null, {
    status: 302,
    headers: { Location: target, "Cache-Control": "no-store" }
  });
}
