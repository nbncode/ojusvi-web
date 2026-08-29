export const SUBSCRIPTION_PLANS = {
  annual: { id: "annual", name: "Ojusvi Annual", amount_paise: 298800, duration_days: 365 },
  monthly: { id: "monthly", name: "Ojusvi Monthly", amount_paise: 34900, duration_days: 30 },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;
