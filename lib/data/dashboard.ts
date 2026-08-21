import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";
import { PLANS, hasEntitlement } from "@/lib/billing/plans";

export type DashboardAlert = {
  id: string;
  item: string;
  supplier: string;
  previous: number;
  current: number;
  change: number;
  annualImpact: number;
  createdAt: string;
};

export async function getDashboardData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();
  const plan = PLANS[context.plan];

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [alertsResult, suppliersResult, invoicesResult, monthlyInvoicesResult, reviewResult, locationsResult, membersResult] = await Promise.all([
    supabase
      .from("cost_alerts")
      .select("id, previous_unit_cost, current_unit_cost, percent_change, estimated_annual_impact, created_at, suppliers(name), products(normalized_name)")
      .eq("organization_id", context.organizationId)
      .neq("status", "dismissed")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("suppliers").select("id", { count: "exact", head: true }).eq("organization_id", context.organizationId),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("organization_id", context.organizationId).eq("status", "complete"),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("organization_id", context.organizationId).gte("created_at", monthStart.toISOString()),
    supabase.from("match_reviews").select("id", { count: "exact", head: true }).eq("organization_id", context.organizationId).eq("status", "pending"),
    supabase.from("locations").select("id,name,is_primary").eq("organization_id", context.organizationId).order("is_primary", { ascending: false }).order("created_at", { ascending: true }),
    supabase.from("organization_members").select("user_id", { count: "exact", head: true }).eq("organization_id", context.organizationId),
  ]);

  const alerts: DashboardAlert[] = (alertsResult.data ?? []).map((row: any) => ({
    id: row.id,
    item: row.products?.normalized_name ?? "Unmatched item",
    supplier: row.suppliers?.name ?? "Unknown supplier",
    previous: Number(row.previous_unit_cost),
    current: Number(row.current_unit_cost),
    change: Number(row.percent_change),
    annualImpact: Number(row.estimated_annual_impact ?? 0),
    createdAt: row.created_at,
  }));

  return {
    context,
    plan,
    annualImpact: alerts.reduce((sum, alert) => sum + Math.max(0, alert.annualImpact), 0),
    alertCount: alerts.length,
    supplierCount: suppliersResult.count ?? 0,
    invoiceCount: invoicesResult.count ?? 0,
    monthlyInvoiceCount: monthlyInvoicesResult.count ?? 0,
    invoiceLimit: plan.invoiceLimit,
    reviewCount: reviewResult.count ?? 0,
    locationCount: locationsResult.data?.length ?? 0,
    locationLimit: plan.locationLimit,
    locations: locationsResult.data ?? [],
    memberCount: membersResult.count ?? 0,
    entitlements: {
      financialImpact: hasEntitlement(context.plan, "financial_impact"),
      shrinkflation: hasEntitlement(context.plan, "shrinkflation_detection"),
      supplierComparison: hasEntitlement(context.plan, "supplier_comparison"),
      costTrends: hasEntitlement(context.plan, "cost_trends"),
      weeklySummary: hasEntitlement(context.plan, "weekly_summary"),
      teamAccess: hasEntitlement(context.plan, "team_access"),
      crossLocation: hasEntitlement(context.plan, "cross_location_comparison"),
      executiveReporting: hasEntitlement(context.plan, "executive_reporting"),
      roleBasedAccess: hasEntitlement(context.plan, "role_based_access"),
    },
    alerts: alerts.slice(0, 8),
  };
}
