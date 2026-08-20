import type { SupabaseClient } from "@supabase/supabase-js";
import { extractInvoiceWithOpenAI } from "@/lib/invoices/extract";
import { matchOrCreateProduct } from "@/lib/matching";
import { normalizeText } from "@/lib/normalize";
import { createCostAlertForItem } from "@/lib/invoices/alerts";
import { sendInvoiceAlertSummary } from "@/lib/invoices/notifications";
import { recordAuditEvent } from "@/lib/audit";

export type ProcessResult = {
  invoiceId: string;
  status: "complete" | "review_required";
  items: number;
  alertsCreated: number;
  reviewsCreated: number;
};

export async function processInvoice(admin: SupabaseClient, invoiceId: string): Promise<ProcessResult> {
  const { data: invoice, error: invoiceError } = await admin
    .from("invoices")
    .select("id,organization_id,storage_path,original_filename,mime_type")
    .eq("id", invoiceId)
    .single();
  if (invoiceError || !invoice?.storage_path) throw new Error("Invoice file is missing");

  const { data: blob, error: downloadError } = await admin.storage.from("invoices").download(invoice.storage_path);
  if (downloadError || !blob) throw new Error("Could not read invoice file");

  const parsed = await extractInvoiceWithOpenAI({
    bytes: await blob.arrayBuffer(),
    fileName: invoice.original_filename || invoice.storage_path.split("/").pop() || "invoice.pdf",
    mimeType: invoice.mime_type || blob.type || "application/pdf",
  });

  await admin.from("invoice_items").delete().eq("invoice_id", invoiceId);

  const normalizedSupplier = normalizeText(parsed.supplier);
  const { data: supplier, error: supplierError } = await admin
    .from("suppliers")
    .upsert(
      { organization_id: invoice.organization_id, name: parsed.supplier, normalized_name: normalizedSupplier },
      { onConflict: "organization_id,normalized_name" },
    )
    .select("id")
    .single();
  if (supplierError || !supplier) throw new Error("Could not save supplier");

  await admin.from("invoices").update({
    supplier_id: supplier.id,
    invoice_number: parsed.invoiceNumber,
    invoice_date: parsed.invoiceDate,
    currency: parsed.currency.toUpperCase(),
    subtotal: parsed.subtotal,
    fees: parsed.fees,
    tax: parsed.tax,
    total: parsed.total,
    error_message: null,
  }).eq("id", invoiceId);

  let reviewsCreated = 0;
  let alertsCreated = 0;

  for (const item of parsed.items) {
    const normalizedDescription = normalizeText(item.description);
    const { data: invoiceItem, error: itemError } = await admin
      .from("invoice_items")
      .insert({
        organization_id: invoice.organization_id,
        invoice_id: invoiceId,
        supplier_id: supplier.id,
        product_id: null,
        raw_description: item.description,
        normalized_description: normalizedDescription,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        normalized_quantity: item.normalizedQuantity,
        normalized_unit: item.normalizedUnit,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
        invoice_date: parsed.invoiceDate,
        match_confidence: null,
      })
      .select("id")
      .single();
    if (itemError || !invoiceItem) throw new Error(`Could not save invoice item: ${item.description}`);

    const match = await matchOrCreateProduct(admin, {
      organizationId: invoice.organization_id,
      supplierId: supplier.id,
      description: item.description,
      sku: item.sku,
    });

    if (match.kind === "review") {
      reviewsCreated += 1;
      const { error: reviewError } = await admin.from("match_reviews").insert({
        organization_id: invoice.organization_id,
        invoice_id: invoiceId,
        invoice_item_id: invoiceItem.id,
        supplier_id: supplier.id,
        candidate_product_id: match.candidateProductId,
        raw_description: item.description,
        normalized_description: normalizedDescription,
        sku: item.sku,
        confidence: match.confidence,
        status: "pending",
      });
      if (reviewError) throw new Error(`Could not create product review: ${reviewError.message}`);
      continue;
    }

    await admin.from("invoice_items").update({
      product_id: match.productId,
      match_confidence: match.confidence,
    }).eq("id", invoiceItem.id);

    const alertId = await createCostAlertForItem(admin, invoiceItem.id);
    if (alertId) alertsCreated += 1;
  }

  const status = reviewsCreated > 0 ? "review_required" : "complete";
  await admin.from("invoices").update({
    status,
    processed_at: new Date().toISOString(),
    processing_started_at: null,
    error_message: null,
  }).eq("id", invoiceId);

  await recordAuditEvent(admin, {
    organizationId: invoice.organization_id,
    actorType: "system",
    eventType: "invoice.processed",
    entityType: "invoice",
    entityId: invoiceId,
    metadata: { status, items: parsed.items.length, alertsCreated, reviewsCreated },
  });

  if (status === "complete") {
    await sendInvoiceAlertSummary(admin, invoiceId).catch((error) => {
      console.error("ExpenseMargin alert email failed", error);
    });
  }

  return { invoiceId, status, items: parsed.items.length, alertsCreated, reviewsCreated };
}
