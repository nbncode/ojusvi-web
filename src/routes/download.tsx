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

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Ojusvi - Vitality, Brilliance, Strength from within" },
      {
        name: "description",
        content:
          "Daily yoga, panchang, group satsang, gentle games, and quiet companionship — a wellness app for seniors 55+ (and their families), in your language.",
      },
      {
        property: "og:title",
        content: "Download Ojusvi - Vitality, Brilliance, Strength from within",
      },
      {
        property: "og:description",
        content:
          "A wellness, community and health app for seniors 55+ and their families — daily yoga, live Tambola, and Samvit medicine & records tracking, in your language. Start with 30 days free.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ojusvi.app/download" },
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
              url: "https://ojusvi.app/download#pricing",
            },
            {
              "@type": "Offer",
              name: "Monthly",
              price: "349",
              priceCurrency: "INR",
              description: "Billed monthly, cancel anytime.",
              url: "https://ojusvi.app/download#pricing",
            },
          ],
        }),
      },
    ],
    links: [
      { rel: "preload", as: "image", href: heroImage, fetchPriority: "high" },
      { rel: "canonical", href: "https://ojusvi.app/download" },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
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
