function comparableQuantity(quantity, normalizedQuantity) {
  return normalizedQuantity && normalizedQuantity > 0 ? normalizedQuantity : quantity;
}
function unitCost(quantity, total, normalizedQuantity = null) {
  const q = comparableQuantity(quantity, normalizedQuantity);
  if (q <= 0) throw new Error("quantity");
  return total / q;
}
function pct(previous, current) {
  if (previous <= 0) throw new Error("previous");
  return ((current - previous) / previous) * 100;
}
function annual(previous, current, monthlyQty) {
  return Math.max(0, current - previous) * Math.max(0, monthlyQty) * 12;
}

// Direct quantity shrink: 24 billed units -> 20 billed units.
const oldUnit = unitCost(24, 120);
const newUnit = unitCost(20, 116);
if (oldUnit !== 5) throw new Error("Old unit cost failed");
if (Math.abs(newUnit - 5.8) > 1e-9) throw new Error("New unit cost failed");
if (Math.abs(pct(oldUnit, newUnit) - 16) > 1e-9) throw new Error("Percent change failed");

// Case-size shrink: invoice bills 1 case both times, but pack changes 24 -> 20.
const oldCaseUnit = unitCost(1, 120, 24);
const newCaseUnit = unitCost(1, 116, 20);
if (Math.abs(oldCaseUnit - 5) > 1e-9) throw new Error("Old case normalized unit cost failed");
if (Math.abs(newCaseUnit - 5.8) > 1e-9) throw new Error("New case normalized unit cost failed");
if (Math.abs(pct(oldCaseUnit, newCaseUnit) - 16) > 1e-9) throw new Error("Case-size shrink detection failed");

if (Math.abs(annual(72, 84, 20) - 2880) > 1e-9) throw new Error("Annual impact failed");
console.log("Cost engine validation passed");
