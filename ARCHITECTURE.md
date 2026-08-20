# ExpenseMargin Architecture

## Product promise

Upload or forward recurring supplier invoices and identify cost increases before they quietly reduce profit margins.

## Core request path

1. User authenticates with Supabase Auth.
2. User creates an organization workspace through the `create_organization` RPC.
3. Invoice upload API validates authentication, plan allowance, MIME type, and 12 MB file size limit.
4. Invoice is stored in the private Supabase `invoices` bucket under `<organization>/<invoice>/<file>`.
5. Invoice record enters `queued` status.
6. The user-triggered processor or secured Vercel Cron worker atomically claims the invoice job.
7. Server downloads the private file using Supabase service credentials.
8. File is temporarily uploaded to OpenAI with the `user_data` purpose and a short expiration.
9. OpenAI returns strict JSON-schema invoice data.
10. Zod validates extracted supplier, date, totals, SKU, quantity, unit, and line-item values.
11. Supplier identity is normalized and persisted.
12. Product matcher tries, in order:
    - supplier SKU alias
    - exact normalized supplier description
    - exact organization-level normalized description
    - abbreviation-aware description similarity
13. High-confidence matches link automatically.
14. Ambiguous matches create a `match_reviews` record and do not affect price history until a user confirms them.
15. New products create a canonical product plus supplier alias.
16. Application code calculates effective unit cost from billed quantity and line total.
17. Current effective unit cost is compared with the most recent prior matched invoice item from the same supplier.
18. Increases above the configured threshold create a `cost_alerts` record.
19. Completed invoices trigger a Resend summary email when alerts exist.
20. Stripe webhooks synchronize paid plan state and invoice-processing limits.

## Matching safety model

ExpenseMargin intentionally favors human review over false financial alerts.

- Exact supplier SKU: auto-match
- Exact normalized alias: auto-match
- Strong similarity: auto-match
- Medium similarity: review queue
- Low similarity: new product

A pending match cannot generate a cost alert.

Common supplier abbreviations and compact units are normalized, including patterns such as:
- `LG` → `large`
- `CT` → `count`
- `GAL` → `gallon`
- `250FT` → `250 foot`
- `100CT` → `100 count`

## Financial engine

The LLM does not calculate percentage changes or annual impact.

Application code calculates:

`effective unit cost = line total / quantity`

`percentage change = ((current - previous) / previous) * 100`

`annualized impact = max(current - previous, 0) * current monthly quantity * 12`

This also detects quantity shrinkage where an invoice total may fall while the true per-unit price rises.

## Background processing

Invoices use lifecycle states:

- `uploaded`
- `queued`
- `processing`
- `review_required`
- `complete`
- `failed`

The database exposes service-role-only atomic claim functions so duplicate browser requests or cron invocations do not process the same invoice concurrently.

Failed/stale jobs can be retried up to three attempts. A processing job older than 15 minutes can be reclaimed.

## Billing

Plans are enforced before invoice storage:

- Free: 5 invoices/month
- Business: 100 invoices/month
- Pro: 500 invoices/month

Stripe Checkout creates subscriptions. Stripe webhooks are the billing source of truth. The Stripe customer portal handles payment method changes, invoices, and cancellation flows.

## Security boundaries

- Supabase RLS isolates organization data.
- Invoice storage bucket is private.
- Browser never receives service-role credentials, OpenAI API keys, Resend keys, Stripe secret keys, or webhook secrets.
- Invoice uploads are restricted by MIME type and size.
- Vercel Cron endpoint requires `CRON_SECRET` bearer authentication.
- Stripe webhook payloads are verified using the signed raw request body and timestamp tolerance.
- Security headers include HSTS, frame denial, no-sniff, referrer restrictions, and permissions policy.
- Temporary OpenAI files are deleted after processing and also configured with short expiration.

## External services

- **Supabase**: authentication, PostgreSQL, RLS, storage
- **OpenAI**: structured invoice extraction
- **Resend**: transactional cost-alert email
- **Stripe**: Checkout, subscription state, billing portal
- **Vercel**: Next.js hosting and scheduled processing
- **GitHub**: source control and CI

## Future expansion after MVP validation

Do not add these until users prove demand:

- alternative supplier discovery
- RFQ automation
- accounting integrations
- email invoice ingestion
- contract-vs-invoice audits
- multiple locations with consolidated reporting
- supplier benchmarking network
