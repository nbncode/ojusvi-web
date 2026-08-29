import { Reveal } from "./Reveal";
import { Sprig } from "./Sprig";

const day = [
  { time: "5:30 AM", text: "The day's panchang, read like a quiet prayer." },
  { time: "6:00 AM", text: "Your horoscope delivered everyday" },
  { time: "6:30 AM", text: "Yoga for health & happiness." },
  { time: "8:00 AM", text: "A glass of water, a gentle reminder." },
  { time: "8:30 AM", text: "Meditation before kicking start the day." },
  { time: "11:00 AM", text: "Spiritual wellness with Bhajan clubbing or Gita path" },
  { time: "12:30 PM", text: "A fun round of Tambola with other Ojusvi members." },
  { time: "1:30 PM", text: "Rejuvinate with 10+ activities" },
  { time: "3:00 PM", text: "Play games & solve puzzles for fun or for mental health." },
  { time: "4:00 PM", text: "Live darshan from a temple far away." },
  { time: "5:00 PM", text: "Gentle aerobics for those who want more than yoga." },
  { time: "7:00 PM", text: "Track your BP, Diabetes or Weight." },
  { time: "8:00 PM", text: "Reminder to take that medicine before dinner." },
  { time: "9:00 PM", text: "Wind-down with meditation before hitting the bed!" },
];

const groups = [
  { label: "Morning", range: "5:30 – 8:30 AM", items: day.slice(0, 5) },
  { label: "Midday", range: "11:00 AM – 1:30 PM", items: day.slice(5, 8) },
  { label: "Afternoon", range: "3:00 – 5:00 PM", items: day.slice(8, 11) },
  { label: "Evening", range: "7:00 – 9:00 PM", items: day.slice(11) },
];

export function DayTimeline() {
  return (
    <section id="day" className="relative bg-parchment-deep py-20 md:py-28">
      <div className="mx-auto max-w-[760px] px-6">
        <Reveal>
          <p className="font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase text-center">
            A day with Ojusvi
          </p>
          <h2 className="mt-3 text-center font-serif italic text-forest text-[40px] md:text-[52px] leading-[1.05]">
            From the panchang to the lamp.
          </h2>
        </Reveal>

        {/* Mobile: swipeable carousel of parts-of-day */}
        <div className="mt-10 md:hidden">
          <div
            className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.map((g) => (
              <article
                key={g.label}
                className="snap-center shrink-0 w-[86vw] max-w-[360px] rounded-2xl border border-sage/30 bg-parchment px-5 py-6 shadow-[0_10px_30px_-20px_rgba(31,58,43,0.35)]"
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-serif italic text-forest text-[22px] leading-none">
                    {g.label}
                  </p>
                  <p className="font-sans tabular-nums text-forest/60 text-[12px]">
                    {g.range}
                  </p>
                </div>
                <ul className="mt-5 divide-y divide-sage/20">
                  {g.items.map((d) => (
                    <li
                      key={d.time}
                      className="grid grid-cols-[72px_1fr] items-start gap-3 py-3"
                    >
                      <span className="font-sans tabular-nums text-forest text-[13px] pt-[3px]">
                        {d.time}
                      </span>
                      <span className="font-serif italic text-forest text-[16px] leading-[1.4]">
                        {d.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-2 text-center font-serif italic text-forest/60 text-[13px]">
            swipe through the day →
          </p>
        </div>

        {/* Desktop: original vertical dotted timeline */}
        <ol className="mt-16 relative hidden md:block">
          {/* Hand-drawn dotted vertical line */}
          <svg
            aria-hidden="true"
            className="absolute left-[88px] md:left-[110px] top-2 bottom-2 w-[2px] text-sage/70"
            preserveAspectRatio="none"
            viewBox="0 0 2 100"
          >
            <path
              d="M1 0 Q 0 25 1 50 T 1 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {day.map((d, i) => (
            <li key={d.time}>
              <Reveal delay={i * 60}>
                <div className="grid grid-cols-[80px_40px_1fr] md:grid-cols-[100px_40px_1fr] items-start gap-4 py-5">
                  <span className="font-sans tabular-nums text-forest text-sm md:text-base pt-1">
                    {d.time}
                  </span>
                  <span aria-hidden="true" className="flex justify-center pt-1 text-sage">
                    <Sprig size={22} />
                  </span>
                  <span className="font-serif italic text-forest text-[18px] md:text-[22px] leading-[1.5]">
                    {d.text}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
