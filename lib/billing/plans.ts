export type PlanId = "free" | "business" | "pro" | "scale" | "scale_plus";
export type PaidPlanId = Exclude<PlanId, "free">;

export const PUBLIC_PLAN_IDS: PaidPlanId[] = ["business", "pro", "scale", "scale_plus"];

export const PLANS: Record<PlanId, {
  name: string;
  monthlyPrice: number;
  invoiceLimit: number;
  description: string;
}> = {
  free: {
    name: "No active plan",
    monthlyPrice: 0,
    invoiceLimit: 0,
    description: "Choose a paid plan to begin processing supplier invoices.",
  },
  business: {
    name: "Starter",
    monthlyPrice: 19,
    invoiceLimit: 25,
    description: "Simple supplier cost monitoring for small businesses getting started.",
  },
  pro: {
    name: "Growth",
    monthlyPrice: 39,
    invoiceLimit: 50,
    description: "More invoice capacity for growing businesses that want recurring cost visibility.",
  },
  scale: {
    name: "Scale",
    monthlyPrice: 79,
    invoiceLimit: 100,
    description: "Higher-volume supplier cost intelligence for businesses with more purchasing activity.",
  },
  scale_plus: {
    name: "Scale Plus",
    monthlyPrice: 99,
    invoiceLimit: 200,
    description: "Expanded invoice capacity for established businesses with larger supplier volumes.",
  },
};

const PRICE_IDS: Record<PaidPlanId, string> = {
  business: process.env.STRIPE_STARTER_PRICE_ID || "price_1U6kJ6C0bQpEJa89nhmlK0ZC",
  pro: process.env.STRIPE_GROWTH_PRICE_ID || "price_1U6kJBC0bQpEJa89LFtnW3jn",
  scale: process.env.STRIPE_SCALE_PRICE_ID_V2 || "price_1U6kJIC0bQpEJa89SWebojgG",
  scale_plus: process.env.STRIPE_SCALE_PLUS_PRICE_ID || "price_1U6kJOC0bQpEJa89uzx2la3a",
};

export function isPaidPlan(value: string): value is PaidPlanId {
  return PUBLIC_PLAN_IDS.includes(value as PaidPlanId);
}

export function priceIdForPlan(plan: PaidPlanId): string | null {
  return PRICE_IDS[plan] || null;
}

export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === PRICE_IDS.business || priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return "business";
  if (priceId === PRICE_IDS.pro || priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === PRICE_IDS.scale || priceId === process.env.STRIPE_SCALE_PRICE_ID) return "scale";
  if (priceId === PRICE_IDS.scale_plus) return "scale_plus";
  return null;
}
