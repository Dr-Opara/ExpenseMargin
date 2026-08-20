# Incident Response Plan

## Severity
- **SEV-1:** confirmed or likely unauthorized customer-data access, credential compromise with production impact, destructive outage, or material security event.
- **SEV-2:** contained security weakness or outage with meaningful customer impact but no confirmed material data exposure.
- **SEV-3:** low-impact event, suspicious activity, or control failure requiring investigation.

## Response lifecycle
1. **Detect and triage:** preserve timestamps, request IDs, provider alerts, audit events, and relevant logs.
2. **Contain:** revoke/rotate credentials, disable affected accounts/integrations, isolate vulnerable paths, or roll back deployments as appropriate.
3. **Investigate:** establish scope, affected systems/data/customers, root cause, and timeline.
4. **Eradicate and recover:** patch vulnerabilities, restore service/data, validate controls, and monitor for recurrence.
5. **Notify:** determine contractual, legal, regulatory, insurer, law-enforcement, and customer notification obligations with qualified counsel where appropriate.
6. **Post-incident review:** document root cause, impact, actions, evidence, control improvements, owners, and deadlines.

## Evidence preservation
Retain incident tickets, communications, logs, audit events, screenshots/configuration evidence, timeline, remediation PRs, and postmortem. Do not place customer secrets or unnecessary sensitive data in public GitHub issues.

## Exercises
Perform and document at least one incident-response tabletop exercise annually and after major architectural changes when appropriate.
