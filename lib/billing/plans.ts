export type PlanId = "free" | "business" | "pro" | "scale" | "scale_plus";
export type PaidPlanId = "business" | "pro" | "scale_plus";

export type PlanFeatureKey =
  | "dashboard"
  | "ai_invoice_analysis"
  | "cost_history"
  | "basic_change_detection"
  | "shrinkflation_detection"
  | "financial_impact"
  | "supplier_comparison"
  | "cost_trends"
  | "custom_thresholds"
  | "weekly_summary"
  | "data_export"
  | "team_access"
  | "cross_location_comparison"
  | "consolidated_analytics"
  | "executive_reporting"
  | "role_based_access"
  | "priority_support";

export type PlanDefinition = {
  name: string;
  monthlyPrice: number;
  invoiceLimit: number;
  locationLimit: number;
  locationLabel: string;
  description: string;
  audience: string;
  features: string[];
  entitlements: PlanFeatureKey[];
};

export const PUBLIC_PLAN_IDS: PaidPlanId[] = ["business", "pro", "scale_plus"];

const starterEntitlements: PlanFeatureKey[] = [
  "dashboard",
  "ai_invoice_analysis",
  "cost_history",
  "basic_change_detection",
];

const growthEntitlements: PlanFeatureKey[] = [
  ...starterEntitlements,
  "shrinkflation_detection",
  "financial_impact",
  "supplier_comparison",
  "cost_trends",
  "custom_thresholds",
  "weekly_summary",
  "data_export",
  "team_access",
];

const multiLocationEntitlements: PlanFeatureKey[] = [
  ...growthEntitlements,
  "cross_location_comparison",
  "consolidated_analytics",
  "executive_reporting",
  "role_based_access",
  "priority_support",
];

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    name: "No active plan",
    monthlyPrice: 0,
    invoiceLimit: 0,
    locationLimit: 0,
    locationLabel: "No active locations",
    description: "Choose a paid plan to begin processing supplier invoices.",
    audience: "Account created, plan not selected",
    features: ["Dashboard preview", "Choose a paid plan to process invoices"],
    entitlements: ["dashboard"],
  },
  business: {
    name: "Starter",
    monthlyPrice: 19,
    invoiceLimit: 10,
    locationLimit: 1,
    locationLabel: "1 business location",
    description: "Essential supplier cost monitoring for independent and very small businesses.",
    audience: "Independent and very small businesses",
    features: [
      "10 invoices per month",
      "1 business location",
      "Customer dashboard with invoice structure and cost overview",
      "AI invoice extraction and line-item analysis",
      "Supplier and item cost history",
      "Basic supplier price-change detection",
      "Secure invoice storage and searchable history",
      "Unlimited suppliers tracked",
    ],
    entitlements: starterEntitlements,
  },
  pro: {
    name: "Growth",
    monthlyPrice: 49,
    invoiceLimit: 50,
    locationLimit: 2,
    locationLabel: "Up to 2 business locations",
    description: "Deeper automation and cost intelligence for growing small businesses.",
    audience: "Growing small businesses",
    features: [
      "Everything in Starter",
      "50 invoices per month",
      "Up to 2 business locations",
      "Shrinkflation and pack-size change detection",
      "Monthly and annual financial-impact estimates",
      "Supplier comparison insights",
      "Cost trend analytics",
      "Custom cost-change thresholds",
      "Weekly automated cost summary",
      "Dashboard data export",
      "Multiple team members",
    ],
    entitlements: growthEntitlements,
  },
  scale: {
    name: "Legacy Scale",
    monthlyPrice: 149,
    invoiceLimit: 200,
    locationLimit: 999,
    locationLabel: "Multiple business locations",
    description: "Legacy plan mapped to current multi-location entitlements.",
    audience: "Existing legacy customers",
    features: ["Mapped to Multi-Location capabilities"],
    entitlements: multiLocationEntitlements,
  },
  scale_plus: {
    name: "Multi-Location",
    monthlyPrice: 149,
    invoiceLimit: 200,
    locationLimit: 999,
    locationLabel: "Multiple business locations",
    description: "Centralized supplier-cost oversight for businesses operating across multiple sites.",
    audience: "Established multi-location businesses",
    features: [
      "Everything in Growth",
      "200 invoices per month",
      "Multiple business locations",
      "Location-by-location supplier cost tracking",
      "Cross-location cost comparisons",
      "Centralized multi-location dashboard",
      "Identify which location pays more for the same item",
      "Consolidated supplier analytics",
      "Organization-wide margin-impact reporting",
      "Scheduled executive reporting",
      "Role-based team access",
      "Priority support",
    ],
    entitlements: multiLocationEntitlements,
  },
};

const PRICE_IDS: Record<PaidPlanId, string> = {
  business: process.env.STRIPE_STARTER_PRICE_ID || "price_1U6sYJC0bQpEJa89lEgE5PPD",
  pro: process.env.STRIPE_GROWTH_PRICE_ID || "price_1U6sYQC0bQpEJa89YLCW2MhQ",
  scale_plus: process.env.STRIPE_MULTI_LOCATION_PRICE_ID || process.env.STRIPE_SCALE_PLUS_PRICE_ID || "price_1U6sYXC0bQpEJa89gY3lLxyu",
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
  if (
    priceId === PRICE_IDS.scale_plus ||
    priceId === process.env.STRIPE_SCALE_PRICE_ID ||
    priceId === process.env.STRIPE_SCALE_PRICE_ID_V2 ||
    priceId === process.env.STRIPE_SCALE_PLUS_PRICE_ID
  ) return "scale_plus";
  return null;
}

export function hasEntitlement(plan: PlanId, feature: PlanFeatureKey): boolean {
  return PLANS[plan].entitlements.includes(feature);
}
