import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

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

  const [alertsResult, suppliersResult, invoicesResult, reviewResult] = await Promise.all([
    supabase
      .from("cost_alerts")
      .select("id, previous_unit_cost, current_unit_cost, percent_change, estimated_annual_impact, created_at, suppliers(name), products(normalized_name)")
      .eq("organization_id", context.organizationId)
      .neq("status", "dismissed")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("suppliers")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId)
      .eq("status", "complete"),
    supabase
      .from("match_reviews")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId)
      .eq("status", "pending"),
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
    annualImpact: alerts.reduce((sum, alert) => sum + Math.max(0, alert.annualImpact), 0),
    alertCount: alerts.length,
    supplierCount: suppliersResult.count ?? 0,
    invoiceCount: invoicesResult.count ?? 0,
    reviewCount: reviewResult.count ?? 0,
    alerts: alerts.slice(0, 8),
  };
}
