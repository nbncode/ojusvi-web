import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/ojusvi/Nav";
import { Footer } from "@/components/ojusvi/Footer";

const TITLE = "Learn — Yoga, Healthy Aging and Caregiving | Ojusvi";
const DESCRIPTION =
  "Plain-language guides from Ojusvi on gentle yoga for seniors, healthy aging and caring for ageing parents in India.";
const URL = "https://ojusvi.app/learn";

const topics = [
  {
    name: "Yoga",
    to: "/yoga-for-seniors" as const,
    blurb:
      "How Ojusvi's live daily classes are structured for aging bodies — mobility, balance, breathing, and a variation for every ability.",
    cta: "Read: Yoga for seniors",
  },
  {
    name: "Healthy aging",
    to: "/about" as const,
    blurb:
      "The three areas we build the day around — physical, mental and spiritual wellness — and the everyday health tools that hold it together.",
    cta: "Read: About Ojusvi",
  },
  {
    name: "Caregiving",
    to: "/for-families" as const,
    blurb:
      "For sons and daughters: setting parents up with a routine of their own, and what Ojusvi can and cannot do for a family.",
    cta: "Read: For families",
  },
];

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://ojusvi.app/" },
            { "@type": "ListItem", position: 2, name: "Learn", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          url: URL,
          description: DESCRIPTION,
          publisher: {
            "@type": "Organization",
            name: "Ojusvi",
            legalName: "Ojusvi Goodhealth Private Limited",
            url: "https://ojusvi.app",
          },
        }),
      },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="min-h-screen bg-parchment text-ink">
      <Nav />
      <main className="mx-auto max-w-[820px] px-6 pt-32 pb-24 md:pt-40">
        <nav aria-label="Breadcrumb" className="text-[14px] text-ink/60">
          <Link to="/" className="underline underline-offset-4 hover:text-forest">
            Home
          </Link>
          <span aria-hidden="true" className="px-2">
            ·
          </span>
          <span>Learn</span>
        </nav>

        <h1 className="mt-6 font-serif italic text-forest text-[32px] sm:text-[40px] md:text-[48px] leading-[1.12]">
          Learn with Ojusvi
        </h1>
        <p className="mt-6 text-[18px] leading-[1.75] text-ink/85">
          Plain-language reading for members and their families — written by the
          Ojusvi team, reviewed with our teachers, and kept free of medical
          claims. Three areas to begin with.
        </p>

        <div className="mt-10 space-y-6">
          {topics.map((t) => (
            <article
              key={t.name}
              className="rounded-2xl border border-forest/15 p-6"
            >
              <p className="text-[13px] uppercase tracking-[0.18em] text-forest/80">
                {t.name}
              </p>
              <p className="mt-3 text-[17px] leading-[1.7] text-ink/85">
                {t.blurb}
              </p>
              <Link
                to={t.to}
                className="mt-4 inline-flex min-h-[48px] items-center text-forest underline underline-offset-4 hover:text-forest-deep"
              >
                {t.cta} →
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-12 rounded-2xl border border-forest/15 p-5 text-[15px] leading-[1.7] text-ink/70">
          Everything here is general wellness information, not medical advice.
          Please talk to your own doctor about your health.
        </p>
      </main>
      <Footer />
    </div>
  );
}
