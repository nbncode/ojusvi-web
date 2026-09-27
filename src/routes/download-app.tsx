import { createFileRoute } from "@tanstack/react-router";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ojusvi.app";
const APP_STORE_URL = "https://apps.apple.com/in/app/ojusvi/id6792540529";
const FALLBACK_PATH = "/download";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/**
 * /download-app is a pure server-side store dispatcher: it never renders a
 * page. Android and iOS visitors get a 302 straight to their store listing;
 * everyone else lands on the /download marketing page. A Meta Conversions API
 * event is fired in the background so the redirect is never delayed.
 */
export const Route = createFileRoute("/download-app")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ua = request.headers.get("user-agent") || "";
        const isAndroid = /android/i.test(ua);
        const isIOS = /iphone|ipad|ipod/i.test(ua);

        // Carry campaign parameters into the Play referrer for install attribution.
        const utm = new URLSearchParams();
        for (const key of UTM_KEYS) {
          const value = url.searchParams.get(key);
          if (value) utm.set(key, value);
        }
        if (!utm.has("utm_source")) utm.set("utm_source", "meta");

        let target: string = FALLBACK_PATH;
        let platform = "desktop";
        if (isAndroid) {
          target = `${PLAY_STORE_URL}&referrer=${encodeURIComponent(utm.toString())}`;
          platform = "android";
        } else if (isIOS) {
          target = APP_STORE_URL;
          platform = "ios";
        }

        // Secrets are read per-request from process.env (injected into the
        // Worker runtime with nodejs_compat_populate_process_env).
        const pixelId = process.env["META_PIXEL_ID"];
        const capiToken = process.env["META_CAPI_TOKEN"];

        if (pixelId && capiToken) {
          const fbclid = url.searchParams.get("fbclid");
          const ip = request.headers.get("cf-connecting-ip") || "";

          const userData: Record<string, unknown> = {
            client_user_agent: ua,
            client_ip_address: ip,
          };
          if (fbclid) userData.fbc = `fb.1.${Date.now()}.${fbclid}`;

          const payload = {
            data: [
              {
                event_name: "StoreRedirect",
                event_time: Math.floor(Date.now() / 1000),
                action_source: "website",
                event_source_url: request.url,
                event_id: crypto.randomUUID(),
                user_data: userData,
                custom_data: {
                  platform,
                  ...Object.fromEntries(utm),
                },
              },
            ],
          };

          const send = fetch(
            `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${capiToken}`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            },
          ).catch(() => {
            // Attribution is best-effort: never block or fail the redirect.
          });

          // Prefer true background execution via the Workers lifecycle
          // waitUntil; fall back to a bounded 800ms wait only when the
          // runtime doesn't expose one.
          const ctx = request as unknown as {
            waitUntil?: (p: Promise<unknown>) => void;
            runtime?: {
              cloudflare?: {
                context?: { waitUntil?: (p: Promise<unknown>) => void };
              };
            };
          };
          const waitUntil =
            ctx.waitUntil?.bind(request) ??
            ctx.runtime?.cloudflare?.context?.waitUntil?.bind(
              ctx.runtime.cloudflare.context,
            );
          let capiMode: "waituntil" | "race";
          if (waitUntil) {
            waitUntil(send);
            capiMode = "waituntil";
          } else {
            await Promise.race([send, new Promise((r) => setTimeout(r, 800))]);
            capiMode = "race";
          }

          return new Response(null, {
            status: 302,
            headers: {
              Location: target,
              "Cache-Control": "no-store",
              "x-capi-mode": capiMode,
            },
          });
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: target,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
