import { useEffect, useState } from "react";

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-parchment/95 backdrop-blur-sm border-t border-forest/15 px-4 py-3 flex justify-center">
        <a
          href="/download-app"
          className="inline-flex h-12 w-full max-w-[420px] items-center justify-center rounded-full bg-forest px-6 text-parchment text-[15px] font-medium tracking-wide active:scale-[0.98]"
        >
          Get the Ojusvi App
        </a>
      </div>
    </div>
  );
}
