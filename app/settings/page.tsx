import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getSettingsData } from "@/lib/data/settings";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await getSettingsData();
  if (!data) redirect("/onboarding");
  const params = await searchParams;
  const canEdit = ['owner', 'admin'].includes(data.context.role);
  const activePlan = data.context.plan === "free" ? null : PLANS[data.context.plan as PlanId];

  return (
    <AppShell active="Settings">
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Settings</h1>
            <p>Manage your business profile, notifications, billing, and workspace data.</p>
          </div>
          <span className="badge good">{data.context.role}</span>
        </div>

        {params.saved === "1" && <div className="form-success" style={{ marginBottom: 16 }}>Settings saved.</div>}
        {params.error && <div className="form-error" style={{ marginBottom: 16 }}>Settings could not be saved. Check the submitted values and try again.</div>}

        <div className="split">
          <section className="panel" style={{ marginTop: 0 }}>
            <div className="panel-head"><h2>Business profile</h2></div>
            <form action="/api/settings" method="post" className="auth-form" style={{ padding: 20 }}>
              <label>Business name<input name="name" defaultValue={data.organization.name} required minLength={2} maxLength={120} disabled={!canEdit} /></label>
              <label>Industry<input name="industry" defaultValue={data.organization.industry} maxLength={120} disabled={!canEdit} /></label>
              <label>Cost alert email<input name="notification_email" type="email" defaultValue={data.organization.notificationEmail} placeholder="owner@business.com" disabled={!canEdit} /></label>
              <label style={{ display: "flex", gap: 10, alignItems: "center", flexDirection: "row" }}>
                <input name="notify_cost_alerts" type="checkbox" defaultChecked={data.organization.notifyCostAlerts} disabled={!canEdit} style={{ width: "auto" }} />
                <span>Email me when meaningful supplier cost increases are confirmed.</span>
              </label>
              {canEdit ? <button className="btn primary" type="submit">Save settings</button> : <div className="metric-note">Only owners and admins can change organization settings.</div>}
            </form>
          </section>

          <section className="panel" style={{ marginTop: 0 }}>
            <div className="panel-head"><h2>Billing & plan</h2></div>
            <div style={{ padding: 20, display: "grid", gap: 16 }}>
              <div>
                <div className="metric-note">Current plan</div>
                <strong style={{ fontSize: 18 }}>{activePlan ? activePlan.name : "No active plan"}</strong>
              </div>
              {activePlan && (
                <div className="metric-note">
                  {activePlan.invoiceLimit.toLocaleString()} invoices per month · ${activePlan.monthlyPrice}/month
                </div>
              )}
              {!activePlan && <div className="metric-note">Choose a plan to begin processing supplier invoices.</div>}
              <Link className="btn primary" href="/billing">Manage billing</Link>
            </div>
          </section>
        </div>

        {canEdit && (
          <section className="panel">
            <div className="panel-head">
              <div><h2>Workspace data</h2><span className="panel-subtitle">Portability and administrative access</span></div>
              <a className="btn" href="/api/account/export">Export workspace data</a>
            </div>
            <div style={{ padding: 20, color: "#667085", fontSize: 13, lineHeight: 1.6 }}>
              Download a JSON export of your organization settings, supplier and product history, invoices and line items, alerts, reviews, notification history, and audit events. Exports are generated on demand and are not cached.
            </div>
          </section>
        )}

        <section className="panel">
          <div className="panel-head"><h2>Recent notifications</h2><span className="metric-note">Latest 10</span></div>
          {data.deliveries.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Type</th><th>Recipient</th><th>Status</th><th>When</th></tr></thead>
                <tbody>
                  {data.deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td>{delivery.type.replaceAll("_", " ")}</td>
                      <td>{delivery.recipient || "—"}</td>
                      <td><span className={`badge ${delivery.status === "sent" ? "good" : delivery.status === "failed" ? "bad" : "warn"}`}>{delivery.status}</span>{delivery.error && <div className="metric-note">{delivery.error}</div>}</td>
                      <td>{new Date(delivery.sentAt || delivery.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty">No notification history yet.</div>}
        </section>
      </div>
    </AppShell>
  );
}
