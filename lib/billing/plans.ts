export type PlanId = "free" | "business" | "pro" | "scale";

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
    description: "Prove the value with a small batch of supplier invoices.",
  },
  business: {
    name: "Business Plus",
    monthlyPrice: 99,
    invoiceLimit: 100,
    description: "Continuous supplier cost monitoring for small businesses that want margin visibility without a procurement team.",
  },
  pro: {
    name: "Business Pro",
    monthlyPrice: 249,
    invoiceLimit: 500,
    description: "Higher-volume invoice intelligence for growing businesses with more suppliers and purchasing activity.",
  },
  scale: {
    name: "Business Scale",
    monthlyPrice: 449,
    invoiceLimit: 2000,
    description: "High-volume cost monitoring for established businesses processing large supplier invoice volumes.",
  },
};

export function isPaidPlan(value: string): value is Exclude<PlanId, "free"> {
  return value === "business" || value === "pro" || value === "scale";
}

export function priceIdForPlan(plan: Exclude<PlanId, "free">): string | null {
  if (plan === "business") return process.env.STRIPE_BUSINESS_PRICE_ID || null;
  if (plan === "pro") return process.env.STRIPE_PRO_PRICE_ID || null;
  return process.env.STRIPE_SCALE_PRICE_ID || null;
}

export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return "business";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_SCALE_PRICE_ID) return "scale";
  return null;
}
