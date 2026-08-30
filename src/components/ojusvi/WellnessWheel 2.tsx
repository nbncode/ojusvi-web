import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useIsMobile } from "@/hooks/use-mobile";
import codeA from "@/assets/codes/A.webp.asset.json";
import codeB from "@/assets/codes/B.webp.asset.json";
import codeC from "@/assets/codes/C.webp.asset.json";
import codeD from "@/assets/codes/D.webp.asset.json";
import codeE from "@/assets/codes/E.webp.asset.json";
import codeF from "@/assets/codes/F.webp.asset.json";
import codeG from "@/assets/codes/G.webp.asset.json";
import codeH from "@/assets/codes/H.webp.asset.json";
import ojusviIcon from "@/assets/ojusvi-icon.webp.asset.json";

type Code = {
  letter: string;
  title: string;
  body: string;
  icon: string;
};

const codes: Code[] = [
  { letter: "A", title: "Mobility & Breath", body: "For stiffness, flexibility, joint opening and breath awareness.", icon: codeA.url },
  { letter: "B", title: "BP & Stress Safe", body: "A calm, low-strain practice for relaxation and nervous system balance.", icon: codeB.url },
  { letter: "C", title: "Metabolic Health", body: "Focused on diabetes, cholesterol, fatty liver, obesity and abdominal weight.", icon: codeC.url },
  { letter: "D", title: "Joint & Back Pain", body: "Gentle practices for osteoarthritis, spine comfort and joint mobility.", icon: codeD.url },
  { letter: "E", title: "Thyroid & Energy", body: "Supports energy rhythm, fatigue management and gentle activation.", icon: codeE.url },
  { letter: "F", title: "Sleep & Anxiety Reset", body: "Slow, calming sessions for better sleep and nervous system recovery.", icon: codeF.url },
  { letter: "G", title: "Strength & Balance", body: "Builds posture, stability, balance and core strength.", icon: codeG.url },
  { letter: "H", title: "Gentle Recovery", body: "A conservative session for pain-sensitive or BP-sensitive days.", icon: codeH.url },
];

const VIEW = 520;
const CENTER = VIEW / 2;

export function WellnessWheel() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState(0);
  const lineRef = useRef<SVGLineElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const iconRefs = useRef<Array<SVGGElement | null>>([]);
  const haloRefs = useRef<Array<SVGCircleElement | null>>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pulseTweens = useRef<Array<gsap.core.Tween | null>>([]);
  const demoTimeouts = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const hasDemoedRef = useRef(false);
  const userInteractedRef = useRef(false);
  const prefersReducedMotion = useRef(false);

  const radius = isMobile ? 175 : 210;
  const hubR = isMobile ? 58 : 64;
  const nodeR = isMobile ? 40 : 36;

  const positions = useMemo(
    () =>
      codes.map((_, i) => {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        return {
          x: CENTER + radius * Math.cos(angle),
          y: CENTER + radius * Math.sin(angle),
        };
      }),
    [radius],
  );

  useEffect(() => {
    prefersReducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Resting halo pulse on non-active nodes
  useEffect(() => {
    if (prefersReducedMotion.current) return;
    pulseTweens.current.forEach((t) => t?.kill());
    pulseTweens.current = haloRefs.current.map((el, i) => {
      if (!el) return null;
      if (i === active) {
        gsap.set(el, { opacity: 1 });
        return null;
      }
      gsap.set(el, { opacity: 0.35 });
      return gsap.to(el, {
        opacity: 0.7,
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: (i % 4) * 0.18,
      });
    });
    return () => {
      pulseTweens.current.forEach((t) => t?.kill());
    };
  }, [active]);

  // Auto-cycle demo on first scroll into view
  useEffect(() => {
    if (prefersReducedMotion.current) return;
    const node = svgRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !hasDemoedRef.current &&
            !userInteractedRef.current
          ) {
            hasDemoedRef.current = true;
            const sequence = [1, 2];
            sequence.forEach((idx, step) => {
              const t = setTimeout(() => {
                if (!userInteractedRef.current) setActive(idx);
              }, 900 * (step + 1));
              demoTimeouts.current.push(t);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      demoTimeouts.current.forEach((t) => clearTimeout(t));
      demoTimeouts.current = [];
    };
  }, []);

  const cancelDemo = () => {
    userInteractedRef.current = true;
    demoTimeouts.current.forEach((t) => clearTimeout(t));
    demoTimeouts.current = [];
  };

  // Animate connector line + pulse active icon
  useEffect(() => {
    const line = lineRef.current;
    const target = positions[active];
    if (!line || !target) return;
    if (prefersReducedMotion.current) {
      line.setAttribute("x2", String(target.x));
      line.setAttribute("y2", String(target.y));
      return;
    }
    gsap.to(line, {
      attr: { x2: target.x, y2: target.y },
      duration: 0.45,
      ease: "power3.inOut",
    });
    const iconEl = iconRefs.current[active];
    if (iconEl) {
      gsap.fromTo(
        iconEl,
        { scale: 1 },
        {
          scale: 1.08,
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
          transformOrigin: "center",
        },
      );
    }
    if (panelRef.current && !prefersReducedMotion.current) {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    }
  }, [active, positions]);

  const handleSelect = (i: number) => {
    cancelDemo();
    setActive(i);
    if (isMobile && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const activeCode = codes[active];

  return (
    <div className="mt-10 grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-7 flex justify-center">
        <div className="w-full max-w-[560px]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            role="tablist"
            aria-label="Eight wellness codes"
            className="w-full h-auto"
          >
            <defs>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(212,165,84,0.35)" />
                <stop offset="70%" stopColor="rgba(212,165,84,0)" />
              </radialGradient>
            </defs>

            {/* Orbit ring */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-forest/15"
              strokeWidth={1}
              strokeDasharray="2 6"
            />

            {/* Glow behind hub */}
            <circle cx={CENTER} cy={CENTER} r={hubR + 30} fill="url(#hubGlow)" />

            {/* Connector line */}
            <line
              ref={lineRef}
              x1={CENTER}
              y1={CENTER}
              x2={positions[0].x}
              y2={positions[0].y}
              stroke="currentColor"
              className="text-amber"
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            {/* Hub */}
            <g>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={hubR}
                className="fill-forest"
              />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={hubR}
                fill="none"
                stroke="currentColor"
                className="text-amber/40"
                strokeWidth={1}
              />
              <image
                href={ojusviIcon.url}
                x={CENTER - hubR * 0.7}
                y={CENTER - hubR * 0.7}
                width={hubR * 1.4}
                height={hubR * 1.4}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>

            {/* Orbit nodes */}
            {codes.map((c, i) => {
              const { x, y } = positions[i];
              const isActive = i === active;
              return (
                <g
                  key={c.letter}
                  ref={(el) => {
                    iconRefs.current[i] = el;
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${c.letter}. ${c.title}`}
                  tabIndex={0}
                  onClick={() => handleSelect(i)}
                  onMouseEnter={() => {
                    if (!isMobile) {
                      cancelDemo();
                      setActive(i);
                    }
                  }}
                  onFocus={() => {
                    cancelDemo();
                    setActive(i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(i);
                    }
                  }}
                  className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-amber"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  <title>{c.title}</title>
                  <circle
                    ref={(el) => {
                      haloRefs.current[i] = el;
                    }}
                    cx={x}
                    cy={y}
                    r={nodeR + 6}
                    fill="none"
                    stroke="currentColor"
                    className={isActive ? "text-amber" : "text-amber/60"}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeR}
                    className={
                      isActive
                        ? "fill-parchment-deep stroke-amber"
                        : "fill-parchment-deep stroke-forest/15 hover:stroke-amber/60"
                    }
                    strokeWidth={isActive ? 2.5 : 1}
                  />
                  <clipPath id={`clip-${c.letter}`}>
                    <circle cx={x} cy={y} r={nodeR - 3} />
                  </clipPath>
                  <image
                    href={c.icon}
                    role="img"
                    aria-label={`${c.title} — yoga code ${c.letter} icon`}
                    x={x - (nodeR - 3)}
                    y={y - (nodeR - 3)}
                    width={(nodeR - 3) * 2}
                    height={(nodeR - 3) * 2}
                    clipPath={`url(#clip-${c.letter})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div
        ref={panelRef}
        aria-live="polite"
        className="md:col-span-5"
      >
        <h3 className="font-serif italic text-forest text-[26px] md:text-[28px] leading-[1.15]">
          {activeCode.title}
        </h3>
        <p className="mt-3 text-[16px] leading-[1.6] text-ink/80">
          {activeCode.body}
        </p>

        <ul className="sr-only">
          {codes.map((c) => (
            <li key={c.letter}>
              {c.letter}. {c.title} — {c.body}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}