import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

export async function getReviewData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("match_reviews")
    .select("id,raw_description,sku,confidence,created_at,suppliers(name),products!match_reviews_candidate_product_id_fkey(normalized_name)")
    .eq("organization_id", context.organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return {
    context,
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      description: row.raw_description,
      sku: row.sku,
      confidence: Number(row.confidence),
      supplier: row.suppliers?.name ?? "Unknown supplier",
      candidate: row.products?.normalized_name ?? null,
      createdAt: row.created_at,
    })),
  };
}
