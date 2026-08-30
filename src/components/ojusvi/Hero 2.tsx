import { Polaroid } from "./Polaroid";
import { MobileRedirectNotice } from "./MobileRedirect";
import { Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-yoga.webp";
import heroLotus from "@/assets/hero-lotus.webp";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen w-full overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:gap-10 md:px-10">
        <div className="relative z-10 md:col-span-7 md:pt-10">
          <h1 className="font-deva leading-[0.95] text-[44px] sm:text-[60px] md:text-[72px] lg:text-[88px]">
            <span className="text-brilliance">ओजस्वी</span>
          </h1>
          <p className="mt-6 sm:mt-8 font-serif italic text-forest text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] leading-[1.05] max-w-[16ch]">
            Vitality, Brilliance, Strength from within
          </p>
          <p className="mt-6 sm:mt-8 max-w-[480px] text-[16px] md:text-[18px] leading-[1.65] text-ink/80">
            Daily yoga, panchang, group satsang, gentle games, and quiet
            companionship — all in your language, on your phone.
          </p>
          <div id="download" className="mt-8 sm:mt-10 hidden md:flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <a
              href="/download-app"
              className="inline-flex h-14 w-full sm:w-auto sm:min-w-[220px] items-center justify-center rounded-full bg-forest px-8 text-parchment text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest-deep"
            >
              Download for iPhone
            </a>
            <a
              href="/download-app"
              className="inline-flex h-14 w-full sm:w-auto sm:min-w-[220px] items-center justify-center rounded-full border border-forest/70 bg-transparent px-8 text-forest text-[15px] font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest hover:text-parchment"
            >
              Get on Android
            </a>
          </div>
          <p className="mt-6 hidden md:block text-[15px] text-ink/85">
            Are you a teacher, coach or instructor with wisdom to share?{" "}
            <Link
              to="/become-an-instructor"
              className="font-serif italic text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-forest"
            >
              Become an instructor →
            </Link>
          </p>
          <div className="mt-5 sm:mt-10 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-[13px] tracking-[0.18em] uppercase text-forest/85">
            <span className="font-serif italic normal-case tracking-normal text-forest text-[16px]">
              Start your 30 days free · no card needed
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-forest/30">·</span>
            <span className="font-serif italic normal-case tracking-normal text-forest text-[16px]">
              6 Indian languages
            </span>
          </div>
          <MobileRedirectNotice />
        </div>

        <div className="md:col-span-5 relative flex justify-center md:justify-end md:pt-6">
          <Polaroid rotate={-1} className="md:-mt-4">
            {/* ASSET: candid morning-light photograph of an Indian woman, 55-65, doing pranayama on her terrace. Soft natural light, real not staged, slight film grain. */}
            <img
              src={heroImage}
              alt="Two Indian women practicing tree pose yoga together on a sunlit terrace at golden hour"
              width={420}
              height={560}
              fetchPriority="high"
              decoding="async"
              className="block w-[260px] h-[350px] sm:w-[320px] sm:h-[430px] md:w-[340px] md:h-[460px] lg:w-[420px] lg:h-[560px] object-cover"
            />
          </Polaroid>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 md:-bottom-10 left-2 md:left-6 w-[80px] sm:w-[120px] md:w-[170px] z-0"
      >
        <img
          src={heroLotus}
          alt=""
          aria-hidden="true"
          role="presentation"
          width={360}
          height={540}
          loading="lazy"
          decoding="async"
          className="w-full h-auto object-contain opacity-40 mix-blend-multiply"
          style={{ filter: "saturate(0.7) contrast(0.95)" }}
        />
      </div>
    </section>
  );
}
