export const SUBSCRIPTION_PLANS = {
  annual: { id: "annual", name: "Ojusvi Annual", amount_paise: 298800, duration_days: 365 },
  monthly: { id: "monthly", name: "Ojusvi Monthly", amount_paise: 34900, duration_days: 30 },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;

/** Access rights shared by the Annual (one-time) and ₹349/month plans. */
export const FULL_ACCESS_INCLUDED = [
  "Guided sessions everyday through out the week",
  "A 52-week structured programme",
  "Devotional content, fun games, medical reminder, much more",
  "Available in Hindi, English, Bengali, Marathi, Telugu and Tamil",
];
