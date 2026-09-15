import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/ojusvi/Nav";
import { Footer } from "@/components/ojusvi/Footer";

const TITLE = "About Ojusvi — An Indian Wellness App for Adults 55+";
const DESCRIPTION =
  "Ojusvi is an Indian wellness and companionship app for adults 55+, built by Ojusvi Goodhealth Private Limited — live yoga, meditation, community and everyday health tools in six Indian languages.";
const URL = "https://ojusvi.app/about";

export const Route = createFileRoute("/about")({
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
            { "@type": "ListItem", position: 2, name: "About", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: TITLE,
          url: URL,
          description: DESCRIPTION,
          about: {
            "@type": "Organization",
            name: "Ojusvi",
            legalName: "Ojusvi Goodhealth Private Limited",
            url: "https://ojusvi.app",
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-parchment text-ink">
      <Nav />
      <main className="mx-auto max-w-[760px] px-6 pt-32 pb-24 md:pt-40">
        <nav aria-label="Breadcrumb" className="text-[14px] text-ink/60">
          <Link to="/" className="underline underline-offset-4 hover:text-forest">
            Home
          </Link>
          <span aria-hidden="true" className="px-2">
            ·
          </span>
          <span>About</span>
        </nav>

        <h1 className="mt-6 font-serif italic text-forest text-[34px] sm:text-[42px] md:text-[52px] leading-[1.1]">
          About Ojusvi
        </h1>

        <p className="mt-6 text-[18px] leading-[1.75] text-ink/85">
          Ojusvi is an Indian wellness and companionship app made for adults 55
          and over, and for the families who care about them. It is built and
          run by <strong>Ojusvi Goodhealth Private Limited</strong>, from India.
        </p>

        <h2 className="mt-12 font-serif italic text-forest text-[26px] md:text-[32px]">
          Who Ojusvi is for
        </h2>
        <p className="mt-4 text-[17px] leading-[1.75] text-ink/85">
          Our members are mostly between 55 and 80. Some are newly retired and
          looking for structure in the day. Some live alone, or with children who
          are far away. Some simply want a gentle yoga class they can follow at
          their own pace, taught by a real teacher, in their own language.
          Families join too — a son or daughter often sets up the app and then
          quietly keeps an eye on the day's routine.
        </p>

        <h2 className="mt-12 font-serif italic text-forest text-[26px] md:text-[32px]">
          What we care about
        </h2>
        <ul className="mt-4 space-y-4 text-[17px] leading-[1.75] text-ink/85">
          <li>
            <strong>Physical wellness</strong> — live daily yoga, pranayama and
            breathing sessions, with seated and supported variations so nobody is
            left behind.
          </li>
          <li>
            <strong>Mental wellness</strong> — guided meditation, gentle brain
            games, and live afternoon Tambola with other members, so the day has
            company in it.
          </li>
          <li>
            <strong>Spiritual wellness</strong> — the daily panchang, bhajan and
            group satsang, for those who like to begin the day this way.
          </li>
          <li>
            <strong>Everyday health tools</strong> — Samvit, where medicines,
            reminders and health records live in one simple place.
          </li>
        </ul>

        <h2 className="mt-12 font-serif italic text-forest text-[26px] md:text-[32px]">
          Languages
        </h2>
        <p className="mt-4 text-[17px] leading-[1.75] text-ink/85">
          Ojusvi is available in six languages — English, Hindi, Bangla, Marathi,
          Telugu and Tamil. Not just the classes: every screen, so nobody has to
          navigate an unfamiliar language to reach a yoga mat.
        </p>

        <h2 className="mt-12 font-serif italic text-forest text-[26px] md:text-[32px]">
          How to reach us
        </h2>
        <p className="mt-4 text-[17px] leading-[1.75] text-ink/85">
          Email{" "}
          <a
            href="mailto:hello@ojusvi.app"
            className="text-forest underline underline-offset-4"
          >
            hello@ojusvi.app
          </a>{" "}
          or message us on WhatsApp at{" "}
          <a
            href="https://wa.me/919958905337"
            className="text-forest underline underline-offset-4"
          >
            +91 99589 05337
          </a>
          . A person reads every message.
        </p>

        <p className="mt-12 rounded-2xl border border-forest/15 bg-parchment p-5 text-[15px] leading-[1.7] text-ink/70">
          Ojusvi offers general wellness, yoga and lifestyle guidance. It is not
          medical advice, diagnosis or treatment. Please speak to your doctor
          before starting a new exercise routine, especially if you live with an
          ongoing condition or a recent injury.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/download-app"
            className="inline-flex h-14 items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition hover:bg-forest-deep"
          >
            Download the app
          </Link>
          <Link
            to="/yoga-for-seniors"
            className="inline-flex h-14 items-center justify-center rounded-full border border-forest/70 px-8 text-forest text-[15px] font-medium tracking-wide transition hover:bg-forest hover:text-parchment"
          >
            Yoga for seniors
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
