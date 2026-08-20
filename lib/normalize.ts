const TOKEN_ALIASES: Record<string, string> = {
  glv: "gloves",
  glvs: "gloves",
  nit: "nitrile",
  lg: "large",
  lrg: "large",
  sm: "small",
  med: "medium",
  md: "medium",
  xl: "xlarge",
  xlg: "xlarge",
  ct: "count",
  cnt: "count",
  pc: "piece",
  pcs: "piece",
  ea: "each",
  pk: "pack",
  pkg: "pack",
  bx: "box",
  gal: "gallon",
  gals: "gallon",
  qt: "quart",
  qts: "quart",
  oz: "ounce",
  lb: "pound",
  lbs: "pound",
  ft: "foot",
  in: "inch",
  blk: "black",
  wht: "white",
};

const NOISE_TOKENS = new Set(["x"]);

export function normalizeText(value: string): string {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/([0-9])([a-z])/g, "$1 $2")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return base
    .split(" ")
    .filter(Boolean)
    .flatMap((token) => {
      if (NOISE_TOKENS.has(token)) return [];
      return [TOKEN_ALIASES[token] ?? token];
    })
    .join(" ");
}
