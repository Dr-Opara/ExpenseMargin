import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id,status,processed_at,error_message")
    .eq("id", id)
    .maybeSingle();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const [{ count: alerts }, { count: reviews }] = await Promise.all([
    supabase.from("cost_alerts").select("id", { count: "exact", head: true }).eq("invoice_id", id).neq("status", "dismissed"),
    supabase.from("match_reviews").select("id", { count: "exact", head: true }).eq("invoice_id", id).eq("status", "pending"),
  ]);

  return NextResponse.json({
    invoiceId: invoice.id,
    status: invoice.status,
    processedAt: invoice.processed_at,
    error: invoice.error_message,
    alertsCreated: alerts ?? 0,
    reviewsPending: reviews ?? 0,
  });
}
