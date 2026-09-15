import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/ojusvi/Nav";
import { Footer } from "@/components/ojusvi/Footer";
import yogaTrio from "@/assets/yoga-program-trio.webp";

const TITLE = "Yoga for Seniors — Live Daily Classes for Adults 55+ | Ojusvi";
const DESCRIPTION =
  "Live daily yoga for seniors, taught in six Indian languages with seated and supported variations for mobility, balance and breathing. Gentle, guided, and made for aging bodies.";
const URL = "https://ojusvi.app/yoga-for-seniors";

export const Route = createFileRoute("/yoga-for-seniors")({
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
            { "@type": "ListItem", position: 2, name: "Yoga for Seniors", item: URL },
          ],
        }),
      },
    ],
  }),
  component: YogaForSeniorsPage,
});

const pillars = [
  {
    h: "Safety first, always",
    p: "Every class is led by a certified teacher who watches the room and calls out what to avoid. Warm-ups are unhurried, transitions are slow, and nothing is held longer than it should be. If a posture doesn't suit you today, the teacher offers another one.",
  },
  {
    h: "Mobility for stiff mornings",
    p: "Gentle joint rotations for the neck, shoulders, wrists, hips, knees and ankles — the small movements that make bending, reaching and getting out of a chair feel easier over the weeks.",
  },
  {
    h: "Balance, with support nearby",
    p: "Standing balance work is always taught with a wall or a sturdy chair within reach. The goal is steadiness and confidence on stairs and uneven ground, not showing off a pose.",
  },
  {
    h: "Breathing and pranayama",
    p: "Slow, guided breathing — anulom vilom, deep abdominal breaths, extended exhales — done seated, at your own pace, with rest whenever you need it.",
  },
];

function YogaForSeniorsPage() {
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
          <span>Yoga for Seniors</span>
        </nav>

        <h1 className="mt-6 font-serif italic text-forest text-[32px] sm:text-[40px] md:text-[48px] leading-[1.12]">
          Yoga for Seniors: A Structured Wellness Program Built for Aging Bodies
        </h1>

        <p className="mt-6 text-[18px] leading-[1.75] text-ink/85">
          Ojusvi's yoga is designed for adults 55 and over — bodies that have
          done a lot of living, and knees, hips and shoulders that ask for a
          little more patience. Classes are live, at a fixed time each day, with
          a real teacher who greets you and guides you in your own language.
        </p>

        <img
          src={yogaTrio}
          alt="Three older Indian adults following a seated stretch during a guided yoga class"
          width={820}
          height={460}
          loading="lazy"
          decoding="async"
          className="mt-10 w-full rounded-2xl object-cover"
        />

        <h2 className="mt-14 font-serif italic text-forest text-[26px] md:text-[32px]">
          What the program covers
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {pillars.map((p) => (
            <div
              key={p.h}
              className="rounded-2xl border border-forest/15 p-5"
            >
              <h3 className="font-serif italic text-forest text-[20px]">{p.h}</h3>
              <p className="mt-2 text-[16px] leading-[1.7] text-ink/80">{p.p}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-serif italic text-forest text-[26px] md:text-[32px]">
          Every ability has a variation
        </h2>
        <p className="mt-4 text-[17px] leading-[1.75] text-ink/85">
          Teachers offer three levels of most movements: seated on a chair,
          supported with a wall, belt, block or cushion, and standing. You choose
          from your mat, without having to explain yourself. Members who have not
          exercised in years usually begin with the seated variation and move on
          when it feels right.
        </p>
        <p className="mt-4 text-[17px] leading-[1.75] text-ink/85">
          We recommend keeping comfortable clothes, a mat, one yoga belt, two
          blocks, a cushion and a water bottle nearby. Anything specific for a
          session is announced in the app in advance.
        </p>


        <p className="mt-12 rounded-2xl border border-forest/15 p-5 text-[15px] leading-[1.7] text-ink/70">
          A note on health: yoga can support general mobility and wellbeing, but
          Ojusvi does not treat, diagnose or cure any medical condition. If you
          have high blood pressure, a heart condition, glaucoma, osteoporosis, a
          recent surgery or injury, please check with your doctor first and tell
          your teacher in the app.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/download-app"
            className="inline-flex h-14 items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition hover:bg-forest-deep"
          >
            Start 30 days free
          </Link>
          <Link
            to="/for-families"
            className="inline-flex h-14 items-center justify-center rounded-full border border-forest/70 px-8 text-forest text-[15px] font-medium tracking-wide transition hover:bg-forest hover:text-parchment"
          >
            For families
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
