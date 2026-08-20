import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeText } from "@/lib/normalize";

export type ProductMatch =
  | { kind: "matched"; productId: string; confidence: number; method: string }
  | { kind: "new"; productId: string; confidence: number; method: string }
  | { kind: "review"; candidateProductId: string | null; confidence: number; method: string };

function tokenSet(value: string): Set<string> {
  return new Set(normalizeText(value).split(" ").filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 1;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function trigrams(value: string): Set<string> {
  const normalized = `  ${normalizeText(value)}  `;
  const grams = new Set<string>();
  for (let i = 0; i < normalized.length - 2; i += 1) grams.add(normalized.slice(i, i + 3));
  return grams;
}

function dice(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 1;
  let intersection = 0;
  for (const gram of a) if (b.has(gram)) intersection += 1;
  return (2 * intersection) / (a.size + b.size || 1);
}

export function descriptionSimilarity(a: string, b: string): number {
  const tokenScore = jaccard(tokenSet(a), tokenSet(b));
  const trigramScore = dice(trigrams(a), trigrams(b));
  return Math.max(0, Math.min(1, tokenScore * 0.65 + trigramScore * 0.35));
}

async function createAlias(
  admin: SupabaseClient,
  organizationId: string,
  supplierId: string,
  productId: string,
  description: string,
  sku: string | null,
) {
  const normalizedDescription = normalizeText(description);
  await admin.from("product_aliases").upsert(
    {
      organization_id: organizationId,
      supplier_id: supplierId,
      product_id: productId,
      normalized_description: normalizedDescription,
      sku: sku?.trim() || null,
    },
    { onConflict: "organization_id,supplier_id,normalized_description" },
  );
}

export async function matchOrCreateProduct(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    supplierId: string;
    description: string;
    sku: string | null;
  },
): Promise<ProductMatch> {
  const normalizedDescription = normalizeText(input.description);
  const sku = input.sku?.trim() || null;

  if (sku) {
    const { data: exactSku } = await admin
      .from("product_aliases")
      .select("product_id")
      .eq("organization_id", input.organizationId)
      .eq("supplier_id", input.supplierId)
      .ilike("sku", sku)
      .limit(1)
      .maybeSingle();
    if (exactSku?.product_id) return { kind: "matched", productId: exactSku.product_id, confidence: 1, method: "supplier_sku" };
  }

  const { data: exactDescription } = await admin
    .from("product_aliases")
    .select("product_id")
    .eq("organization_id", input.organizationId)
    .eq("supplier_id", input.supplierId)
    .eq("normalized_description", normalizedDescription)
    .limit(1)
    .maybeSingle();
  if (exactDescription?.product_id) {
    return { kind: "matched", productId: exactDescription.product_id, confidence: 0.99, method: "supplier_description" };
  }

  const { data: exactProduct } = await admin
    .from("products")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("normalized_name", normalizedDescription)
    .limit(1)
    .maybeSingle();
  if (exactProduct?.id) {
    await createAlias(admin, input.organizationId, input.supplierId, exactProduct.id, input.description, sku);
    return { kind: "matched", productId: exactProduct.id, confidence: 0.96, method: "organization_description" };
  }

  const { data: aliases } = await admin
    .from("product_aliases")
    .select("product_id, supplier_id, normalized_description")
    .eq("organization_id", input.organizationId)
    .limit(1500);

  let best: { productId: string; score: number } | null = null;
  for (const alias of aliases ?? []) {
    let score = descriptionSimilarity(normalizedDescription, alias.normalized_description);
    if (alias.supplier_id === input.supplierId) score = Math.min(1, score + 0.04);
    if (!best || score > best.score) best = { productId: alias.product_id, score };
  }

  if (best && best.score >= 0.88) {
    await createAlias(admin, input.organizationId, input.supplierId, best.productId, input.description, sku);
    return { kind: "matched", productId: best.productId, confidence: best.score, method: "description_similarity" };
  }

  if (best && best.score >= 0.58) {
    return { kind: "review", candidateProductId: best.productId, confidence: best.score, method: "ambiguous_description" };
  }

  const { data: product, error } = await admin
    .from("products")
    .insert({
      organization_id: input.organizationId,
      normalized_name: normalizedDescription,
      sku,
    })
    .select("id")
    .single();
  if (error || !product) throw new Error(`Could not create product for ${input.description}`);

  await createAlias(admin, input.organizationId, input.supplierId, product.id, input.description, sku);
  return { kind: "new", productId: product.id, confidence: 1, method: "new_product" };
}

export async function addProductAlias(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    supplierId: string;
    productId: string;
    description: string;
    sku: string | null;
  },
) {
  await createAlias(admin, input.organizationId, input.supplierId, input.productId, input.description, input.sku);
}
