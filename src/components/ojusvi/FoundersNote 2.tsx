import { Reveal } from "./Reveal";
import { useEffect, useMemo, useRef, useState } from "react";

const PARAGRAPHS = [
  "I started Ojusvi after watching my mother go quiet. She had raised children, run a household for forty years, and then, slowly, the days began to look the same. The phone in her hand was loud, and full of strangers, but somehow lonelier than the courtyard.",
  "Ojusvi is the small thing I wish she had — a steady morning panchang, a yoga teacher who speaks Hindi, a Tambola game with people her age, a place to sing bhajans together on a Tuesday. Nothing flashy. Just company, in her language, at her pace.",
  "If it brings even one quiet hour of joy to your day, we have done what we set out to do.",
];

function ScrollBrightenNote() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  const [reduced, setReduced] = useState(false);

  const words = useMemo(
    () =>
      PARAGRAPHS.map((p) => p.split(/(\s+)/)), // keep whitespace tokens
    [],
  );
  const totalWords = useMemo(
    () =>
      words.reduce(
        (acc, tokens) => acc + tokens.filter((t) => t.trim().length > 0).length,
        0,
      ),
    [words],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setLit(totalWords);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress: 0 when top of block hits ~80% down the viewport,
      // 1 when bottom of block reaches ~30% down the viewport.
      const start = vh * 0.85;
      const end = vh * 0.25;
      const span = start - end;
      const p = Math.min(1, Math.max(0, (start - rect.top) / span));
      setLit(Math.round(p * totalWords));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [totalWords]);

  let wordIndex = -1;
  return (
    <div
      ref={containerRef}
      className="mt-10 font-serif text-forest text-[22px] md:text-[24px] leading-[1.7] text-left"
    >
      {words.map((tokens, pi) => (
        <p key={pi} className={pi === 0 ? "" : "mt-6"}>
          {tokens.map((tok, ti) => {
            if (!tok.trim()) return <span key={ti}>{tok}</span>;
            wordIndex += 1;
            const idx = wordIndex;
            let opacity = 1;
            if (!reduced) {
              if (idx < lit) opacity = 1;
              else {
                const ahead = idx - lit;
                if (ahead < 6) opacity = 1 - (ahead / 6) * 0.82;
                else opacity = 0.18;
              }
            }
            return (
              <span
                key={ti}
                style={{ opacity, willChange: "opacity" }}
                className="transition-opacity duration-300 ease-out"
              >
                {tok}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

export function FoundersNote() {
  return (
    <section id="why" className="relative bg-parchment py-12 md:py-16">
      <div className="mx-auto max-w-[680px] px-6 text-center">
        <Reveal>
          <p className="font-serif italic text-forest/85 text-sm tracking-wide">
            A note from the founder.
          </p>
          <ScrollBrightenNote />
          <div className="mt-10 font-hand text-forest text-4xl text-left">
            — Ankit
          </div>
        </Reveal>
      </div>
    </section>
  );
}
