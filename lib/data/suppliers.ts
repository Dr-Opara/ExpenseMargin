import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

export async function getSuppliersData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();

  const [{ data: suppliers }, { data: invoices }, { data: alerts }] = await Promise.all([
    supabase.from("suppliers").select("id,name").eq("organization_id", context.organizationId).order("name"),
    supabase.from("invoices").select("supplier_id,total").eq("organization_id", context.organizationId).neq("status", "failed"),
    supabase.from("cost_alerts").select("supplier_id,status").eq("organization_id", context.organizationId).neq("status", "dismissed"),
  ]);

  const invoiceStats = new Map<string, { count: number; spend: number }>();
  for (const invoice of invoices ?? []) {
    if (!invoice.supplier_id) continue;
    const current = invoiceStats.get(invoice.supplier_id) ?? { count: 0, spend: 0 };
    current.count += 1;
    current.spend += Number(invoice.total ?? 0);
    invoiceStats.set(invoice.supplier_id, current);
  }

  const alertCounts = new Map<string, number>();
  for (const alert of alerts ?? []) {
    if (!alert.supplier_id) continue;
    alertCounts.set(alert.supplier_id, (alertCounts.get(alert.supplier_id) ?? 0) + 1);
  }

  return {
    context,
    rows: (suppliers ?? []).map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      invoices: invoiceStats.get(supplier.id)?.count ?? 0,
      spend: invoiceStats.get(supplier.id)?.spend ?? 0,
      alerts: alertCounts.get(supplier.id) ?? 0,
    })),
  };
}
