import { useState } from "react";
import { Reveal } from "./Reveal";

type FAQ = { q: string; a: string };
type Group = { title: string; items: FAQ[] };

const allFaqs: FAQ[] = [
  {
    q: "What is Ojusvi?",
    a: "Ojusvi (ओजस्वी) is a wellness and companionship app for seniors. It brings daily live yoga, guided meditation, panchang and group bhajan/satsang, gentle brain games, live afternoon Tambola with the community, and Samvit — a medicine, records and health tracker — all in your language, from the comfort of home.",
  },
  {
    q: "Which languages does Ojusvi support?",
    a: "English, Hindi, Bangla, Gujarati, Telugu, Tamil. Every screen in your language.",
  },
  {
    q: "How do the sessions work?",
    a: "A real teacher, on video, at a fixed time each day. You join from the app, see the others in the class, and follow along.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes. Every user gets the first 30 days completely free, no card needed. You only pay if you decide to continue.",
  },
  {
    q: "Is my data safe?",
    a: "We never share your number. Health entries stay encrypted on our servers and are visible only to you. Read our two-minute privacy policy for the details.",
  },
  {
    q: "Can I share Ojusvi with my mother / sister / friend?",
    a: "Please do. Refer a friend and you both get an extra month free. Family plans are coming soon.",
  },
  {
    q: "What do I need for a session?",
    a: "We recommend having the following ready: comfortable clothing, a yoga mat, one yoga belt, two yoga blocks, a pillow or cushion, and a water bottle. Any specific requirement for a session is communicated in the app in advance.",
  },
  {
    q: "Who can join Ojusvi?",
    a: "Anyone seeking better physical health, mental peace, and spiritual well-being is welcome. Ojusvi is designed especially for seniors 55+ and their families.",
  },
  {
    q: "How do I subscribe?",
    a: "You can subscribe through the website itself — __PRICING__.",
  },
  {
    q: "What's the difference between the monthly and annual plans?",
    a: "Annual is one payment of ₹2,988 for 12 months (works out to ₹249/month). Monthly is ₹349/month, billed each month.",
  },
  {
    q: "Why is the annual plan cheaper?",
    a: "You commit for the year, so we pass the saving back — ₹249/month instead of ₹349.",
  },
  {
    q: "Can I cancel?",
    a: "The monthly plan can be cancelled anytime from your UPI or bank app; you keep access to the end of the paid month. The annual plan gives you all 12 months upfront and isn't refundable for unused months if you leave early.",
  },
  {
    q: "What types of sessions are offered?",
    a: "Ojusvi offers yoga, pranayama, guided meditation, breathing exercises, and holistic wellness sessions, along with devotional content — all thoughtfully designed for different health goals and spiritual needs.",
  },
  {
    q: "How long are the sessions?",
    a: "Sessions typically range from 45 to 60 minutes.",
  },
  {
    q: "Which devices can I use?",
    a: "Ojusvi works on Android and iOS smartphones and tablets.",
  },
  {
    q: "Will the instructors change over time?",
    a: "Instructors may be rotated periodically. However, all sessions are led by certified wellness professionals, and Ojusvi maintains a consistent standard of quality and care across all instructors.",
  },
  {
    q: "I'm facing technical issues. How can I get help?",
    a: "Please reach out to our support team on __EMAIL__ or on __WHATSAPP__ or through in-app chat and we'll be happy to assist you.",
  },
];

const pick = (...qs: string[]): FAQ[] =>
  qs.map((q) => allFaqs.find((f) => f.q === q)!).filter(Boolean);

const groups: Group[] = [
  {
    title: "About Ojusvi",
    items: pick(
      "What is Ojusvi?",
      "Who can join Ojusvi?",
      "Which languages does Ojusvi support?",
      "What types of sessions are offered?",
      "How long are the sessions?",
      "Which devices can I use?",
    ),
  },
  {
    title: "Sessions & practice",
    items: pick(
      "How do the sessions work?",
      "What do I need for a session?",
      "Will the instructors change over time?",
    ),
  },
  {
    title: "Plans & payment",
    items: pick(
      "Can I try it before paying?",
      "How do I subscribe?",
      "What's the difference between the monthly and annual plans?",
      "Why is the annual plan cheaper?",
      "Can I cancel?",
    ),
  },
  {
    title: "Trust & support",
    items: pick(
      "Is my data safe?",
      "Can I share Ojusvi with my mother / sister / friend?",
      "I'm facing technical issues. How can I get help?",
    ),
  },
];

function renderAnswer(a: string) {
  return a.split(/(__EMAIL__|__WHATSAPP__|__PRICING__)/).map((part, idx) => {
    if (part === "__EMAIL__") {
      return (
        <a
          key={idx}
          href="mailto:hello@ojusvi.app"
          className="text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-forest"
        >
          email
        </a>
      );
    }
    if (part === "__WHATSAPP__") {
      return (
        <a
          key={idx}
          href="https://wa.me/919958905337?text=Hello%20%F0%9F%91%8B%F0%9F%91%8B"
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-forest"
        >
          whatsapp
        </a>
      );
    }
    if (part === "__PRICING__") {
      return (
        <a
          key={idx}
          href="/#pricing"
          className="text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-forest"
        >
          see plans
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function QuestionList({
  items,
  openKey,
  setOpenKey,
  groupKey,
}: {
  items: FAQ[];
  openKey: string | null;
  setOpenKey: (k: string | null) => void;
  groupKey: string;
}) {
  return (
    <ul className="divide-y divide-forest/15 border-y border-forest/15">
      {items.map((f, i) => {
        const key = `${groupKey}:${i}`;
        const isOpen = openKey === key;
        return (
          <li key={key}>
            <button
              onClick={() => setOpenKey(isOpen ? null : key)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-6 py-6 text-left transition hover:bg-parchment-deep/40"
            >
              <span className="font-serif text-forest text-[19px] md:text-[22px] leading-[1.4]">
                {f.q}
              </span>
              <span
                aria-hidden="true"
                className={`mt-2 inline-block h-px w-6 shrink-0 bg-forest transition-transform duration-300 ${
                  isOpen ? "rotate-0" : "rotate-90"
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-500 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[640px] font-serif italic text-ink/80 text-[17px] md:text-[18px] leading-[1.7]">
                  {renderAnswer(f.a)}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function FAQ() {
  const [openGroup, setOpenGroup] = useState<string>(groups[0].title);
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <section id="faq" className="relative bg-parchment py-12 md:py-16">
      <div className="mx-auto max-w-[760px] px-6">
        <Reveal>
          <p className="text-center font-serif italic text-forest/80 text-sm tracking-[0.18em] uppercase">
            Questions, gently answered
          </p>
          <h2 className="mt-4 text-center font-serif italic text-forest text-[36px] md:text-[52px] leading-[1.05]">
            What people ask, before they begin.
          </h2>
        </Reveal>

        {/* Collapsible groups (all viewports) */}
        <div className="mt-10 space-y-3">
          {groups.map((g) => {
            const isOpen = openGroup === g.title;
            return (
              <div key={g.title} className="border-y border-forest/15">
                <button
                  onClick={() => {
                    setOpenGroup(isOpen ? "" : g.title);
                    setOpenKey(null);
                  }}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="font-serif italic text-forest text-[20px] leading-tight">
                    {g.title}
                    <span className="ml-2 not-italic font-sans text-[11px] tracking-[0.2em] text-forest">
                      · {g.items.length}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`inline-block h-px w-5 shrink-0 bg-forest transition-transform duration-300 ${
                      isOpen ? "rotate-0" : "rotate-90"
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 pb-2" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <QuestionList
                      items={g.items}
                      openKey={openKey}
                      setOpenKey={setOpenKey}
                      groupKey={g.title}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
