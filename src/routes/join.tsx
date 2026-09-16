import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/ojusvi/Nav";
import { Pricing } from "@/components/ojusvi/Pricing";
import { PillarsSection } from "@/components/ojusvi/PillarsSection";
import { DayTimeline } from "@/components/ojusvi/DayTimeline";
import { Voices } from "@/components/ojusvi/Voices";
import { Languages } from "@/components/ojusvi/Languages";
import { FAQ } from "@/components/ojusvi/FAQ";
import { Footer } from "@/components/ojusvi/Footer";
import { StickyMobileCTA } from "@/components/ojusvi/StickyMobileCTA";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join Ojusvi — Senior Wellness Membership in India" },
      {
        name: "description",
        content:
          "Join Ojusvi's daily live yoga, meditation, community activities and health tools for adults 55+. Choose Lite, Monthly or Annual — start with 30 days free.",
      },
      {
        property: "og:title",
        content: "Join Ojusvi — Senior Wellness Membership in India",
      },
      {
        property: "og:description",
        content:
          "Daily live yoga, meditation, panchang, satsang, Tambola and health tools for adults 55+. Pick a plan and start with 30 days free.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ojusvi.app/join" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Join Ojusvi — Senior Wellness Membership in India",
      },
      {
        name: "twitter:description",
        content:
          "Daily live yoga, meditation, panchang, satsang, Tambola and health tools for adults 55+. Pick a plan and start with 30 days free.",
      },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/join" }],
  }),
  component: JoinPage,
});

function JoinPage() {
  return (
    <div className="relative min-h-screen bg-parchment text-ink">
      <Nav />
      <main className="relative z-[2] pb-24 md:pb-0">
        <Pricing />
        <PillarsSection />
        <DayTimeline />
        <Voices />
        <Languages />
        <FAQ
          pricingHref="#pricing"
          questions={[
            "How do the sessions work?",
            "What do I need for a session?",
            "How long are the sessions?",
            "Which devices can I use?",
            "Which languages does Ojusvi support?",
            "What's the difference between the monthly and annual plans?",
            "Why is the annual plan cheaper?",
            "Can I cancel?",
            "How do I subscribe?",
            "How can I reach you?",
          ]}
        />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
