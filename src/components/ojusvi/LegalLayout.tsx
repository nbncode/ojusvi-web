import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-parchment text-ink">
      <Nav />
      <main className="relative z-[2] pt-32 md:pt-40 pb-24">
        <article className="mx-auto max-w-[760px] px-6">
          <p className="font-serif italic text-forest/85 text-sm tracking-[0.18em] uppercase">
            Last updated · {updated}
          </p>
          <h1 className="mt-3 font-serif italic text-forest text-[44px] md:text-[56px] leading-[1.05]">
            {title}
          </h1>
          <div className="mt-10 font-serif text-ink/85 text-[18px] md:text-[19px] leading-[1.8] space-y-2">
            {children}
          </div>
          <p className="mt-16 text-sm">
            <Link to="/" className="text-forest underline underline-offset-4 hover:text-forest-deep">
              ← Back to home
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-12 font-serif italic text-forest text-[28px] md:text-[32px] leading-tight">
    {children}
  </h2>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="mt-8 font-serif italic text-forest text-[22px] md:text-[24px] leading-tight">
    {children}
  </h3>
);

export const P = ({ children }: { children: ReactNode }) => (
  <p className="mt-4">{children}</p>
);

export const UL = ({ children }: { children: ReactNode }) => (
  <ul className="mt-4 list-disc pl-6 space-y-2 marker:text-forest/80">
    {children}
  </ul>
);