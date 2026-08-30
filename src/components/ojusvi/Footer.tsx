import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/ojusvi-logo-flat.webp";
const logoRound = logoAsset;

function HandIcon({
  href,
  d,
  label,
}: {
  href: string;
  d: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-forest/80 hover:text-forest transition-colors"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-parchment py-16 md:py-24">
      <div className="mx-auto max-w-[760px] px-6 text-center">
        <p className="mt-10 font-serif italic text-forest text-[22px] md:text-[24px] leading-[1.7]">
          Thank you for being here. We hope Ojusvi becomes a small, steady part
          of your day.
          <br />
          <span className="not-italic font-hand text-forest/80 text-3xl">
            — The Ojusvi team
          </span>
        </p>

        <nav className="mt-12 font-serif text-forest/85 text-[18px] leading-[1.9]">
          <Link to="/privacy" className="hover:text-forest underline-offset-4 hover:underline">Privacy Policy</Link>
          <span className="px-2">·</span>
          <Link to="/terms" className="hover:text-forest underline-offset-4 hover:underline">Terms &amp; Conditions</Link>
          <span className="px-2">·</span>
          <Link to="/refund" className="hover:text-forest underline-offset-4 hover:underline">Cancellation &amp; Refund</Link>
          <span className="px-2">·</span>
          <Link to="/security" className="hover:text-forest underline-offset-4 hover:underline">Information Security</Link>
          <span className="px-2">·</span>
          <Link to="/account-deletion" className="hover:text-forest underline-offset-4 hover:underline">Account &amp; Data Deletion</Link>
        </nav>

        <div className="mt-10 flex justify-center gap-6">
          {/* Hand-drawn-style social glyphs */}
          <HandIcon
            href="https://www.facebook.com/profile.php?id=61570805703707"
            label="Facebook"
            d="M14 4 H17 V8 H14 Q13 8 13 9 V11 H17 L16.5 14 H13 V21 H10 V14 H7 V11 H10 V8.5 Q10 4 14 4 Z"
          />
          <HandIcon
            href="https://www.instagram.com/ojusvi.app/"
            label="Instagram"
            d="M5 5 H19 V19 H5 Z M9 12 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M16.5 7 v0.01"
          />
          <HandIcon
            href="https://wa.me/919958905337?text=Hello%20%F0%9F%91%8B%F0%9F%91%8B"
            label="WhatsApp"
            d="M5 19 L6.5 15 A7 7 0 1 1 9 17.5 Z M9 10 Q10 13 13 14 L14.5 12.5 L17 13.5 Q16.5 16 14 16 Q10 15 9 11 Q9.5 9.5 11 9 L10 7 Q8 7.5 8 9.5"
          />
        </div>

        <div className="mt-10 flex justify-center gap-4 opacity-90">
          <a
            href="/download-app"
            className="inline-flex h-12 w-[140px] items-center justify-center rounded-md bg-forest text-parchment text-xs font-medium tracking-wide shadow-sm transition hover:bg-forest-deep"
          >
            App Store
          </a>
          <a
            href="/download-app"
            className="inline-flex h-12 w-[140px] items-center justify-center rounded-md bg-forest text-parchment text-xs font-medium tracking-wide shadow-sm transition hover:bg-forest-deep"
          >
            Google Play
          </a>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <img
            src={logoRound}
            alt="Ojusvi logo — a lotus roundel"
            width={112}
            height={112}
            loading="lazy"
            decoding="async"
            className="h-24 md:h-28 w-auto object-contain"
          />
          <p className="font-serif italic text-[44px] md:text-[56px] leading-none">
            <span className="text-brilliance">Ojusvi</span>
          </p>
          <p className="font-serif italic text-forest/80 text-[18px] md:text-[20px]">
            Vitality, Brilliance, Strength from within
          </p>
        </div>

        <p className="mt-10 font-hand text-forest/80 text-lg">
          Made with care in India.
        </p>
      </div>
    </footer>
  );
}
