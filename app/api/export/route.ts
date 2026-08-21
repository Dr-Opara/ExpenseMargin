import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";
import { hasEntitlement } from "@/lib/billing/plans";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const context = await getOrganizationContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasEntitlement(context.plan, "data_export")) {
    return NextResponse.json({ error: "Data export is available on Growth and Multi-Location plans." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoice_items")
    .select("invoice_id,invoice_date,raw_description,normalized_description,sku,quantity,normalized_quantity,normalized_unit,unit_price,line_total,suppliers(name),invoices(invoice_number,location_id)")
    .eq("organization_id", context.organizationId)
    .order("invoice_date", { ascending: false })
    .limit(10000);

  if (error) return NextResponse.json({ error: "Could not export data" }, { status: 500 });

  const header = ["invoice_id","invoice_number","invoice_date","supplier","description","normalized_description","sku","quantity","normalized_quantity","normalized_unit","unit_price","line_total","location_id"];
  const rows = (data ?? []).map((row:any) => [
    row.invoice_id,
    row.invoices?.invoice_number,
    row.invoice_date,
    row.suppliers?.name,
    row.raw_description,
    row.normalized_description,
    row.sku,
    row.quantity,
    row.normalized_quantity,
    row.normalized_unit,
    row.unit_price,
    row.line_total,
    row.invoices?.location_id,
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expensemargin-${new Date().toISOString().slice(0,10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
