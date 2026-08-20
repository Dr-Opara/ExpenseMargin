import fs from "node:fs";
import path from "node:path";

const required = [
  "package.json",
  "app/page.tsx",
  "app/dashboard/page.tsx",
  "app/invoices/page.tsx",
  "app/review/page.tsx",
  "app/billing/page.tsx",
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/onboarding/page.tsx",
  "app/api/invoices/upload/route.ts",
  "app/api/invoices/process/route.ts",
  "app/api/cron/process-invoices/route.ts",
  "app/api/billing/checkout/route.ts",
  "app/api/billing/portal/route.ts",
  "app/api/stripe/webhook/route.ts",
  "app/api/health/route.ts",
  "lib/cost-engine.ts",
  "lib/matching.ts",
  "lib/invoices/process.ts",
  "supabase/migrations/001_initial_schema.sql",
  "supabase/migrations/006_billing_and_job_claims.sql",
  ".github/workflows/ci.yml",
  ".env.example",
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error("Missing required files:", missing);
  process.exit(1);
}
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["dev", "build", "start", "typecheck", "check"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`Missing npm script: ${script}`);
}
console.log(`Project structure check passed (${required.length} critical files).`);
