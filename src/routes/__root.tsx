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
{ property: "og:image", content: "https://ojusvi.app/og-image.jpg" },
      { property: "og:image:width", content: "1086" },
      { property: "og:image:height", content: "1448" },
      { name: "twitter:image", content: "https://ojusvi.app/og-image.jpg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Ojusvi",
          url: "https://ojusvi.app",
          logo: "https://ojusvi.app/ojusvi-logo-round.png",
          description: "A wellness, community and health app for seniors 55+ and their families — daily yoga, live Tambola, and Samvit medicine & records tracking, in your language.",
          sameAs: ["https://www.facebook.com/profile.php?id=61570805703707", "https://www.instagram.com/ojusvi.app/"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Ojusvi",
          url: "https://ojusvi.app",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Ojusvi",
          applicationCategory: "HealthApplication",
          operatingSystem: "Android, iOS",
          description:
            "Daily yoga, panchang, group satsang, gentle games, and quiet companionship — a wellness app for seniors 55+ and their families, in your language.",
          url: "https://ojusvi.app",
          image: "https://ojusvi.app/og-image.jpg",
          offers: [
            {
              "@type": "Offer",
              name: "Annual (billed once for 12 months)",
              price: "249",
              priceCurrency: "INR",
              description: "₹2,988 billed once for 12 months — works out to ₹249/month.",
              url: "https://ojusvi.app/#pricing",
            },
            {
              "@type": "Offer",
              name: "Monthly",
              price: "349",
              priceCurrency: "INR",
              description: "Billed monthly, cancel anytime.",
              url: "https://ojusvi.app/#pricing",
            },
          ],
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
