import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

export async function getAlertsData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("cost_alerts")
    .select("id,status,previous_unit_cost,current_unit_cost,percent_change,estimated_monthly_impact,estimated_annual_impact,created_at,suppliers(name),products(normalized_name)")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  return {
    context,
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      status: row.status,
      supplier: row.suppliers?.name ?? "Unknown supplier",
      item: row.products?.normalized_name ?? "Unmatched item",
      previous: Number(row.previous_unit_cost),
      current: Number(row.current_unit_cost),
      change: Number(row.percent_change),
      monthlyImpact: Number(row.estimated_monthly_impact ?? 0),
      annualImpact: Number(row.estimated_annual_impact ?? 0),
      createdAt: row.created_at,
    })),
  };
}
