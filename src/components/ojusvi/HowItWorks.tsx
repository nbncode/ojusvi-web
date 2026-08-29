import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Download the app.",
    body: "Free on iPhone and Android. A one-tap install, nothing more.",
  },
  {
    n: "02",
    title: "Pick your language.",
    body: "Hindi, Bangla, Gujarati, Telugu, Tamil — six in all. Everything inside speaks back to you in your tongue.",
  },
  {
    n: "03",
    title: "Join tomorrow's sessions.",
    body: "Yoga sessions, panchang, meditation, health trackers",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative bg-parchment-deep/40 py-12 md:py-16"
    >
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <Reveal>
          <p className="text-center font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
            How it works
          </p>
          <h2 className="mt-4 text-center font-serif italic text-forest text-[36px] md:text-[52px] leading-[1.05]">
            Three small steps. Then, a gentler morning.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="relative">
                <p className="font-hand text-amber text-5xl leading-none">
                  {s.n}
                </p>
                <h3 className="mt-4 font-serif italic text-forest text-[26px] md:text-[30px] leading-[1.2]">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-[340px] text-[16px] leading-[1.65] text-ink/80">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
