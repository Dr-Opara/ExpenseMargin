import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext, planInvoiceLimit } from "@/lib/data/context";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const context = await getOrganizationContext();
  if (!context) return NextResponse.json({ error: "No organization found for user" }, { status: 409 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File is required" }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File exceeds 12 MB limit" }, { status: 413 });

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", context.organizationId)
    .gte("created_at", monthStart.toISOString());

  const limit = planInvoiceLimit(context.plan);
  if ((count ?? 0) >= limit) {
    return NextResponse.json({
      error: `Your ${context.plan} plan includes ${limit} invoices per month. Upgrade to continue.`,
      code: "plan_limit_reached",
    }, { status: 402 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      organization_id: context.organizationId,
      status: "uploaded",
      original_filename: file.name,
      mime_type: file.type,
    })
    .select("id")
    .single();
  if (invoiceError || !invoice) return NextResponse.json({ error: "Could not create invoice record" }, { status: 500 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${context.organizationId}/${invoice.id}/${safeName}`;
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage.from("invoices").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    await supabase.from("invoices").update({ status: "failed", error_message: uploadError.message }).eq("id", invoice.id);
    return NextResponse.json({ error: "Could not store invoice" }, { status: 500 });
  }

  await supabase.from("invoices").update({ storage_path: path, status: "queued" }).eq("id", invoice.id);
  return NextResponse.json({ invoiceId: invoice.id, status: "queued" }, { status: 201 });
}
