import { useEffect, useState } from "react";
import logoAsset from "@/assets/ojusvi-logo-round-256.webp.asset.json";
const logoRound = logoAsset.url;

const links = [
  { label: "Why Ojusvi", href: "/#why" },
  { label: "How It Works", href: "/#how" },
  { label: "A Day", href: "/#day" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Languages", href: "/#languages" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-parchment/90 backdrop-blur-sm border-b border-forest/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <a href="/#top" className="inline-flex items-center leading-none">
          <img
            src={logoRound}
            alt="Ojusvi logo — home"
            width={56}
            height={56}
            className="h-10 md:h-14 w-auto object-contain"
          />
        </a>
        <nav className="hidden lg:flex items-center gap-10 text-[15px] text-forest/80">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-forest transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="/download-app"
          className="hidden lg:inline-flex h-12 items-center rounded-full bg-forest px-6 text-parchment text-sm font-medium tracking-wide transition active:scale-[0.98] hover:bg-forest-deep"
        >
          Download App
        </a>
        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden flex h-12 w-12 items-center justify-center text-forest"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            {open ? (
              <>
                <path d="M6 6 L18 18" />
                <path d="M18 6 L6 18" />
              </>
            ) : (
              <>
                <path d="M4 8 H20" />
                <path d="M4 16 H20" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open ? (
        <div className="lg:hidden bg-parchment border-t border-forest/10 px-6 py-6 space-y-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-forest text-lg"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/download-app"
            onClick={() => setOpen(false)}
            className="inline-flex h-12 items-center rounded-full bg-forest px-6 text-parchment text-sm"
          >
            Download App
          </a>
        </div>
      ) : null}
    </header>
  );
}
