import { Reveal } from "./Reveal";

const languages = [
  "English",
  "हिन्दी",
  "বাংলা",
  "ગુજરાતી",
  "తెలుగు",
  "தமிழ்",
];

export function Languages() {
  return (
    <section id="languages" className="relative bg-forest text-parchment py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <Reveal>
          <p className="font-serif italic text-parchment/70 text-sm tracking-[0.18em] uppercase text-center">
            Welcome
          </p>
          <h2 className="mt-3 text-center font-serif italic text-parchment text-[40px] md:text-[52px] leading-[1.05]">
            In your language.
          </h2>
          <ul className="mt-14 flex flex-wrap items-baseline justify-center gap-x-12 gap-y-6 text-parchment">
            {languages.map((l) => (
              <li
                key={l}
                className="text-[28px] md:text-[36px] leading-tight font-serif"
              >
                {l}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
