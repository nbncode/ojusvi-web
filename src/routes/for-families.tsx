import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/ojusvi/Nav";
import { Footer } from "@/components/ojusvi/Footer";
import samvit from "@/assets/samvit-medicines.webp";

const TITLE = "For Families — Peace of Mind for Your Parents | Ojusvi";
const DESCRIPTION =
  "Set your parents up with a gentle daily routine: live yoga, panchang, satsang, Tambola with company, and a simple place for medicines and health records — in their language.";
const URL = "https://ojusvi.app/for-families";

export const Route = createFileRoute("/for-families")({
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
            { "@type": "ListItem", position: 2, name: "For Families", item: URL },
          ],
        }),
      },
    ],
  }),
  component: ForFamiliesPage,
});

function ForFamiliesPage() {
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
          <span>For Families</span>
        </nav>

        <h1 className="mt-6 font-serif italic text-forest text-[32px] sm:text-[40px] md:text-[48px] leading-[1.12]">
          A Little More Peace of Mind for Your Parents
        </h1>

        <p className="mt-6 text-[18px] leading-[1.75] text-ink/85">
          If you live in another city — or another country — the hardest part is
          not knowing how the day went. Ojusvi gives your parents a warm daily
          routine of their own: a live yoga class in the morning, the panchang
          and a bhajan, gentle games, and Tambola in the afternoon with other
          members. All of it in the language they think in.
        </p>

        <h2 className="mt-14 font-serif italic text-forest text-[26px] md:text-[32px]">
          A day with something in it
        </h2>
        <ul className="mt-4 space-y-3 text-[17px] leading-[1.75] text-ink/85">
          <li>Morning: the day's panchang, then a live yoga and pranayama class with a teacher who knows the regulars by name.</li>
          <li>Midday: guided meditation, bhajan and group satsang for those who like it.</li>
          <li>Afternoon: live Tambola and gentle brain games with the community — company, not just content.</li>
          <li>Anytime: Samvit, for medicines, reminders and health records.</li>
        </ul>

        <img
          src={samvit}
          alt="Neatly arranged daily medicines beside a phone showing medicine reminders"
          width={820}
          height={460}
          loading="lazy"
          decoding="async"
          className="mt-10 w-full rounded-2xl object-cover"
        />

        <h2 className="mt-14 font-serif italic text-forest text-[26px] md:text-[32px]">
          Easy to set up, easy to use
        </h2>
        <p className="mt-4 text-[17px] leading-[1.75] text-ink/85">
          Large text, simple screens, and no jargon. Most families set the app up
          once over a call — pick the language, join the first class, and after
          that a parent can open it alone. Every new member gets the first 30 days
          free, with no card needed, so you can try it before deciding.
        </p>

        <h2 className="mt-14 font-serif italic text-forest text-[26px] md:text-[32px]">
          What Ojusvi is not
        </h2>
        <p className="mt-4 text-[17px] leading-[1.75] text-ink/85">
          It is not an emergency service, a monitoring device, or a substitute
          for a doctor, nurse or caregiver. Health entries in Samvit are kept
          private to the member's own account. Ojusvi's role is a gentle daily
          routine and company — and the reassurance that comes with knowing there
          is something in the day.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/pay"
            className="inline-flex h-14 items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition hover:bg-forest-deep"
          >
            See the annual membership
          </Link>
          <Link
            to="/download-app"
            className="inline-flex h-14 items-center justify-center rounded-full border border-forest/70 px-8 text-forest text-[15px] font-medium tracking-wide transition hover:bg-forest hover:text-parchment"
          >
            Download the app
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
