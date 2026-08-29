import tulsiSprig from "@/assets/tulsi-sprig.webp";

export function Sprig({
  className = "",
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={tulsiSprig}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "saturate(1.15) contrast(1.05)",
      }}
      className={`inline-block align-middle ${className}`}
    />
  );
}

export function Divider() {
  return (
    <div aria-hidden="true" className="my-4 md:my-6 flex items-center justify-center text-sage/70">
      <Sprig size={22} />
    </div>
  );
}
