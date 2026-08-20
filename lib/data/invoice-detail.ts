import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

export async function getInvoiceDetail(invoiceId: string) {
  const context = await getOrganizationContext();
  if (!context) return null;

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id,invoice_number,invoice_date,currency,subtotal,fees,tax,total,status,original_filename,created_at,processed_at,error_message,suppliers(name)")
    .eq("organization_id", context.organizationId)
    .eq("id", invoiceId)
    .maybeSingle();

  if (!invoice) return { context, invoice: null, items: [], alerts: [], reviewsPending: 0 };

  const [{ data: items }, { data: alerts }, { count: reviewsPending }] = await Promise.all([
    supabase
      .from("invoice_items")
      .select("id,raw_description,sku,quantity,unit,normalized_quantity,normalized_unit,unit_price,line_total,match_confidence,products(normalized_name)")
      .eq("organization_id", context.organizationId)
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: true }),
    supabase
      .from("cost_alerts")
      .select("id,previous_unit_cost,current_unit_cost,percent_change,estimated_monthly_impact,estimated_annual_impact,status,products(normalized_name)")
      .eq("organization_id", context.organizationId)
      .eq("invoice_id", invoiceId)
      .order("estimated_annual_impact", { ascending: false }),
    supabase
      .from("match_reviews")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId)
      .eq("invoice_id", invoiceId)
      .eq("status", "pending"),
  ]);

  return {
    context,
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      currency: invoice.currency ?? "USD",
      subtotal: invoice.subtotal == null ? null : Number(invoice.subtotal),
      fees: Number(invoice.fees ?? 0),
      tax: Number(invoice.tax ?? 0),
      total: invoice.total == null ? null : Number(invoice.total),
      status: invoice.status,
      filename: invoice.original_filename,
      supplier: (invoice as any).suppliers?.name ?? "Processing…",
      createdAt: invoice.created_at,
      processedAt: invoice.processed_at,
      errorMessage: invoice.error_message,
    },
    items: (items ?? []).map((item: any) => ({
      id: item.id,
      description: item.raw_description,
      sku: item.sku,
      quantity: Number(item.quantity),
      unit: item.unit,
      normalizedQuantity: item.normalized_quantity == null ? null : Number(item.normalized_quantity),
      normalizedUnit: item.normalized_unit,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
      confidence: item.match_confidence == null ? null : Number(item.match_confidence),
      product: item.products?.normalized_name ?? null,
    })),
    alerts: (alerts ?? []).map((alert: any) => ({
      id: alert.id,
      product: alert.products?.normalized_name ?? "Item",
      previousUnitCost: Number(alert.previous_unit_cost),
      currentUnitCost: Number(alert.current_unit_cost),
      percentChange: Number(alert.percent_change),
      monthlyImpact: alert.estimated_monthly_impact == null ? null : Number(alert.estimated_monthly_impact),
      annualImpact: alert.estimated_annual_impact == null ? null : Number(alert.estimated_annual_impact),
      status: alert.status,
    })),
    reviewsPending: reviewsPending ?? 0,
  };
}
