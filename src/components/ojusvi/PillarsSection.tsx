import { Pillar } from "./Pillar";
import { Divider } from "./Sprig";
import { YogaSystem } from "./YogaSystem";
import mentalWellnessPhoto from "@/assets/mental-wellness.webp";
import physicalWellnessAsset from "@/assets/physical-wellness-couple.webp.asset.json";
const physicalWellnessPhoto = physicalWellnessAsset.url;
import spiritualWellnessPhoto from "@/assets/spiritual-wellness-praying.webp";
import samvitAsset from "@/assets/samvit-medicines.webp.asset.json";
const samvitPhoto = samvitAsset.url;
import tambolaAsset from "@/assets/tambola-cozy.webp.asset.json";
const tambolaPhoto = tambolaAsset.url;

export function PillarsSection() {
  return (
    <div className="relative">
      <Pillar
        side="left"
        rotate={-2}
        eyebrow="Physical Wellness"
        headline="The body, gently kept."
        body="A morning that begins with breath, and a day held together by small kindnesses to the body."
        features={[
          "Group yoga in the morning",
          "Aerobics, arts and crafts",
          "An AI meal planner that knows ghar ka khana",
        ]}
        proof="Yoga sessions for fitness & wellness"
        watercolorComment="ASSET: tulsi sprig watercolor, soft sage and amber wash, ~460px wide, transparent PNG"
        watercolorTint="radial-gradient(closest-side, rgba(156,175,136,0.55), rgba(186,117,23,0.18) 60%, transparent 75%)"
        screenshotComment="ASSET: app screenshot — yoga class screen, ~200x400px"
        offset="pt-24 md:pt-40 md:-mt-10"
        photo={{
          src: physicalWellnessPhoto,
          alt: "An Indian couple practicing gentle aerobics together in their living room, mid-step and laughing",
          aspect: "3 / 4",
        }}
      />
      <Divider />
      <YogaSystem />
      <Divider />
      <Pillar
        side="right"
        rotate={2}
        eyebrow="Mental Wellness"
        headline="A quieter mind, made room for."
        body="Small puzzles or a lively Tambola call in the afternoon. Meditation when the house grows still."
        features={[
          "Sudoku, ludo, chess, wordle — gentle solo games",
          "Live Tambola with the community everyday",
          "Guided meditation, live and on-demand",
        ]}
        proof="Tambola every afternoon — play live with the community."
        watercolorComment="ASSET: peepal leaf resting on a still pond watercolor, ~460px wide, transparent PNG"
        watercolorTint="radial-gradient(closest-side, rgba(12,62,47,0.32), rgba(156,175,136,0.25) 55%, transparent 78%)"
        screenshotComment="ASSET: app screenshot — Tambola live screen, ~200x400px"
        offset="pt-16 md:pt-32 md:translate-x-6"
        photo={{
          src: mentalWellnessPhoto,
          alt: "Two elder Indian women in saris sitting on a charpai, smiling together over a phone in warm afternoon light",
          aspect: "4 / 3",
        }}
      />
      <Pillar
        side="left"
        rotate={-2}
        eyebrow="Together, Every Day"
        headline="Live Tambola, every afternoon."
        body="A real host, real voices, and a room full of people your age — playing together, laughing together, wherever you are."
        features={[
          "A live caller every afternoon, in your language",
          "Large, easy-to-read tickets made for older eyes",
          "Play alongside the whole Ojusvi community, across cities",
          "The little afternoon festival your day starts looking forward to",
        ]}
        watercolorComment="ASSET: warm amber watercolor wash for Tambola, ~460px wide, transparent PNG"
        watercolorTint="radial-gradient(closest-side, rgba(186,117,23,0.4), rgba(160,82,45,0.18) 55%, transparent 78%)"
        screenshotComment="ASSET: app screenshot — live Tambola screen"
        offset="pt-16 md:pt-32 md:-translate-x-6"
        photo={{
          src: tambolaPhoto,
          alt: "Elderly friends playing live Tambola together over video call",
          aspect: "4 / 3",
        }}
      />
      <Divider />
      <Pillar
        side="left"
        rotate={-2}
        eyebrow="Spiritual Wellness"
        headline="The sacred, kept close."
        body="A panchang to begin the day, a darshan when the heart needs steadying, and bhajans sung together as the lamp is lit."
        features={[
          "Daily panchang",
          "Live temple darshan",
          "Personalized horoscope each morning",
          "Group bhajan and satsang sessions",
        ]}
        proof="Live darshan from different temples."
        watercolorComment="ASSET: clay diya with a single curl of smoke watercolor, warm amber, ~460px wide, transparent PNG"
        watercolorTint="radial-gradient(closest-side, rgba(186,117,23,0.45), rgba(160,82,45,0.2) 55%, transparent 78%)"
        screenshotComment="ASSET: app screenshot — daily panchang screen, ~200x400px"
        offset="pt-16 md:pt-32 md:-translate-x-6"
        photo={{
          src: spiritualWellnessPhoto,
          alt: "An elderly Indian woman lighting a clay diya at her home altar, with marigolds and a deity portrait in soft warm light",
          aspect: "3 / 4",
        }}
      />
      <Divider />
      <Pillar
        side="right"
        rotate={2}
        eyebrow="Health & Peace of Mind"
        headline="Samvit — health, quietly watched over."
        body="The one thing every family worries about from far away: did they take their medicine, is everything alright. Samvit keeps that watch, gently."
        features={[
          "Gentle reminders for every medicine and glass of water, through the day",
          "Scan any prescription — even handwritten — and Samvit organises it for you",
          "All reports and health documents in one place, found in seconds",
          "Track BP, blood sugar and weight over time, and see it improving",
          "So your daughter in another city stops worrying, and you stay independent",
        ]}
        proof="Samvit helps you remember and keep records. It does not replace your doctor."
        watercolorComment="ASSET: soft sage watercolor wash for Samvit, ~460px wide, transparent PNG"
        watercolorTint="radial-gradient(closest-side, rgba(156,175,136,0.4), rgba(186,117,23,0.15) 60%, transparent 78%)"
        screenshotComment="ASSET: app screenshot — Samvit medicine reminders screen"
        offset="pt-16 md:pt-32 md:translate-x-6"
        photo={{
          src: samvitPhoto,
          alt: "An adult daughter helping her elderly mother with her daily medicines at home",
          aspect: "4 / 5",
        }}
      />
    </div>
  );
}
