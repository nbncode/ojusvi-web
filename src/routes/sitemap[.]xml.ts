import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ojusvi.app";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // lastmod values are the dates each page's content last changed in the
        // repository — page-specific, never generation time.
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: "2026-09-10" },
          { path: "/watch", changefreq: "weekly", priority: "0.9", lastmod: "2026-09-11" },
          { path: "/yoga-for-seniors", changefreq: "monthly", priority: "0.9", lastmod: "2026-09-15" },
          { path: "/for-families", changefreq: "monthly", priority: "0.8", lastmod: "2026-09-15" },
          { path: "/about", changefreq: "monthly", priority: "0.7", lastmod: "2026-09-15" },
          { path: "/learn", changefreq: "monthly", priority: "0.6", lastmod: "2026-09-15" },
          { path: "/download", changefreq: "monthly", priority: "0.8", lastmod: "2026-08-28" },
          { path: "/download-app", changefreq: "monthly", priority: "0.8", lastmod: "2026-08-27" },
          { path: "/pay", changefreq: "monthly", priority: "0.8", lastmod: "2026-09-10" },
          { path: "/become-an-instructor", changefreq: "monthly", priority: "0.8", lastmod: "2026-08-16" },
          { path: "/earningcalc", changefreq: "monthly", priority: "0.5", lastmod: "2026-08-11" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3", lastmod: "2026-08-16" },
          { path: "/terms", changefreq: "yearly", priority: "0.3", lastmod: "2026-08-28" },
          { path: "/refund", changefreq: "yearly", priority: "0.3", lastmod: "2026-08-16" },
          { path: "/security", changefreq: "yearly", priority: "0.3", lastmod: "2026-08-16" },
          { path: "/account-deletion", changefreq: "yearly", priority: "0.3", lastmod: "2026-08-16" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );


        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});