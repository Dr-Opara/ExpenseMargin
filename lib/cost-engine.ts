export type PricePoint = {
  quantity: number;
  lineTotal: number;
  normalizedQuantity?: number | null;
};

export function comparableQuantity(point: Pick<PricePoint, "quantity" | "normalizedQuantity">): number {
  const normalized = Number(point.normalizedQuantity ?? 0);
  if (Number.isFinite(normalized) && normalized > 0) return normalized;
  if (!Number.isFinite(point.quantity) || point.quantity <= 0) throw new Error("Quantity must be greater than zero");
  return point.quantity;
}

export function normalizedUnitCost(point: PricePoint): number {
  const quantity = comparableQuantity(point);
  return point.lineTotal / quantity;
}

export function percentChange(previous: number, current: number): number {
  if (previous <= 0) throw new Error("Previous cost must be greater than zero");
  return ((current - previous) / previous) * 100;
}

export function annualizedImpact(previousUnitCost: number, currentUnitCost: number, monthlyComparableQuantity: number): number {
  return Math.max(0, currentUnitCost - previousUnitCost) * Math.max(0, monthlyComparableQuantity) * 12;
}

export function isMeaningfulIncrease(previous: number, current: number, thresholdPercent = 5): boolean {
  return percentChange(previous, current) >= thresholdPercent;
}
