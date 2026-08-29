import { useState } from "react";
import { Reveal } from "./Reveal";
import { Sprig } from "./Sprig";
import {
  Flower2,
  Flame,
  CalendarHeart,
  BellRing,
  Brain,
  Users,
  FileHeart,
  Activity,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

type Benefit = {
  Icon: LucideIcon;
  headline: string;
  description: React.ReactNode;
};

const benefits: Benefit[] = [
  {
    Icon: Flower2,
    headline: "Build a healthier daily routine",
    description: (
      <>
        Join <strong className="font-semibold text-forest">structured group yoga sessions</strong> with multiple daily time slots that fit your schedule.
      </>
    ),
  },
  {
    Icon: Flame,
    headline: "Reduce stress and find inner peace",
    description: (
      <>
        Practice <strong className="font-semibold text-forest">meditation</strong>, join Bhajan Clubbing, and attend satsang to calm your mind and nourish your spirit.
      </>
    ),
  },
  {
    Icon: CalendarHeart,
    headline: "Stay connected to your traditions",
    description: (
      <>
        Access <strong className="font-semibold text-forest">Panchang, upcoming vrats, festivals</strong>, and auspicious timings — all in one place.
      </>
    ),
  },
  {
    Icon: BellRing,
    headline: "Never miss your medicines",
    description: (
      <>
        Receive timely <strong className="font-semibold text-forest">reminders for medicines</strong> and hydration to help you stay consistent every day.
      </>
    ),
  },
  {
    Icon: FileHeart,
    headline: "Keep your medical records organized",
    description: (
      <>
        Store and instantly find prescriptions, reports, and health documents using an <strong className="font-semibold text-forest">AI-powered medical record keeper</strong>.
      </>
    ),
  },
  {
    Icon: Activity,
    headline: "See your health improving",
    description: (
      <>
        <strong className="font-semibold text-forest">Track your weight, blood pressure, blood sugar</strong>, and other health metrics over time.
      </>
    ),
  },
  {
    Icon: Brain,
    headline: "Keep your mind sharp",
    description: (
      <>
        Play engaging brain games designed to <strong className="font-semibold text-forest">improve memory, focus, and mental agility</strong> while having fun.
      </>
    ),
  },
  {
    Icon: Users,
    headline: "Stay socially connected",
    description: (
      <>
        Play <strong className="font-semibold text-forest">live Tambola with friends</strong> and the Ojusvi community, wherever you are.
      </>
    ),
  },
];

export function Pricing() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  return (
    <>
    <section id="membership" className="relative bg-parchment py-12 md:py-16">
      <div className="mx-auto max-w-[760px] px-6 text-center">
        <Reveal>
          <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
            Membership
          </p>
          <h2 className="mt-4 font-serif italic text-forest text-[44px] md:text-[60px] leading-[1.05]">
            Everything you need for a healthier, happier life.
          </h2>
          <p className="mt-6 text-ink/75 text-[17px] leading-[1.7]">
            From physical fitness and mental wellness to spiritual growth and preventive healthcare, Ojusvi helps you build healthy habits that last.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 md:mt-20 max-w-[1160px] px-6">
        {/* Mobile: compact 2-col accordion tiles */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {benefits.map(({ Icon, headline, description }, i) => {
            const isOpen = openIdx === i;
            return (
              <button
                key={headline}
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={`text-left rounded-2xl border p-3 transition-colors ${
                  isOpen
                    ? "col-span-2 border-forest/25 bg-parchment-deep"
                    : "border-forest/10 bg-parchment-deep/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment-deep text-forest">
                    <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="min-w-0 flex-1 font-serif font-semibold text-forest text-[14px] leading-[1.2]">
                    {headline}
                  </h3>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 text-forest/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isOpen && (
                  <p className="mt-3 text-ink/75 text-[13px] leading-[1.5]">
                    {description}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Tablet & desktop: original grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {benefits.map(({ Icon, headline, description }, i) => (
            <Reveal key={headline} delay={i * 60}>
              <div className="group h-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-parchment-deep text-forest transition-shadow duration-300 group-hover:shadow-[0_6px_20px_-10px_rgba(31,58,43,0.45)]">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-serif font-semibold text-forest text-[20px] md:text-[22px] leading-[1.2]">
                  {headline}
                </h3>
                <p className="mt-3 text-ink/75 text-[15px] leading-[1.55]">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    <section id="pricing" className="relative bg-parchment py-12 md:py-16">
      <div className="mx-auto max-w-[1080px] px-6">
        <Reveal>
          <div className="text-center">
            <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
              Pricing
            </p>
            <h3 className="font-serif italic text-forest text-[36px] md:text-[48px] leading-[1.1]">
              Choose the plan that suits you.
            </h3>
            <p className="mt-4 text-ink/70 text-[16px] md:text-[17px]">
              Cancel the monthly plan anytime.
            </p>
            <p className="mt-6 mx-auto max-w-[620px] font-serif italic text-forest text-[18px] md:text-[20px] leading-[1.5]">
              Every plan starts with 30 days free. No card needed. Pay only if you choose to stay.
            </p>
          </div>

          {/* Mobile: tabbed switcher */}
          <div className="mt-8 md:hidden">
            <div
              role="tablist"
              aria-label="Choose a plan"
              className="mx-auto flex max-w-[360px] rounded-full border border-forest/20 bg-parchment-deep/40 p-1"
            >
              <button
                role="tab"
                aria-selected={plan === "annual"}
                onClick={() => setPlan("annual")}
                className={`flex-1 rounded-full py-2.5 text-[13px] font-medium tracking-wide transition ${
                  plan === "annual" ? "bg-forest text-parchment" : "text-forest/70"
                }`}
              >
                Annual · Save ₹1,200
              </button>
              <button
                role="tab"
                aria-selected={plan === "monthly"}
                onClick={() => setPlan("monthly")}
                className={`flex-1 rounded-full py-2.5 text-[13px] font-medium tracking-wide transition ${
                  plan === "monthly" ? "bg-forest text-parchment" : "text-forest/70"
                }`}
              >
                Monthly
              </button>
            </div>

            <div className="mt-6">
              {plan === "annual" ? (
                <div className="relative rounded-[4px] bg-parchment-deep border-2 border-forest px-6 py-10 shadow-[0_20px_50px_-20px_rgba(31,58,43,0.45)]">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-forest px-4 py-1 text-parchment text-[11px] font-medium tracking-[0.18em] uppercase">
                    Best Value
                  </span>
                  <div className="text-center">
                    <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">Annual</p>
                    <p className="mt-3 inline-flex items-center rounded-full bg-amber/15 px-3 py-1 text-amber text-[11px] font-medium tracking-[0.16em] uppercase">
                      First 30 days free
                    </p>
                    <p className="mt-4 font-serif text-forest text-[64px] leading-none">
                      ₹249<span className="ml-1 font-sans text-[15px] tracking-wide text-forest/80 align-middle">/month</span>
                    </p>
                    <p className="mt-3 font-serif italic text-forest/70 text-[14px]">Billed once — ₹2,988 for the year</p>
                    <p className="mt-2 font-serif italic text-amber text-[15px]">Save ₹1,200 a year vs monthly</p>
                  </div>
                  <div className="mt-8 text-center">
                    <a href="https://ojusvi.app/pay" className="inline-flex h-14 w-full max-w-[280px] mx-auto items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest-deep">
                      Pay for the year — ₹2,988
                    </a>
                    <p className="mt-3 md:hidden">
                      <a href="/download-app" className="font-serif italic text-forest/80 text-[14px] underline underline-offset-4 decoration-forest/40 hover:decoration-forest">
                        or start 30 days free →
                      </a>
                    </p>
                    <p className="mt-4 font-serif italic text-forest/70 text-[13px]">One payment. No monthly reminders.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[4px] bg-parchment-deep/60 border border-forest/20 px-6 py-10 shadow-[0_10px_30px_-20px_rgba(31,58,43,0.25)]">
                  <div className="text-center">
                    <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">Monthly</p>
                    <p className="mt-3 inline-flex items-center rounded-full bg-amber/15 px-3 py-1 text-amber text-[11px] font-medium tracking-[0.16em] uppercase">
                      First 30 days free
                    </p>
                    <p className="mt-4 font-serif text-forest text-[56px] leading-none">
                      ₹349<span className="ml-1 font-sans text-[14px] tracking-wide text-forest/80 align-middle">/month</span>
                    </p>
                    <p className="mt-3 font-serif italic text-forest/70 text-[14px]">Billed every month · Cancel anytime</p>
                  </div>
                  <div className="mt-8 text-center">
                    <a href="/download-app" className="inline-flex h-14 w-full max-w-[280px] mx-auto items-center justify-center rounded-full border border-forest bg-transparent px-8 text-forest text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest hover:text-parchment">
                      Start 30 days free
                    </a>
                    <p className="mt-4 font-serif italic text-forest/70 text-[13px]">Small monthly payment. Stop whenever you like.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: original two-card layout */}
          <div className="mt-10 md:mt-14 hidden md:grid grid-cols-2 gap-8 items-stretch">
            {/* Card 1 — Annual (Recommended) */}
            <div className="order-1 md:order-1 relative rounded-[4px] bg-parchment-deep border-2 border-forest px-7 py-12 md:px-10 md:py-14 shadow-[0_20px_50px_-20px_rgba(31,58,43,0.45)] md:-translate-y-2 flex flex-col">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-forest px-4 py-1 text-parchment text-[11px] font-medium tracking-[0.18em] uppercase">
                Best Value
              </span>
              <div className="text-center">
                <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
                  Annual
                </p>
                <p className="mt-3 inline-flex items-center rounded-full bg-amber/15 px-3 py-1 text-amber text-[11px] font-medium tracking-[0.16em] uppercase">
                  First 30 days free
                </p>
                <p className="mt-4 font-serif text-forest text-[72px] md:text-[88px] leading-none">
                  ₹249
                  <span className="ml-1 font-sans text-[15px] tracking-wide text-forest/80 align-middle">
                    /month
                  </span>
                </p>
                <p className="mt-3 font-serif italic text-forest/70 text-[15px]">
                  Billed once — ₹2,988 for the year
                </p>
                <p className="mt-2 font-serif italic text-amber text-[16px]">
                  Save ₹1,200 a year vs monthly
                </p>
              </div>

              <div className="mt-auto pt-10 text-center">
                <a
                  href="https://ojusvi.app/pay"
                  className="inline-flex h-14 w-full max-w-[280px] mx-auto items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest-deep"
                >
                  Pay for the year — ₹2,988
                </a>
                <p className="mt-4 font-serif italic text-forest/70 text-[14px]">
                  One payment. No monthly reminders.
                </p>
              </div>
            </div>

            {/* Card 2 — Monthly */}
            <div className="order-2 md:order-2 rounded-[4px] bg-parchment-deep/60 border border-forest/20 px-7 py-10 md:px-10 md:py-12 shadow-[0_10px_30px_-20px_rgba(31,58,43,0.25)] flex flex-col">
              <div className="text-center">
                <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
                  Monthly
                </p>
                <p className="mt-3 inline-flex items-center rounded-full bg-amber/15 px-3 py-1 text-amber text-[11px] font-medium tracking-[0.16em] uppercase">
                  First 30 days free
                </p>
                <p className="mt-4 font-serif text-forest text-[56px] md:text-[64px] leading-none">
                  ₹349
                  <span className="ml-1 font-sans text-[14px] tracking-wide text-forest/80 align-middle">
                    /month
                  </span>
                </p>
                <p className="mt-3 font-serif italic text-forest/70 text-[15px]">
                  Billed every month · Cancel anytime
                </p>
              </div>

              <div className="mt-auto pt-10 text-center">
                <a
                  href="/download-app"
                  className="inline-flex h-14 w-full max-w-[280px] mx-auto items-center justify-center rounded-full border border-forest bg-transparent px-8 text-forest text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest hover:text-parchment"
                >
                  Start 30 days free
                </a>
                <p className="mt-4 font-serif italic text-forest/70 text-[14px]">
                  Small monthly payment. Stop whenever you like.
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 text-forest/70 text-[14px]">
            {[
              "Prices include 18% GST",
              "Cancel the monthly plan anytime",
              "Annual saves you nearly 29% (₹249/month instead of ₹349)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Sprig size={12} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center font-serif italic text-forest/80 text-[16px]">
            Refer a friend — both of you get a month on us.
          </p>
        </Reveal>
      </div>
    </section>
    </>
  );
}
