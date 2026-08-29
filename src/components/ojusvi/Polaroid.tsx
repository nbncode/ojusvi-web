import type { ReactNode } from "react";

export function Polaroid({
  children,
  rotate = -2,
  className = "",
  caption,
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
  caption?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`group inline-block bg-[#fdfbf4] p-3 pb-6 shadow-[0_18px_40px_-20px_rgba(12,62,47,0.45),0_4px_10px_-4px_rgba(12,62,47,0.25)] transition-transform duration-500 hover:scale-[1.02] hover:rotate-0 ${className}`}
    >
      {children}
      {caption ? (
        <div className="pt-3 text-center font-hand text-lg text-forest/85">{caption}</div>
      ) : null}
    </div>
  );
}
