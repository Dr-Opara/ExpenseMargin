import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrganizationContext, planInvoiceLimit } from "@/lib/data/context";
import { recordAuditEvent } from "@/lib/audit";

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

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const admin = createAdminClient();
  const { data: invoiceId, error: invoiceError } = await admin.rpc("create_invoice_with_plan_limit", {
    target_org: context.organizationId,
    p_original_filename: safeName,
    p_mime_type: file.type,
  });

  if (invoiceError || !invoiceId) {
    if (invoiceError?.message?.includes("plan_limit_reached")) {
      const limit = planInvoiceLimit(context.plan);
      return NextResponse.json({
        error: `Your ${context.plan} plan includes ${limit} invoices per month. Upgrade to continue.`,
        code: "plan_limit_reached",
      }, { status: 402 });
    }
    console.error("Could not reserve invoice upload", invoiceError);
    return NextResponse.json({ error: "Could not create invoice record" }, { status: 500 });
  }

  const path = `${context.organizationId}/${invoiceId}/${safeName}`;
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage.from("invoices").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    await admin.from("invoices").update({ status: "failed", error_message: uploadError.message }).eq("id", invoiceId);
    return NextResponse.json({ error: "Could not store invoice" }, { status: 500 });
  }

  await admin.from("invoices").update({ storage_path: path, status: "queued" }).eq("id", invoiceId);
  await recordAuditEvent(admin, {
    organizationId: context.organizationId,
    userId: user.id,
    eventType: "invoice.uploaded",
    entityType: "invoice",
    entityId: invoiceId,
    metadata: { filename: safeName, mimeType: file.type, size: file.size, plan: context.plan },
  });
  return NextResponse.json({ invoiceId, status: "queued" }, { status: 201 });
}
