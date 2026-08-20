# ExpenseMargin v1.0.1 — Launch Pricing Update

This patch release finalizes the customer-facing B2B pricing structure while preserving the existing internal billing plan IDs and Stripe integration model.

## Pricing
- Free — $0/month, 5 invoices/month
- Business Plus — $99/month, 100 invoices/month
- Business Pro — $249/month, 500 invoices/month
- Business Scale — $449/month, 2,000 invoices/month
- Higher-volume customers — custom pricing

## Notes
- Internal plan IDs remain `free`, `business`, `pro`, and `scale` for billing/webhook stability.
- Existing invoice limits are unchanged.
- Business Scale is reduced from $499 to $449/month.
- Stripe production Price IDs must be created/configured to match these final commercial prices before paid checkout is enabled for customers.
