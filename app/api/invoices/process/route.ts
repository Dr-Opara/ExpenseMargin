import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processInvoice } from "@/lib/invoices/process";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : "";
  if (!invoiceId) return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id,status,attempt_count")
    .eq("id", invoiceId)
    .single();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (!["queued", "failed", "processing"].includes(invoice.status)) {
    return NextResponse.json({ invoiceId, status: invoice.status });
  }

  const admin = createAdminClient();
  const { data: claimed, error: claimError } = await admin.rpc("claim_invoice_job", { job_id: invoiceId });
  if (claimError) return NextResponse.json({ error: claimError.message }, { status: 500 });
  if (!claimed) {
    return NextResponse.json({ invoiceId, status: invoice.status, message: "Invoice is already being processed or has reached the retry limit." }, { status: 409 });
  }

  try {
    const result = await processInvoice(admin, invoiceId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invoice processing failed";
    await admin.from("invoices").update({
      status: "failed",
      processing_started_at: null,
      error_message: message.slice(0, 1000),
    }).eq("id", invoiceId);
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
