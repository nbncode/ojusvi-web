import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { useEffect } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AnalyticsLoader } from "../components/AnalyticsLoader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ojusvi - Vitality, Brilliance, Strength from within" },
      { name: "google-site-verification", content: "wHH8SRiBJI_q7RJqQvpelPt-hfzltusdgGJh6cwmDbY" },
      { name: "description", content: "Daily yoga, panchang, satsang, Tambola and quiet companionship — a wellness app for seniors 55+ (and their families), in eight Indian languages. 30 days free." },
      { name: "author", content: "Ojusvi" },
      { property: "og:title", content: "Ojusvi — Vitality, Brilliance, Strength from within" },
      { property: "og:description", content: "A wellness, community and health app for seniors 55+ and their families — daily yoga, live Tambola, and Samvit medicine & records tracking, in your language. Start with 30 days free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ojusvi — Vitality, Brilliance, Strength from within" },
      { name: "twitter:description", content: "A wellness, community and health app for seniors 55+ and their families — daily yoga, live Tambola, and Samvit medicine & records tracking, in your language. Start with 30 days free." },
      { property: "og:site_name", content: "Ojusvi" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:image", content: "https://ojusvi.app/og-image.jpg" },
      { property: "og:image:secure_url", content: "https://ojusvi.app/og-image.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      // Actual intrinsic size of public/og-image.jpg (portrait splash). Declared
      // truthfully so crawlers do not mis-scale it; not cropped to 1200x630.
      { property: "og:image:width", content: "916" },
      { property: "og:image:height", content: "1717" },
      { property: "og:image:alt", content: "Ojusvi — wellness and companionship app for adults 55+" },
      { name: "twitter:image", content: "https://ojusvi.app/og-image.jpg" },
      { name: "twitter:image:alt", content: "Ojusvi — wellness and companionship app for adults 55+" },
    ],
    scripts: [
      {
        type: "text/javascript",
        async: true,
        src: "https://t.contentsquare.net/uxa/7479e8ee9d4d0.js",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://ojusvi.app/#organization",
          name: "Ojusvi",
          legalName: "Ojusvi Goodhealth Private Limited",
          url: "https://ojusvi.app",
          logo: "https://ojusvi.app/ojusvi-logo-round.webp",
          image: "https://ojusvi.app/og-image.jpg",
          description:
            "Ojusvi is an Indian wellness and companionship app for adults 55+ and their families — live daily yoga, meditation, panchang, satsang, gentle games and everyday health tools, in six Indian languages.",
          areaServed: "IN",
          email: "hello@ojusvi.app",
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "hello@ojusvi.app",
              telephone: "+91-99589-05337",
              availableLanguage: ["English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil"],
            },
          ],
          sameAs: [
            "https://www.facebook.com/profile.php?id=61570805703707",
            "https://www.instagram.com/ojusvi.app/",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://ojusvi.app/#website",
          name: "Ojusvi",
          url: "https://ojusvi.app",
          inLanguage: "en-IN",
          description:
            "Wellness and companionship app for adults 55+ in India — live yoga, meditation, community activities, panchang, games and everyday health tools in Indian languages.",
          publisher: { "@id": "https://ojusvi.app/#organization" },
        }),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      // Fonts are self-hosted (see src/styles.css @font-face) so there is no
      // third-party round trip; the two above-the-fold faces are preloaded to
      // avoid a late swap that would reflow the hero.
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/plus-jakarta-sans-400-normal-latin.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/cormorant-garamond-500-normal-latin.woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <noscript>
          <img
            alt=""
            aria-hidden="true"
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1003917755730830&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-53R49PBJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <AnalyticsLoader />
    </QueryClientProvider>
  );
}
