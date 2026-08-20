import type { SupabaseClient } from "@supabase/supabase-js";
import { addProductAlias } from "@/lib/matching";
import { createCostAlertForItem } from "@/lib/invoices/alerts";
import { sendInvoiceAlertSummary } from "@/lib/invoices/notifications";
import { recordAuditEvent } from "@/lib/audit";

export async function resolveMatchReview(
  admin: SupabaseClient,
  input: { reviewId: string; userId: string; action: "confirm" | "new_product" },
) {
  const { data: review, error } = await admin
    .from("match_reviews")
    .select("id,organization_id,invoice_id,invoice_item_id,supplier_id,candidate_product_id,raw_description,normalized_description,sku,status,confidence")
    .eq("id", input.reviewId)
    .single();
  if (error || !review) throw new Error("Review not found");
  if (review.status !== "pending") return { invoiceId: review.invoice_id, status: "already_resolved" as const };

  let productId = review.candidate_product_id as string | null;
  if (input.action === "new_product") {
    const { data: product, error: productError } = await admin
      .from("products")
      .upsert({
        organization_id: review.organization_id,
        normalized_name: review.normalized_description,
        sku: review.sku,
      }, { onConflict: "organization_id,normalized_name" })
      .select("id")
      .single();
    if (productError || !product) throw new Error("Could not create product");
    productId = product.id;
  }

  if (!productId) throw new Error("There is no candidate product to confirm");

  await addProductAlias(admin, {
    organizationId: review.organization_id,
    supplierId: review.supplier_id,
    productId,
    description: review.raw_description,
    sku: review.sku,
  });

  await admin.from("invoice_items").update({
    product_id: productId,
    match_confidence: input.action === "confirm" ? review.confidence : 1,
  }).eq("id", review.invoice_item_id);

  await admin.from("match_reviews").update({
    status: input.action === "confirm" ? "confirmed" : "new_product",
    resolved_by: input.userId,
    resolved_at: new Date().toISOString(),
  }).eq("id", review.id);

  await createCostAlertForItem(admin, review.invoice_item_id);
  await recordAuditEvent(admin, {
    organizationId: review.organization_id,
    userId: input.userId,
    eventType: input.action === "confirm" ? "product_match.confirmed" : "product_match.created_new",
    entityType: "invoice",
    entityId: review.invoice_id,
    metadata: { reviewId: review.id, productId, invoiceItemId: review.invoice_item_id },
  });

  const { count } = await admin
    .from("match_reviews")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", review.invoice_id)
    .eq("status", "pending");

  if ((count ?? 0) === 0) {
    await admin.from("invoices").update({
      status: "complete",
      processed_at: new Date().toISOString(),
      error_message: null,
    }).eq("id", review.invoice_id);
    await sendInvoiceAlertSummary(admin, review.invoice_id).catch((notifyError) => {
      console.error("ExpenseMargin review-complete email failed", notifyError);
    });
    return { invoiceId: review.invoice_id, status: "complete" as const };
  }

  return { invoiceId: review.invoice_id, status: "review_required" as const };
}
