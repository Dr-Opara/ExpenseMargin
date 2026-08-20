# Access Control Policy

## Principles
Access is granted by business need, uses named accounts, follows least privilege, and is removed promptly when no longer required.

## Customer application
- Supabase Auth identifies users.
- Organization membership establishes tenant access.
- Roles are `owner`, `admin`, and `member`.
- Row Level Security enforces tenant isolation at the database layer.
- Owner/admin privileges are required for billing changes, organization settings, and workspace export.

## Production administration
Administrator access to GitHub, Vercel, Supabase, Stripe, Resend, and OpenAI must:
- use individually assigned accounts;
- enable MFA where supported;
- avoid shared passwords or shared API credentials;
- be limited to personnel with a current operational need;
- be reviewed at least quarterly and after role/relationship changes.

## Joiner / mover / leaver
- New access requires owner approval.
- Changed responsibilities require access review and removal of unnecessary privileges.
- Departing personnel lose access to production, source control, secrets, and business systems as soon as practical and no later than the end of their authorized access period.
- Relevant credentials/API keys are rotated when shared exposure cannot be ruled out.

## Evidence
Retain access-review records, provider member lists, role changes, relevant audit events, and remediation actions.
