import { Polaroid } from "./Polaroid";
import { Reveal } from "./Reveal";
import { Sprig } from "./Sprig";
import { Fragment } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import trioAsset from "@/assets/yoga-program-trio.webp.asset.json";
import breathworkAsset from "@/assets/yoga-program-breathwork.webp.asset.json";
import { WellnessWheel } from "./WellnessWheel";

const pillars = [
  {
    figure: "8",
    title: "Wellness Codes",
    body: "Designed to cover every key wellness need — from mobility to recovery.",
  },
  {
    figure: "6",
    title: "Days Every Week",
    body: "A planned weekly rhythm, so you never have to guess what to practice today.",
  },
  {
    figure: "52",
    title: "Week Progression",
    body: "The routine gradually builds capacity, with recovery weeks built in.",
  },
];

const stages = [
  { name: "Learn", body: "Base version, slower pace." },
  { name: "Build", body: "Slightly higher volume." },
  { name: "Progress", body: "Peak week where tolerated." },
  { name: "Deload", body: "Reduced intensity, longer relaxation." },
];

export function YogaSystem() {
  return (
    <section
      id="program"
      aria-labelledby="program-heading"
      className="relative bg-parchment py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Header */}
        <Reveal>
          <p className="text-center font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
            A structured program
          </p>
          <h2
            id="program-heading"
            className="mt-3 text-center font-serif italic text-forest text-[36px] sm:text-[44px] md:text-[56px] leading-[1.05]"
          >
            Not random yoga.
            <br className="hidden sm:block" />
            <span> </span>A 52-week wellness system.
          </h2>
          <p className="mx-auto mt-6 max-w-[680px] text-center text-[17px] leading-[1.65] text-ink/80">
            Six guided sessions every week, planned across mobility, breathwork,
            metabolic health, joint care, stress relief, sleep, strength,
            balance and recovery.
          </p>
        </Reveal>

        {/* Intro + 3 pillars + photo */}
        <div className="mt-16 grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <Reveal>
              <p className="max-w-[520px] text-[17px] leading-[1.7] text-ink/80">
                Ojusvi sessions are not standalone yoga videos. They are part of
                a structured six-days-a-week wellness calendar, designed to give
                your body the right mix of movement, breathwork, strength,
                balance, recovery and condition-aware care.
              </p>
            </Reveal>

            {/* Desktop / tablet: grid of cards */}
            <div className="mt-10 hidden sm:grid grid-cols-3 gap-5">
              {pillars.map((p, i) => (
                <Reveal key={p.title} delay={i * 80}>
                  <div className="h-full bg-parchment-deep rounded-[2px] p-6 shadow-[0_8px_30px_-20px_rgba(31,58,43,0.25)]">
                    <span aria-hidden="true" className="inline-flex text-sage">
                      <Sprig size={18} />
                    </span>
                    <p className="mt-3 font-serif italic text-forest text-[44px] leading-none">
                      {p.figure}
                    </p>
                    <h3 className="mt-2 font-serif italic text-forest text-[20px]">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.6] text-ink/80">
                      {p.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            {/* Mobile: collapsible accordion */}
            <Accordion
              type="single"
              collapsible
              defaultValue="pillar-0"
              className="mt-8 sm:hidden bg-parchment-deep rounded-[2px] shadow-[0_8px_30px_-20px_rgba(31,58,43,0.25)] px-4"
            >
              {pillars.map((p, i) => (
                <AccordionItem
                  key={p.title}
                  value={`pillar-${i}`}
                  className="border-b border-forest/10 last:border-b-0"
                >
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <span className="flex items-center gap-3">
                      <span className="font-serif italic text-forest text-[28px] leading-none">
                        {p.figure}
                      </span>
                      <span className="font-serif italic text-forest text-[17px]">
                        {p.title}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-[15px] leading-[1.6] text-ink/80">
                    {p.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <Reveal delay={120}>
              <Polaroid rotate={-2}>
                <img
                  src={trioAsset.url}
                  alt="Structured Ojusvi yoga wellness program visual"
                  loading="lazy"
                  decoding="async"
                  className="block w-[280px] sm:w-[360px] md:w-[400px] h-auto object-cover"
                  style={{ aspectRatio: "4 / 5" }}
                />
              </Polaroid>
            </Reveal>
          </div>
        </div>

        {/* Eight wellness codes */}
        <div className="mt-24">
          <Reveal>
            <p className="text-center font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
              The eight wellness codes
            </p>
          </Reveal>
          <WellnessWheel />
        </div>

        {/* Monthly rhythm */}
        <div className="mt-24">
          <Reveal>
            <p className="text-center font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
              Monthly rhythm
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
            {stages.map((s, i) => (
              <Fragment key={s.name}>
                <Reveal delay={i * 80}>
                  <div className="h-full bg-parchment-deep rounded-[2px] p-5 text-center shadow-[0_8px_30px_-20px_rgba(31,58,43,0.25)]">
                    <h3 className="font-serif italic text-forest text-[22px]">
                      {s.name}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.55] text-ink/80">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
                {i < stages.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="hidden md:flex items-center justify-center text-sage"
                  >
                    <Sprig size={22} />
                  </div>
                ) : null}
              </Fragment>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-12 overflow-hidden rounded-[2px] bg-parchment-deep shadow-[0_8px_30px_-20px_rgba(31,58,43,0.25)]">
              <img
                src={breathworkAsset.url}
                alt="Ojusvi 52-week yoga calendar progression visual"
                loading="lazy"
                decoding="async"
                className="block w-full h-auto object-cover"
                style={{ aspectRatio: "16 / 7" }}
              />
            </div>
          </Reveal>
        </div>

        {/* Closing + CTA */}
        <Reveal>
          <p className="mx-auto mt-20 max-w-[680px] text-center font-serif italic text-forest text-[20px] md:text-[24px] leading-[1.5]">
            Regular yoga apps make you choose what to watch. Ojusvi gives you a
            planned routine for today — and a complete wellness path for the
            year.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/download-app"
              className="inline-flex items-center justify-center rounded-full bg-forest px-7 py-3 font-sans text-[15px] tracking-wide text-parchment shadow-[0_10px_30px_-12px_rgba(12,62,47,0.5)] transition-transform hover:scale-[1.02]"
            >
              Start today's session
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}