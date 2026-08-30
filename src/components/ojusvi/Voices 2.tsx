import { Reveal } from "./Reveal";
import yogaMat from "@/assets/voices-yoga-mat.webp";
import temple from "@/assets/voices-temple.webp";
import fruitBowl from "@/assets/voices-fruit-bowl.webp";
import diya from "@/assets/voices-diya.webp";

type Quote = {
  kind: "quote";
  num: number;
  body: string;
  who: string;
  texture: "linen" | "recycled" | "cream";
  rotate: number;
};
type Photo = {
  kind: "photo";
  src: string;
  alt: string;
  caption?: string;
  rotate: number;
};

type Card = Quote | Photo;

const cards: Card[] = [
  {
    kind: "quote",
    num: 1,
    body: "The morning yoga teacher speaks in Hindi, slowly. My knees are old but she does not mind. I look forward to 6:30 now.",
    who: "KAMLA · 68 · JAIPUR",
    texture: "recycled",
    rotate: 0.8,
  },
  {
    kind: "quote",
    num: 2,
    body: "I forget my medicines often. Samvit's gentle reminder before lunch and dinner has saved me more than once. My daughter in Bangalore no longer worries.",
    who: "SAVITRI · 74 · VARANASI",
    texture: "recycled",
    rotate: -0.7,
  },
  {
    kind: "photo",
    src: yogaMat,
    alt: "A rolled yoga mat resting in soft morning light",
    caption: "the 6:30 ritual",
    rotate: 1.4,
  },
  {
    kind: "quote",
    num: 3,
    body: "Tambola has become a small festival in my house. My grandchildren tease me, but they also bring me chai during the game.",
    who: "RADHA · 59 · PUNE",
    texture: "cream",
    rotate: -1.6,
  },
  {
    kind: "quote",
    num: 4,
    body: "I had not sung bhajans with anyone since my husband passed. Now every Tuesday, I sing with eleven other women. My voice has come back.",
    who: "SUSHMA · 62 · LUCKNOW",
    texture: "linen",
    rotate: -1.2,
  },
  {
    kind: "photo",
    src: temple,
    alt: "A temple shikhara at golden hour",
    caption: "saturday darshan",
    rotate: -1.1,
  },
  {
    kind: "quote",
    num: 5,
    body: "Live darshan from Tirupati on a Saturday morning, with a cup of filter coffee — I never thought a phone could give me this.",
    who: "LAKSHMI · 66 · CHENNAI",
    texture: "cream",
    rotate: 0.9,
  },
  {
    kind: "quote",
    num: 6,
    body: "The panchang in the morning feels like my father reading it aloud at the dining table, all those years ago. A small thing, but it begins my day with peace.",
    who: "GOPAL · 71 · INDORE",
    texture: "linen",
    rotate: 1.1,
  },
  {
    kind: "photo",
    src: fruitBowl,
    alt: "A brass bowl of seasonal fruit on linen",
    caption: "the meal plan",
    rotate: 1.3,
  },
  {
    kind: "quote",
    num: 7,
    body: "I joined for the yoga, but I stayed for the group. We have a little group now — we send each other good-morning messages, share recipes, and laugh at our forgetfulness.",
    who: "PREMLATA · 64 · KOLKATA",
    texture: "cream",
    rotate: -1.0,
  },
  {
    kind: "quote",
    num: 8,
    body: "The aerobics class is just the right pace. The teacher remembers my knee surgery and tells me when to sit out. That kind of care, you cannot buy.",
    who: "MOHAN · 67 · AHMEDABAD",
    texture: "recycled",
    rotate: 1.0,
  },
  {
    kind: "photo",
    src: diya,
    alt: "A clay diya glowing with marigold petals",
    caption: "evening satsang",
    rotate: -0.8,
  },
];

// Subtle paper texture backgrounds via inline SVG noise — different grain per kind.
const textureBg: Record<Quote["texture"], string> = {
  linen:
    "#fdfbf4 url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='l'><feTurbulence type='turbulence' baseFrequency='0.9 0.04' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.10 0'/></filter><rect width='100%25' height='100%25' filter='url(%23l)'/></svg>\")",
  recycled:
    "#f3ecdb url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.14 0'/></filter><rect width='100%25' height='100%25' filter='url(%23r)'/></svg>\")",
  cream:
    "#faf5e8 url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' seed='11'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23c)'/></svg>\")",
};

export function Voices() {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #6b4a2b 0%, #8a6238 28%, #6b4a2b 55%, #5a3d24 100%)",
      }}
    >
      {/* Wood grain noise overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='w'><feTurbulence type='turbulence' baseFrequency='0.012 0.5' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0.7 0'/></filter><rect width='100%25' height='100%25' filter='url(%23w)'/></svg>\")",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6">
        <Reveal>
          <p className="font-serif italic text-parchment/70 text-sm tracking-[0.18em] uppercase text-center">
            Voices
          </p>
          <h2 className="mt-3 text-center font-serif italic text-parchment text-[40px] md:text-[52px] leading-[1.05]">
            What we hear back.
          </h2>
          <p className="mt-5 mx-auto max-w-[520px] text-center font-serif italic text-parchment/75 text-[17px] leading-[1.6]">
            A small scrapbook of mornings, evenings and the quiet things in
            between.
          </p>
        </Reveal>

        {/* Mobile: horizontal snap-scroll */}
        <div className="mt-10 sm:hidden">
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cards.map((c, i) => (
              <div
                key={i}
                className="snap-center shrink-0 w-[78vw] max-w-[320px]"
              >
                {c.kind === "quote" ? (
                  <article
                    style={{
                      background: textureBg[c.texture],
                      transform: `rotate(${c.rotate}deg)`,
                    }}
                    className="relative p-6 pb-5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55),0_6px_14px_-8px_rgba(0,0,0,0.3)]"
                  >
                    <p className="font-serif italic text-forest text-[17px] leading-[1.5]">
                      "{c.body}"
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-forest/20" />
                      <p className="text-[10px] tracking-[0.22em] text-forest/85 font-sans">
                        {c.who}
                      </p>
                    </div>
                  </article>
                ) : (
                  <figure
                    style={{ transform: `rotate(${c.rotate}deg)` }}
                    className="relative bg-[#fdfbf4] p-3 pb-10 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55),0_6px_14px_-8px_rgba(0,0,0,0.3)]"
                  >
                    <img
                      src={c.src}
                      alt={c.alt}
                      loading="lazy"
                      className="block w-full h-auto object-cover"
                    />
                    {c.caption && (
                      <figcaption className="absolute bottom-2 left-0 right-0 text-center font-hand text-forest/85 text-[18px]">
                        {c.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1 text-center font-serif italic text-parchment/70 text-[13px]">
            swipe for more voices →
          </p>
        </div>

        {/* Tablet & desktop: masonry columns */}
        <div className="mt-14 hidden sm:block [column-fill:_balance] columns-2 gap-6 md:gap-7 lg:columns-3">
          {cards.map((c, i) => (
            <Reveal key={i} delay={(i % 4) * 80}>
              <div className="mb-6 break-inside-avoid md:mb-7">
                {c.kind === "quote" ? (
                  <article
                    style={{
                      background: textureBg[c.texture],
                      transform: `rotate(${c.rotate}deg)`,
                    }}
                    className="group relative p-6 pb-5 md:p-7 md:pb-6 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55),0_6px_14px_-8px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
                  >
                    <p className="font-serif italic text-forest text-[19px] md:text-[20px] leading-[1.55]">
                      “{c.body}”
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-forest/20" />
                      <p className="text-[10px] tracking-[0.22em] text-forest/85 font-sans">
                        {c.who}
                      </p>
                    </div>
                  </article>
                ) : (
                  <figure
                    style={{ transform: `rotate(${c.rotate}deg)` }}
                    className="group relative bg-[#fdfbf4] p-3 pb-10 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55),0_6px_14px_-8px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
                  >
                    <img
                      src={c.src}
                      alt={c.alt}
                      loading="lazy"
                      className="block w-full h-auto object-cover"
                    />
                    {c.caption && (
                      <figcaption className="absolute bottom-2 left-0 right-0 text-center font-hand text-forest/85 text-[18px]">
                        {c.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
