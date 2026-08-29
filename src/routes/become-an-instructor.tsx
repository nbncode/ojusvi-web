import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Nav } from "@/components/ojusvi/Nav";
import { Footer } from "@/components/ojusvi/Footer";
import { Sprig } from "@/components/ojusvi/Sprig";
import { supabase } from "@/integrations/supabase/client";

const SKILLS = [
  "Acoustic Guitar",
  "Acrylic Painting",
  "Acting",
  "Antakashari",
  "Art & Craft",
  "Bhagwad Gita",
  "Breathwork And Meditation",
  "Calligraphy",
  "Charcoal Drawing",
  "Dance Workout",
  "Digital Painting",
  "Drawing, Painting, Sketching",
  "Fat Loss And Strength Training",
  "Fitness Training",
  "Gentle Aerobics",
  "Guided Meditation",
  "Guitar",
  "Hand Sketches",
  "Harmonium",
  "Hindustani Classical Music",
  "Kathak Dance",
  "Lalitha Sahasranamam",
  "Meditation",
  "Mobility Fitness",
  "Nada Yoga Through Sounds",
  "Paintings",
  "Paper Quilling Workshop",
  "Photography",
  "Pranayama",
  "Sanskrit Language",
  "Singing / Karaoke",
  "Sound Bath Guided Meditation",
  "Sri Pancharatra Agama",
  "Sudoku",
  "Sundarakandam",
  "Sunrise Meditation",
  "Surya Namaskar",
  "Tabla",
  "Tambola",
  "Vishnu Sahasranamam",
  "Watercolor Painting",
  "Yoga",
  "Yogic Living",
  "Zumba",
  "Others",
];

const AVAILABILITY = ["All Days", "Weekdays", "Weekends"];

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  social: z.string().trim().min(1, "Please share an Instagram or Facebook ID").max(200),
  whatsapp: z
    .string()
    .trim()
    .min(5, "Please enter a valid WhatsApp number")
    .max(20)
    .regex(/^[+\d\s-]+$/, "Only digits, spaces, + and - allowed"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  skill: z.string().min(1, "Please choose a skill"),
  availability: z.string().min(1, "Please choose your availability"),
});

export const Route = createFileRoute("/become-an-instructor")({
  head: () => ({
    meta: [
      { title: "Become an Instructor — Ojusvi" },
      {
        name: "description",
        content:
          "Teach yoga, music, cooking, satsang and more on Ojusvi. Reach thousands of housewives and seniors across India.",
      },
      { property: "og:title", content: "Become an Instructor — Ojusvi" },
      {
        property: "og:description",
        content:
          "Share what you love with a kind, growing community on Ojusvi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ojusvi.app/become-an-instructor" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/become-an-instructor" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Become an Instructor — Ojusvi",
          url: "https://ojusvi.app/become-an-instructor",
          description:
            "Teach yoga, music, cooking, satsang and more on Ojusvi. Reach thousands of housewives and seniors across India.",
          isPartOf: { "@type": "WebSite", name: "Ojusvi", url: "https://ojusvi.app" },
        }),
      },
    ],
  }),
  component: BecomeAnInstructor,
});

const BENEFITS = [
  { t: "Engaged audience", d: "Reach housewives 35+ and seniors 55+ who show up consistently." },
  { t: "Live & meaningful", d: "Host real classes — yoga, music, cooking, satsang and more." },
  { t: "Fair earnings", d: "Transparent payouts and gentle pricing that respects everyone." },
  { t: "We handle the tech", d: "Scheduling, reminders, payments — all taken care of." },
  { t: "Indian languages", d: "Teach in Hindi, English or your regional language." },
  { t: "Kind community", d: "Safe, ad-free, no toxicity — just learners who care." },
];

function BecomeAnInstructor() {
  const [form, setForm] = useState({
    name: "",
    social: "",
    whatsapp: "",
    email: "",
    skill: "",
    availability: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error: insertError } = await supabase
      .from("instructor_applications")
      .insert({
        name: parsed.data.name,
        social: parsed.data.social,
        whatsapp: parsed.data.whatsapp,
        email: parsed.data.email,
        skill: parsed.data.skill,
        availability: parsed.data.availability,
      });
    setLoading(false);
    if (insertError) {
      setError("Something went wrong. Please try again, or write to hello@ojusvi.app.");
      return;
    }
    setDone(true);
  };

  const inputCls =
    "mt-2 w-full h-12 rounded-xl border border-forest/25 bg-parchment px-4 text-[16px] text-ink focus:outline-none focus:border-forest";

  return (
    <div className="relative min-h-screen bg-parchment text-ink">
      <Nav />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="pt-32 md:pt-40 pb-16 md:pb-24">
          <div className="mx-auto max-w-[820px] px-6 text-center">
            <p className="font-serif italic text-forest/85 text-sm tracking-[0.22em] uppercase">
              For teachers, coaches & elders
            </p>
            <h1 className="mt-4 font-serif italic text-forest text-[44px] md:text-[64px] leading-[1.02]">
              Teach what you love. <br className="hidden md:block" />
              Reach the homes of India.
            </h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[17px] md:text-[18px] leading-[1.7] text-ink/80">
              Ojusvi connects passionate instructors with thousands of housewives
              and seniors looking to learn, practice and grow — through live
              classes, gentle guidance and joyful sessions.
            </p>
            <a
              href="#register"
              className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest-deep"
            >
              Register as Instructor
            </a>
          </div>
        </section>

        {/* Why */}
        <section className="py-16 md:py-24 bg-parchment-deep/60">
          <div className="mx-auto max-w-[1100px] px-6">
            <p className="font-serif italic text-forest/85 text-sm tracking-[0.22em] uppercase">
              Why Ojusvi
            </p>
            <h2 className="mt-3 font-serif italic text-forest text-[36px] md:text-[48px] leading-[1.05] max-w-[20ch]">
              A warm, growing community waiting for you.
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS.map((b) => (
                <div
                  key={b.t}
                  className="rounded-2xl border border-forest/15 bg-parchment p-6"
                >
                  <div className="flex items-center gap-2 text-forest">
                    <Sprig />
                    <h3 className="font-serif italic text-[22px] leading-tight">
                      {b.t}
                    </h3>
                  </div>
                  <p className="mt-3 text-[16px] leading-[1.7] text-ink/80">
                    {b.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section id="register" className="py-20 md:py-28">
          <div className="mx-auto max-w-[640px] px-6">
            <p className="font-serif italic text-forest/85 text-sm tracking-[0.22em] uppercase">
              Apply now
            </p>
            <h2 className="mt-3 font-serif italic text-forest text-[34px] md:text-[44px] leading-[1.05]">
              Register as an Ojusvi Instructor.
            </h2>
            <p className="mt-4 text-[17px] leading-[1.7] text-ink/80">
              Tell us about yourself. Our team will reach out within a few days.
            </p>

            {done ? (
              <div className="mt-10 rounded-3xl border border-forest/20 bg-parchment-deep/60 p-10 text-center">
                <p className="font-serif italic text-forest text-[26px] leading-[1.2]">
                  Thank you — we'll be in touch soon. 🙏
                </p>
                <p className="mt-3 text-ink/85">
                  We've received your application. If you'd like to share more, write to us at{" "}
                  <a className="underline" href="mailto:hello@ojusvi.app">
                    hello@ojusvi.app
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="mt-10 rounded-3xl border border-forest/15 bg-parchment p-6 md:p-8 space-y-5"
              >
                <div>
                  <label className="font-serif italic text-forest text-[15px]">
                    Full name
                  </label>
                  <input value={form.name} onChange={update("name")} required maxLength={100} className={inputCls} />
                </div>
                <div>
                  <label className="font-serif italic text-forest text-[15px]">
                    Instagram ID / Facebook ID
                  </label>
                  <input
                    value={form.social}
                    onChange={update("social")}
                    required
                    maxLength={200}
                    placeholder="@yourhandle or profile link"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-serif italic text-forest text-[15px]">
                    WhatsApp phone number
                  </label>
                  <input
                    value={form.whatsapp}
                    onChange={update("whatsapp")}
                    required
                    maxLength={20}
                    inputMode="tel"
                    placeholder="+91 98765 43210"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-serif italic text-forest text-[15px]">
                    Email ID
                  </label>
                  <input
                    value={form.email}
                    onChange={update("email")}
                    required
                    maxLength={255}
                    type="email"
                    inputMode="email"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-serif italic text-forest text-[15px]">
                    Skill
                  </label>
                  <select value={form.skill} onChange={update("skill")} required className={inputCls}>
                    <option value="">Choose a skill…</option>
                    {SKILLS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-serif italic text-forest text-[15px]">
                    Availability
                  </label>
                  <select value={form.availability} onChange={update("availability")} required className={inputCls}>
                    <option value="">Choose availability…</option>
                    {AVAILABILITY.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {error ? (
                  <p className="text-[15px] text-terracotta">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest-deep disabled:opacity-60"
                >
                  {loading ? "Submitting…" : "Submit application"}
                </button>
              </form>
            )}

            <p className="mt-10 text-sm">
              <Link to="/" className="text-forest underline underline-offset-4">
                ← Back to home
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
