export type PlanId = "free" | "business" | "pro";

export const PLANS: Record<PlanId, {
  name: string;
  monthlyPrice: number;
  invoiceLimit: number;
  description: string;
}> = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    invoiceLimit: 5,
    description: "Try ExpenseMargin with a small batch of supplier invoices.",
  },
  business: {
    name: "Business",
    monthlyPrice: 39,
    invoiceLimit: 100,
    description: "Continuous supplier cost monitoring for a small business.",
  },
  pro: {
    name: "Pro",
    monthlyPrice: 99,
    invoiceLimit: 500,
    description: "Higher-volume monitoring for growing and multi-location businesses.",
  },
};

export function isPaidPlan(value: string): value is Exclude<PlanId, "free"> {
  return value === "business" || value === "pro";
}

export function priceIdForPlan(plan: Exclude<PlanId, "free">): string | null {
  return plan === "business"
    ? process.env.STRIPE_BUSINESS_PRICE_ID || null
    : process.env.STRIPE_PRO_PRICE_ID || null;
}

export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return "business";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return null;
}
