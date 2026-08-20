import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";
import { normalizedUnitCost, percentChange } from "@/lib/cost-engine";

export async function getProductsData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();

  const [{ data: products }, { data: items }] = await Promise.all([
    supabase.from("products").select("id,normalized_name,sku").eq("organization_id", context.organizationId).order("normalized_name"),
    supabase
      .from("invoice_items")
      .select("product_id,quantity,normalized_quantity,normalized_unit,line_total,invoice_date,suppliers(name)")
      .eq("organization_id", context.organizationId)
      .not("product_id", "is", null)
      .order("invoice_date", { ascending: false })
      .limit(2000),
  ]);

  const byProduct = new Map<string, any[]>();
  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const rows = byProduct.get(item.product_id) ?? [];
    rows.push(item);
    byProduct.set(item.product_id, rows);
  }

  return {
    context,
    rows: (products ?? []).map((product) => {
      const history = byProduct.get(product.id) ?? [];
      const current = history[0];
      const previous = history[1];
      const currentCost = current ? normalizedUnitCost({ quantity: Number(current.quantity), normalizedQuantity: current.normalized_quantity == null ? null : Number(current.normalized_quantity), lineTotal: Number(current.line_total) }) : null;
      const previousCost = previous ? normalizedUnitCost({ quantity: Number(previous.quantity), normalizedQuantity: previous.normalized_quantity == null ? null : Number(previous.normalized_quantity), lineTotal: Number(previous.line_total) }) : null;
      return {
        id: product.id,
        name: product.normalized_name,
        sku: product.sku,
        supplier: current?.suppliers?.name ?? "—",
        currentCost,
        change: currentCost != null && previousCost != null && previousCost > 0 ? percentChange(previousCost, currentCost) : null,
        historyCount: history.length,
      };
    }),
  };
}
