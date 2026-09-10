import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { codes } from "./wellness-codes";

const WellnessWheel = lazy(() =>
  import("./WellnessWheel").then((m) => ({ default: m.WellnessWheel })),
);

function WheelFallback() {
  const first = codes[0];
  return (
    <div className="mt-10 grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-7 flex justify-center">
        <div className="w-full max-w-[560px] aspect-square" aria-hidden="true" />
      </div>
      <div className="md:col-span-5">
        <h3 className="font-serif italic text-forest text-[26px] md:text-[28px] leading-[1.15]">
          {first.title}
        </h3>
        <p className="mt-3 text-[16px] leading-[1.6] text-ink/80">{first.body}</p>
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

export function WellnessWheelLazy() {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = holderRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={holderRef}>
      {show ? (
        <Suspense fallback={<WheelFallback />}>
          <WellnessWheel />
        </Suspense>
      ) : (
        <WheelFallback />
      )}
    </div>
  );
}
