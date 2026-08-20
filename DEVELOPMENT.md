# ExpenseMargin Development & Launch Checklist

## 1. Required accounts

- GitHub repository
- Supabase project
- OpenAI API project/key
- Vercel project
- Resend account
- Stripe account

## 2. Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 3. Supabase

Run every SQL migration in `supabase/migrations/` in numeric order.

The migrations create:
- organizations and memberships
- suppliers and canonical products
- invoices and line items
- cost alerts
- private storage policies
- product aliases
- match review queue
- subscription records
- processing indexes and job claim functions

Before launch, verify with two test users that organization A cannot query or download organization B data.

## 4. OpenAI

Set:

```text
OPENAI_API_KEY=...
OPENAI_INVOICE_MODEL=gpt-5.6-luna
```

Use representative invoices from each initial target industry before launch. Measure:
- supplier extraction accuracy
- SKU accuracy
- quantity accuracy
- line-total accuracy
- false product-match rate
- review-queue rate

Do not change financial calculations to LLM-generated math.

## 5. Resend

Verify a sending domain or subdomain, then set:

```text
RESEND_API_KEY=...
RESEND_FROM_EMAIL=ExpenseMargin <alerts@updates.yourdomain.com>
```

The app sends an alert summary only when a completed invoice produced cost alerts.

## 6. Stripe

Create two recurring monthly Stripe Prices:

- Business — $39/month
- Pro — $99/month

Set:

```text
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_BUSINESS_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

Configure the webhook endpoint:

```text
https://YOUR_DOMAIN/api/stripe/webhook
```

Subscribe at minimum to:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Configure Stripe Customer Portal in both test and live mode.

## 7. Vercel

Import the GitHub repository into Vercel.

Set all environment variables for Production and Preview as appropriate.

Generate a strong random value for:

```text
CRON_SECRET=...
```

`vercel.json` calls `/api/cron/process-invoices` every five minutes. The endpoint requires `Authorization: Bearer $CRON_SECRET`.

Set:

```text
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
```

## 8. Validation before merging

```bash
npm run check
npm run typecheck
npm run build
```

The repository also contains `.github/workflows/ci.yml` for pull-request and `main` validation.

Because the current ChatGPT execution runtime could not complete npm registry downloads, dependency-level `typecheck` and `next build` must be executed in GitHub Actions, Codespaces, local development, or Vercel after dependencies are installed.

## 9. Production smoke test

Complete this sequence with Stripe test mode first:

1. Sign up.
2. Create organization.
3. Upload first invoice.
4. Confirm it processes without an alert because there is no prior price point.
5. Upload a second invoice containing a known price increase.
6. Confirm alert calculation.
7. Upload a description variant that creates an uncertain match.
8. Confirm the review screen blocks alert creation until resolved.
9. Resolve the match and confirm invoice completion.
10. Confirm Resend alert email.
11. Hit Free-plan invoice limit.
12. Upgrade through Stripe Checkout.
13. Confirm webhook changes plan and upload allowance.
14. Open Stripe billing portal.
15. Cancel/test payment failure and confirm subscription state changes.
16. Verify `/api/health` returns `ok` when required configuration is present.

## 10. Production data handling

- Never put secret keys in `NEXT_PUBLIC_*` variables.
- Keep Supabase invoice bucket private.
- Do not log invoice contents.
- Do not log Stripe webhook secrets or raw authorization headers.
- Use separate test/live Stripe keys.
- Rotate credentials immediately if exposed.
