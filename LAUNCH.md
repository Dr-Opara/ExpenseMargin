# ExpenseMargin v1.0.0 Launch Checklist

ExpenseMargin v1.0.0 is the first customer-ready release train after the production MVP.

## Required production configuration

Core:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_INVOICE_MODEL`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`

Billing:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BUSINESS_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_SCALE_PRICE_ID`

Notifications:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Pricing at launch

- Free — $0/month, 5 invoices/month
- Business — $99/month, 100 invoices/month
- Pro — $249/month, 500 invoices/month
- Scale — $499/month, 2,000 invoices/month
- Higher volume — custom pricing

## External account configuration

### Supabase Auth
Set the production Site URL to the canonical ExpenseMargin domain and allow the auth callback URL:

`https://<expensemargin-domain>/auth/callback`

Keep email confirmation enabled for public signup unless a deliberate launch decision disables it.

### Stripe
Create recurring monthly prices for Business ($99), Pro ($249), and Scale ($499), configure the corresponding Vercel environment variables, and point the production webhook to:

`https://<expensemargin-domain>/api/stripe/webhook`

Recommended events include checkout completion, subscription create/update/delete, invoice paid, and invoice payment failed.

### Resend
Verify the production sending domain and configure `RESEND_FROM_EMAIL` with a verified sender.

### Vercel
Set `NEXT_PUBLIC_APP_URL` to the canonical production URL, verify the cron route is enabled, and confirm Analytics/Speed Insights are collecting production traffic.

## Consolidated QA after build completion

1. Create a new account and confirm email.
2. Complete organization onboarding.
3. Upload two invoices from the same supplier with a known price change.
4. Verify extraction, normalization, product matching/review, and cost alerts.
5. Verify invoice-detail, supplier, product, alert, review, activity, billing, and settings views.
6. Verify Free plan enforcement at 5 invoices/month.
7. Test Business, Pro, and Scale Stripe checkout and customer portal.
8. Confirm Stripe webhook idempotency and subscription state changes.
9. Confirm Resend alert delivery and delivery-history logging.
10. Test password reset and sign-out.
11. Verify `/api/health` and `/api/ready` return healthy status.
12. Review Vercel runtime errors, Supabase security/performance advisors, mobile layout, metadata, sitemap, and robots policy.

Do not declare public launch complete until this consolidated QA pass is green.
