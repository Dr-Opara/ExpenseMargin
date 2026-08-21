import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";
import { hasEntitlement } from "@/lib/billing/plans";

type ItemRow = {
  product_id: string | null;
  supplier_id: string | null;
  invoice_id: string;
  raw_description: string | null;
  normalized_description: string | null;
  quantity: number | string | null;
  normalized_quantity: number | string | null;
  normalized_unit: string | null;
  unit_price: number | string | null;
  line_total: number | string | null;
  invoice_date: string | null;
  created_at: string;
  suppliers?: { name?: string | null } | null;
  invoices?: { location_id?: string | null; invoice_date?: string | null; total?: number | string | null } | null;
};

const n = (v: unknown) => Number(v ?? 0);

export async function getInsightsData() {
  const context = await getOrganizationContext();
  if (!context) return null;

  const supabase = await createClient();
  const { data: itemsRaw } = await supabase
    .from("invoice_items")
    .select("product_id,supplier_id,invoice_id,raw_description,normalized_description,quantity,normalized_quantity,normalized_unit,unit_price,line_total,invoice_date,created_at,suppliers(name),invoices(location_id,invoice_date,total)")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: true })
    .limit(3000);

  const items = (itemsRaw ?? []) as unknown as ItemRow[];
  const productGroups = new Map<string, ItemRow[]>();
  for (const row of items) {
    const key = row.product_id || row.normalized_description || row.raw_description || "unknown";
    const arr = productGroups.get(key) ?? [];
    arr.push(row);
    productGroups.set(key, arr);
  }

  const supplierComparisons = Array.from(productGroups.entries())
    .map(([key, rows]) => {
      const bySupplier = new Map<string, { name: string; values: number[] }>();
      for (const row of rows) {
        if (!row.supplier_id || !row.unit_price) continue;
        const name = row.suppliers?.name || "Supplier";
        const current = bySupplier.get(row.supplier_id) ?? { name, values: [] };
        current.values.push(n(row.unit_price));
        bySupplier.set(row.supplier_id, current);
      }
      if (bySupplier.size < 2) return null;
      const options = Array.from(bySupplier.values()).map((s) => ({
        supplier: s.name,
        averageUnitCost: s.values.reduce((a, b) => a + b, 0) / Math.max(1, s.values.length),
      })).sort((a, b) => a.averageUnitCost - b.averageUnitCost);
      return {
        item: rows.at(-1)?.normalized_description || rows.at(-1)?.raw_description || key,
        lowestSupplier: options[0].supplier,
        lowestCost: options[0].averageUnitCost,
        highestSupplier: options.at(-1)!.supplier,
        highestCost: options.at(-1)!.averageUnitCost,
        spreadPct: options[0].averageUnitCost > 0 ? ((options.at(-1)!.averageUnitCost - options[0].averageUnitCost) / options[0].averageUnitCost) * 100 : 0,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.spreadPct - a.spreadPct)
    .slice(0, 20) as Array<{item:string;lowestSupplier:string;lowestCost:number;highestSupplier:string;highestCost:number;spreadPct:number}>;

  const monthMap = new Map<string, { spend: number; lines: number }>();
  for (const row of items) {
    const date = row.invoice_date || row.invoices?.invoice_date || row.created_at;
    if (!date) continue;
    const month = date.slice(0, 7);
    const cur = monthMap.get(month) ?? { spend: 0, lines: 0 };
    cur.spend += n(row.line_total);
    cur.lines += 1;
    monthMap.set(month, cur);
  }
  const costTrends = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, v]) => ({ month, spend: v.spend, lineItems: v.lines }));

  const shrinkflationSignals: Array<{item:string;previousQty:number;currentQty:number;previousCost:number;currentCost:number;changePct:number}> = [];
  for (const rows of productGroups.values()) {
    const sorted = [...rows].sort((a,b) => (a.invoice_date || a.created_at).localeCompare(b.invoice_date || b.created_at));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      const prevQty = n(prev.normalized_quantity || prev.quantity);
      const curQty = n(cur.normalized_quantity || cur.quantity);
      const prevCost = n(prev.unit_price);
      const curCost = n(cur.unit_price);
      if (prevQty > 0 && curQty > 0 && curQty < prevQty && curCost >= prevCost * 0.95) {
        shrinkflationSignals.push({
          item: cur.normalized_description || cur.raw_description || "Item",
          previousQty: prevQty,
          currentQty: curQty,
          previousCost: prevCost,
          currentCost: curCost,
          changePct: ((prevQty - curQty) / prevQty) * 100,
        });
      }
    }
  }

  const locationRows = new Map<string, { spend:number; invoices:Set<string>; items:number }>();
  for (const row of items) {
    const loc = row.invoices?.location_id || "unassigned";
    const cur = locationRows.get(loc) ?? { spend:0, invoices:new Set<string>(), items:0 };
    cur.spend += n(row.line_total);
    cur.invoices.add(row.invoice_id);
    cur.items += 1;
    locationRows.set(loc, cur);
  }

  let locationNames = new Map<string,string>();
  if (hasEntitlement(context.plan, "cross_location_comparison")) {
    const { data: locations } = await supabase.from("locations").select("id,name").eq("organization_id", context.organizationId);
    locationNames = new Map((locations ?? []).map((l:any) => [l.id, l.name]));
  }
  const locationComparison = Array.from(locationRows.entries()).map(([id,v]) => ({
    locationId: id,
    location: id === "unassigned" ? "Unassigned" : (locationNames.get(id) || "Location"),
    spend: v.spend,
    invoices: v.invoices.size,
    lineItems: v.items,
  })).sort((a,b) => b.spend - a.spend);

  return {
    context,
    entitlements: {
      supplierComparison: hasEntitlement(context.plan, "supplier_comparison"),
      costTrends: hasEntitlement(context.plan, "cost_trends"),
      shrinkflation: hasEntitlement(context.plan, "shrinkflation_detection"),
      export: hasEntitlement(context.plan, "data_export"),
      crossLocation: hasEntitlement(context.plan, "cross_location_comparison"),
      executiveReporting: hasEntitlement(context.plan, "executive_reporting"),
    },
    supplierComparisons,
    costTrends,
    shrinkflationSignals: shrinkflationSignals.slice(0, 20),
    locationComparison,
  };
}
