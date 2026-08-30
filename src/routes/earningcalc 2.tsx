import { createFileRoute } from "@tanstack/react-router";
import EarningsCalculator from "@/components/ojusvi/EarningsCalculator";

export const Route = createFileRoute("/earningcalc")({
  head: () => ({
    meta: [
      { title: "Instructor Earnings Calculator · Ojusvi" },
      {
        name: "description",
        content:
          "Estimate your tentative monthly take-home as an Ojusvi instructor across revenue-share models.",
      },
      { property: "og:title", content: "Instructor Earnings Calculator · Ojusvi" },
      {
        property: "og:description",
        content:
          "Estimate your tentative monthly take-home as an Ojusvi instructor across revenue-share models.",
      },
    ],
  }),
  component: EarningsCalcPage,
});

function EarningsCalcPage() {
  return <EarningsCalculator />;
}
