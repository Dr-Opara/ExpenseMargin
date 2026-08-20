# ExpenseMargin Compliance Program

ExpenseMargin maintains a security and privacy control program designed to support customer assurance and future independent attestations. This repository documents implemented technical controls and the operating procedures required to generate audit evidence.

## Current posture

- **SOC 2:** readiness program in progress. ExpenseMargin is **not currently SOC 2 certified or attested**. The initial target is Security, with Availability and Confidentiality added where customer needs justify them.
- **GDPR:** privacy-rights, portability, retention, processor/subprocessor, and incident-response controls are maintained for applicability when serving EEA/UK data subjects. Legal applicability and contractual terms are assessed per customer and geography.
- **CCPA/CPRA:** access, correction, deletion, and disclosure workflows are maintained for applicable California requests. Applicability depends on statutory thresholds and processing activities.
- **PCI DSS:** ExpenseMargin is designed to minimize card-data scope by redirecting payment activity to Stripe-hosted payment experiences. ExpenseMargin must not store card numbers, CVCs, or raw cardholder data.
- **HIPAA:** ExpenseMargin is **not currently offered as a HIPAA-enabled service**. Customers must not upload PHI or patient-identifiable medical information unless and until ExpenseMargin establishes the required contracts, provider eligibility, and HIPAA control program.
- **ISO/IEC 27001:** not certified. The security management practices in this repository are structured so they can later be cross-mapped to an ISMS if enterprise demand warrants certification.

## Control principles

1. Least privilege and tenant isolation.
2. Private-by-default storage and server-side secrets.
3. Auditable security-relevant activity.
4. Deterministic financial logic; AI is limited to document understanding.
5. Change control through GitHub branches, CI, review, and production deployment records.
6. Documented incident, vulnerability, backup, vendor, privacy, and retention processes.
7. No compliance or certification claim is published without objective evidence and, where required, an independent auditor or assessor.

See `docs/compliance/` for control mappings, policies, evidence requirements, and operational procedures.
