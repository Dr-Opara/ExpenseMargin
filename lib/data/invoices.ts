import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

export async function getInvoicesData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id,invoice_number,invoice_date,currency,total,status,original_filename,created_at,suppliers(name)")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    context,
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      supplier: row.suppliers?.name ?? "Processing…",
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      total: row.total == null ? null : Number(row.total),
      currency: row.currency ?? "USD",
      status: row.status,
      filename: row.original_filename,
      createdAt: row.created_at,
    })),
  };
}
