const aliases = {
  glv:"gloves", glvs:"gloves", nit:"nitrile", lg:"large", lrg:"large", sm:"small",
  med:"medium", md:"medium", xl:"xlarge", xlg:"xlarge", ct:"count", cnt:"count",
  pc:"piece", pcs:"piece", ea:"each", pk:"pack", pkg:"pack", bx:"box", gal:"gallon",
  gals:"gallon", qt:"quart", qts:"quart", oz:"ounce", lb:"pound", lbs:"pound",
  ft:"foot", in:"inch", blk:"black", wht:"white"
};
function normalizeText(value) {
  return value.toLowerCase().normalize("NFKD")
    .replace(/([0-9])([a-z])/g,"$1 $2").replace(/([a-z])([0-9])/g,"$1 $2")
    .replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")
    .split(" ").filter(Boolean).flatMap(t => t === "x" ? [] : [aliases[t] ?? t]).join(" ");
}
function tokenSet(value) { return new Set(normalizeText(value).split(" ").filter(Boolean)); }
function jaccard(a,b) { let i=0; for (const t of a) if (b.has(t)) i++; const u=new Set([...a,...b]).size; return u ? i/u : 0; }
function trigrams(value) { const n=`  ${normalizeText(value)}  `; const g=new Set(); for(let i=0;i<n.length-2;i++) g.add(n.slice(i,i+3)); return g; }
function dice(a,b) { let i=0; for(const g of a) if(b.has(g)) i++; return (2*i)/(a.size+b.size||1); }
function similarity(a,b) { return Math.max(0,Math.min(1,jaccard(tokenSet(a),tokenSet(b))*.65+dice(trigrams(a),trigrams(b))*.35)); }

const cases = [
  ["NIT GLOVES LG 100CT", "Nitrile Gloves Large 100 Count", 0.88],
  ["CLN BLEACH 1GAL 6CT", "Commercial Bleach 6 x 1 Gallon", 0.35],
  ["12/2 ROMEX 250FT", "Romex 12-2 Wire 250 ft", 0.58],
  ["Nitrile Gloves Large", "Printer Toner Black", 0.58, true],
];
for (const [a,b,threshold,expectBelow] of cases) {
  const s=similarity(a,b);
  console.log(`${a} <> ${b}: ${s.toFixed(3)}`);
  if (expectBelow ? s >= threshold : s < threshold) throw new Error(`Unexpected similarity for ${a}`);
}
console.log("Matching validation passed");
