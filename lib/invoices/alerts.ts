import type { SupabaseClient } from "@supabase/supabase-js";
import { annualizedImpact, comparableQuantity, normalizedUnitCost, percentChange } from "@/lib/cost-engine";

export async function createCostAlertForItem(admin: SupabaseClient, invoiceItemId: string) {
  const { data: current, error: currentError } = await admin
    .from("invoice_items")
    .select("id,organization_id,invoice_id,supplier_id,product_id,quantity,normalized_quantity,normalized_unit,line_total,invoice_date")
    .eq("id", invoiceItemId)
    .single();
  if (currentError || !current?.product_id || !current.supplier_id) return null;

  let previousQuery = admin
    .from("invoice_items")
    .select("id,quantity,normalized_quantity,normalized_unit,line_total,invoice_date,created_at")
    .eq("organization_id", current.organization_id)
    .eq("supplier_id", current.supplier_id)
    .eq("product_id", current.product_id)
    .neq("id", current.id);

  if (current.invoice_date) previousQuery = previousQuery.lt("invoice_date", current.invoice_date);
  const { data: previousRows } = await previousQuery
    .order("invoice_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1);

  const previous = previousRows?.[0];
  if (!previous) return null;

  // If both invoices provide normalized units, only compare like-for-like units.
  if (current.normalized_unit && previous.normalized_unit && current.normalized_unit !== previous.normalized_unit) return null;

  const previousUnitCost = normalizedUnitCost({
    quantity: Number(previous.quantity),
    normalizedQuantity: previous.normalized_quantity == null ? null : Number(previous.normalized_quantity),
    lineTotal: Number(previous.line_total),
  });
  const currentUnitCost = normalizedUnitCost({
    quantity: Number(current.quantity),
    normalizedQuantity: current.normalized_quantity == null ? null : Number(current.normalized_quantity),
    lineTotal: Number(current.line_total),
  });
  const change = percentChange(previousUnitCost, currentUnitCost);
  const threshold = Number(process.env.COST_ALERT_THRESHOLD_PERCENT || 5);
  if (!Number.isFinite(change) || change < threshold) return null;

  const currentComparableQuantity = comparableQuantity({
    quantity: Number(current.quantity),
    normalizedQuantity: current.normalized_quantity == null ? null : Number(current.normalized_quantity),
  });
  const annualImpact = annualizedImpact(previousUnitCost, currentUnitCost, currentComparableQuantity);
  const { data: alert, error } = await admin
    .from("cost_alerts")
    .upsert({
      organization_id: current.organization_id,
      invoice_id: current.invoice_id,
      invoice_item_id: current.id,
      supplier_id: current.supplier_id,
      product_id: current.product_id,
      previous_unit_cost: previousUnitCost,
      current_unit_cost: currentUnitCost,
      percent_change: change,
      estimated_monthly_impact: annualImpact / 12,
      estimated_annual_impact: annualImpact,
      status: "open",
    }, { onConflict: "invoice_item_id" })
    .select("id")
    .single();

  if (error) throw new Error(`Could not save cost alert: ${error.message}`);
  return alert?.id ?? null;
}
