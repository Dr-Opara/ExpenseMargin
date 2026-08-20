# SOC 2 Readiness Control Matrix

This matrix is an internal readiness map. It does not reproduce the AICPA Trust Services Criteria and does not represent an audit opinion. An independent CPA firm must determine final SOC 2 scope, control wording, testing procedures, and report conclusions.

| Control ID | Control objective | ExpenseMargin implementation | Primary evidence | Frequency | Owner | Status |
|---|---|---|---|---|---|---|
| EM-AC-01 | Access is authorized and least-privileged | Supabase Auth, tenant memberships, RBAC roles, RLS, admin-only settings/billing/export | RLS policies, membership records, access review | Quarterly | Security/Engineering | Implemented |
| EM-AC-02 | Privileged production access is restricted | Service-role secrets are server-side only; production platforms require named accounts | Vercel/Supabase/GitHub access lists | Quarterly | Security | Operational requirement |
| EM-AC-03 | Strong authentication protects administrative systems | MFA required for GitHub, Vercel, Supabase, Stripe, Resend, OpenAI administrator accounts | Provider MFA screenshots/reports | Quarterly | Security | Account-side evidence required |
| EM-CC-01 | Production changes are authorized and tested | Feature branch → CI → PR → merge → Vercel deployment | GitHub PRs, CI runs, deployment logs | Per change | Engineering | Implemented |
| EM-CC-02 | Security-impacting database changes are controlled | Versioned Supabase migrations and post-change advisors | Migration history, advisor results | Per change | Engineering | Implemented |
| EM-SDLC-01 | Code receives automated validation before release | Project checks, TypeScript, production build in GitHub Actions | CI run history | Per change | Engineering | Implemented |
| EM-LOG-01 | Security-relevant application activity is logged | Tenant-scoped `audit_events`; request IDs; Vercel runtime logs | Audit exports, runtime logs | Continuous | Engineering | Implemented |
| EM-DATA-01 | Customer data is isolated | Organization IDs on tenant tables + RLS helpers in private schema | RLS policies, tests/advisors | Continuous | Engineering | Implemented |
| EM-DATA-02 | Uploaded invoices are non-public | Private Supabase Storage bucket with tenant paths | Storage configuration | Continuous | Engineering | Implemented |
| EM-DATA-03 | Data can be exported for portability | Admin JSON workspace export with audit event and no-store headers | Export event + generated file | On request | Support/Security | Implemented |
| EM-DATA-04 | Data retention/deletion is governed | Documented retention schedule and privacy-request workflow | Request records, deletion evidence | Monthly review | Privacy/Security | In progress |
| EM-SEC-01 | Secrets are protected | Secrets remain in hosting/provider environments and are not returned by application APIs | Environment inventory, code review | Quarterly | Security | Implemented/operational |
| EM-SEC-02 | Browser attack surface is reduced | HTTPS/HSTS, frame denial, MIME protection, restrictive referrer/permissions policies, CSP | Response headers | Continuous | Engineering | Implemented |
| EM-VULN-01 | Vulnerabilities are identified and remediated | Dependency review, GitHub security tooling, Supabase advisors, provider alerts | Scan/advisor results, remediation PRs | Monthly + per release | Security/Engineering | Program established |
| EM-IR-01 | Security incidents are detected and managed | Incident-response procedure, runtime logs, provider alerts, audit trail | Incident tickets/timeline/postmortem | On incident + annual exercise | Security | Program established |
| EM-BC-01 | Service recovery is planned | Managed-cloud recovery model, database backup verification, restore test procedure | Backup status, restore-test record | Quarterly | Engineering | Evidence required |
| EM-VR-01 | Critical vendors are inventoried and assessed | Subprocessor/vendor register and annual risk review | Vendor register, SOC/security docs | Annual | Security/Privacy | Program established |
| EM-RISK-01 | Security risks are formally identified and tracked | Risk register with owner, treatment, due date, residual risk | Risk register review | Quarterly | Security | Program established |
| EM-PRIV-01 | Privacy requests are tracked | Authenticated privacy-request workflow plus workspace export | Request records, audit events | On request | Privacy/Support | Implemented after migration 016 |
| EM-AI-01 | AI processing is bounded | AI performs structured invoice extraction; application code performs financial calculations | Architecture/code review | Per material change | Engineering | Implemented |
| EM-BILL-01 | Payment-card exposure is minimized | Stripe-hosted checkout/portal; no raw card data stored by ExpenseMargin | Architecture, Stripe settings | Continuous | Engineering/Finance | Implemented design |

## Auditor evidence package

For a future Type I examination, collect point-in-time design evidence for every scoped control. For Type II, preserve evidence throughout the selected operating period, including access reviews, incident exercises, vulnerability reviews, vendor reviews, restore tests, PR/CI history, and policy acknowledgements.
