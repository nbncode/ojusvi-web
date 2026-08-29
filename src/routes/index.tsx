import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/ojusvi/Nav";
import { Hero } from "@/components/ojusvi/Hero";
import { FoundersNote } from "@/components/ojusvi/FoundersNote";
import { HowItWorks } from "@/components/ojusvi/HowItWorks";
import { PillarsSection } from "@/components/ojusvi/PillarsSection";
import { DayTimeline } from "@/components/ojusvi/DayTimeline";
import { Voices } from "@/components/ojusvi/Voices";
import { FAQ } from "@/components/ojusvi/FAQ";
import { Pricing } from "@/components/ojusvi/Pricing";
import { Languages } from "@/components/ojusvi/Languages";
import { Footer } from "@/components/ojusvi/Footer";
import { StickyMobileCTA } from "@/components/ojusvi/StickyMobileCTA";
import heroImage from "@/assets/hero-yoga.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ojusvi - Vitality, Brilliance, Strength from within" },
      {
        name: "description",
        content:
          "Daily yoga, panchang, group satsang, gentle games, and quiet companionship — a wellness app for seniors 55+ (and their families), in your language.",
      },
      { property: "og:title", content: "Ojusvi - Vitality, Brilliance, Strength from within" },
      {
        property: "og:description",
        content:
          "A wellness, community and health app for seniors 55+ and their families — daily yoga, live Tambola, and Samvit medicine & records tracking, in your language. Start with 30 days free.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ojusvi.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Ojusvi Membership",
          description:
            "Daily yoga, live Tambola, and Samvit medicine & health-record tracking for seniors 55+.",
          brand: { "@type": "Brand", name: "Ojusvi" },
          offers: [
            {
              "@type": "Offer",
              name: "Annual",
              price: "2988",
              priceCurrency: "INR",
              description: "Billed once for 12 months (₹249/month).",
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { q: "What is Ojusvi?", a: "Ojusvi (ओजस्वी) is a wellness and companionship app for seniors. It brings daily live yoga, guided meditation, panchang and group bhajan/satsang, gentle brain games, live afternoon Tambola with the community, and Samvit — a medicine, records and health tracker — all in your language, from the comfort of home." },
            { q: "Which languages does Ojusvi support?", a: "English, Hindi, Bangla, Gujarati, Telugu, Tamil. Every screen in your language." },
            { q: "How do the sessions work?", a: "A real teacher, on video, at a fixed time each day. You join from the app, see the others in the class, and follow along." },
            { q: "Can I try it before paying?", a: "Yes. Every user gets the first 30 days completely free, no card needed. You only pay if you decide to continue." },
            { q: "Is my data safe?", a: "We never share your number. Health entries stay encrypted on our servers and are visible only to you. Read our two-minute privacy policy for the details." },
            { q: "Can I share Ojusvi with my mother / sister / friend?", a: "Please do. Refer a friend and you both get an extra month free. Family plans are coming soon." },
            { q: "What do I need for a session?", a: "We recommend having the following ready: comfortable clothing, a yoga mat, one yoga belt, two yoga blocks, a pillow or cushion, and a water bottle. Any specific requirement for a session is communicated in the app in advance." },
            { q: "Who can join Ojusvi?", a: "Anyone seeking better physical health, mental peace, and spiritual well-being is welcome. Ojusvi is designed especially for seniors 55+ and their families." },
            { q: "How do I subscribe?", a: "You can subscribe through the website itself — see plans." },
            { q: "What's the difference between the monthly and annual plans?", a: "Annual is one payment of ₹2,988 for 12 months (works out to ₹249/month). Monthly is ₹349/month, billed each month." },
            { q: "Why is the annual plan cheaper?", a: "You commit for the year, so we pass the saving back — ₹249/month instead of ₹349." },
            { q: "Can I cancel?", a: "The monthly plan can be cancelled anytime from your UPI or bank app; you keep access to the end of the paid month. The annual plan gives you all 12 months upfront and isn't refundable for unused months if you leave early." },
            { q: "What types of sessions are offered?", a: "Ojusvi offers yoga, pranayama, guided meditation, breathing exercises, and holistic wellness sessions, along with devotional content — all thoughtfully designed for different health goals and spiritual needs." },
            { q: "How long are the sessions?", a: "Sessions typically range from 45 to 60 minutes." },
            { q: "Which devices can I use?", a: "Ojusvi works on Android and iOS smartphones and tablets." },
            { q: "Will the instructors change over time?", a: "Instructors may be rotated periodically. However, all sessions are led by certified wellness professionals, and Ojusvi maintains a consistent standard of quality and care across all instructors." },
            { q: "I'm facing technical issues. How can I get help?", a: "Please reach out to our support team on email or on whatsapp or through in-app chat and we'll be happy to assist you." },
          ].map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
    links: [
      { rel: "preload", as: "image", href: heroImage, fetchPriority: "high" },
      { rel: "canonical", href: "https://ojusvi.app/" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-parchment text-ink">
      <Nav />
      <main className="relative z-[2] pb-24 md:pb-0">
        <Hero />
        <FoundersNote />
        <HowItWorks />
        <PillarsSection />
        <DayTimeline />
        <Voices />
        <Pricing />
        <Languages />
        <FAQ />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
