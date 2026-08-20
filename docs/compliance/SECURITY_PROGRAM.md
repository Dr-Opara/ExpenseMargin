# Information Security Program

## Purpose
Protect ExpenseMargin customer data, service availability, credentials, code, and business operations through risk-based administrative, technical, and operational safeguards.

## Scope
Production application code, Supabase databases/storage/authentication, Vercel hosting, GitHub repositories and CI, OpenAI invoice extraction, Stripe billing, Resend notifications, administrator endpoints, supporting laptops/accounts, and third parties that can materially affect the service.

## Governance
- Security risks are reviewed at least quarterly and after significant architecture/provider changes.
- Every material control has a named owner and evidence source.
- Security exceptions must identify business justification, compensating controls, owner, and expiration date.
- Security policies are reviewed at least annually and after major incidents or regulatory changes.

## Core requirements
- Least privilege and named administrator accounts.
- MFA on production and source-control provider accounts.
- Secrets remain in approved secret-management/environment systems and must never be committed to source control.
- Customer invoice data remains private by default and tenant-scoped.
- Production changes require automated validation and traceable source-control history.
- Vulnerabilities are triaged according to severity and exploitability.
- Security events and material administrative actions are auditable.
- Incidents are documented, contained, eradicated, recovered, and reviewed.
- Critical vendors are assessed before adoption and periodically thereafter.
- Backup and recovery capabilities are verified periodically.

## Compliance statements
ExpenseMargin may state that it maintains a SOC 2 readiness program. It must not state or imply that it is SOC 2 certified, SOC 2 compliant, ISO 27001 certified, HIPAA compliant, or otherwise independently certified unless a current applicable report/certification exists and the claim accurately reflects its scope.
