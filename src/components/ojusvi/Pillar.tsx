import { Polaroid } from "./Polaroid";
import { Reveal } from "./Reveal";
import { Sprig } from "./Sprig";

export type PillarProps = {
  eyebrow: string;
  headline: string;
  body: string;
  features: string[];
  side: "left" | "right";
  rotate: number;
  watercolorComment: string;
  watercolorTint: string;
  screenshotComment: string;
  offset?: string;
  photo?: { src: string; alt: string; aspect?: string };
  proof?: string;
};

export function Pillar({
  eyebrow,
  headline,
  body,
  features,
  side,
  rotate,
  watercolorComment,
  watercolorTint,
  screenshotComment,
  offset = "",
  photo,
  proof,
}: PillarProps) {
  const isLeft = side === "left";
  const watercolor = photo ? (
    <div className="relative md:col-span-6 flex justify-center">
      <Polaroid rotate={rotate}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="block w-[320px] sm:w-[440px] md:w-[520px] h-auto object-cover"
          style={{ aspectRatio: photo.aspect ?? "4 / 3" }}
        />
      </Polaroid>
    </div>
  ) : (
    <div className="relative md:col-span-6 flex justify-center">
      {/* Watercolor slot */}
      <div
        aria-hidden="true"
        className="relative w-[280px] sm:w-[380px] md:w-[460px] aspect-[4/5]"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: `<!-- ${watercolorComment} -->` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="w-[260px] sm:w-[360px] md:w-[440px] aspect-[4/5] rounded-[40%_60%_55%_45%/45%_55%_50%_50%] blur-[1px]"
          style={{ background: watercolorTint }}
        />
      </div>
    </div>
  );

  const text = (
    <div className="md:col-span-6">
      <Reveal>
        <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-serif italic text-forest text-[40px] sm:text-[48px] md:text-[56px] leading-[1.05]">
          {headline}
        </h2>
        <p className="mt-6 max-w-[380px] text-[17px] leading-[1.65] text-ink/80">
          {body}
        </p>
        <p className="mt-8 max-w-[440px] font-serif text-forest text-[20px] leading-[1.7]">
          {features.map((f, i) => (
            <span key={i}>
              {f}
              {i < features.length - 1 ? (
                <span className="mx-2 text-sage/80">
                  <Sprig size={14} />
                </span>
              ) : null}
            </span>
          ))}
        </p>
        {proof ? (
          <p className="mt-6 max-w-[420px] font-serif italic text-forest/85 text-[16px] leading-[1.6] border-l-2 border-amber/60 pl-4">
            {proof}
          </p>
        ) : null}
      </Reveal>
    </div>
  );

  return (
    <section className={`relative ${offset}`}>
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-12 md:gap-12 md:px-10">
        {isLeft ? (
          <>
            {watercolor}
            {text}
          </>
        ) : (
          <>
            <div className="md:col-span-6 md:order-1 order-2">{text}</div>
            <div className="md:col-span-6 md:order-2 order-1">{watercolor}</div>
          </>
        )}
      </div>
    </section>
  );
}
