# ExpenseMargin

**Track expenses. Protect margins.**

ExpenseMargin is a B2B cost-intelligence SaaS that compares recurring supplier invoice line items, detects unit-cost increases, and estimates the monthly and annual impact on business margins.

## Core capabilities

- Responsive marketing site and SaaS dashboard
- Supabase authentication and private organization workspaces
- Tenant-isolated database and private invoice storage with Row Level Security
- PDF/JPG/PNG invoice upload with plan-based monthly limits
- OpenAI structured invoice extraction using `gpt-5.6-luna` by default
- Supplier normalization and SKU/description-based product matching
- Human review queue for uncertain product matches
- Deterministic unit-cost, percentage-change, shrinkflation, and annual-impact calculations
- Persistent supplier cost alerts
- Background invoice retry worker using a secured Vercel Cron endpoint
- Resend email alerts after completed invoice analysis
- Stripe Checkout, subscription webhooks, and customer billing portal
- Free / Business Plus / Business Pro / Business Scale invoice-volume plans
- Tenant activity history and audit logging
- Health and readiness endpoints, request IDs, and production security headers
- Vercel Analytics and Speed Insights
- Public pricing, security, privacy, terms, sitemap, and customer auth recovery flows
- GitHub Actions CI workflow

## Architecture principle

AI interprets messy invoice data. ExpenseMargin application code performs all financial calculations.

## Local setup

1. Install dependencies: `npm install`
2. Copy environment variables: `cp .env.example .env.local`
3. Create a Supabase project and run SQL migrations in order.
4. Add the required environment values.
5. Run: `npm run dev`
6. Open `http://localhost:3000`.

## Required environment variables

See `.env.example` for the complete list.

Core:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

Production integrations:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BUSINESS_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_SCALE_PRICE_ID`
- `CRON_SECRET`

## Database migrations

Run all files in `supabase/migrations` in numeric order. v1.0.0 currently includes migrations `001` through `013`.

## Validation

```bash
npm run check
npm run typecheck
npm run build
```

The included deterministic validators cover:
- normalized unit-cost calculations
- annualized cost impact
- shrinkflation-style quantity changes
- supplier description abbreviation matching
- rejection of obviously unrelated product matches

## Current launch plans

- Free: $0/month, 5 invoices/month
- Business Plus: $99/month, 100 invoices/month
- Business Pro: $249/month, 500 invoices/month
- Business Scale: $449/month, 2,000 invoices/month
- Higher-volume customers: custom pricing

Stripe Price IDs are environment variables so commercial pricing can be managed independently from application secrets.

## Deployment

Recommended production stack:
- Vercel: Next.js hosting, Cron, Analytics, and Speed Insights
- Supabase: Auth, Postgres, Storage
- OpenAI API: invoice extraction
- Resend: transactional alerts
- Stripe: subscriptions and billing portal

See `DEVELOPMENT.md`, `ARCHITECTURE.md`, and `LAUNCH.md` for setup, implementation, and launch-readiness details.
