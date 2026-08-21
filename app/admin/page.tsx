import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requirePlatformAdmin } from "@/lib/admin/auth";
import { getAdminOverview } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

function systemBadge(ok: boolean) {
  return <span className={`badge ${ok ? "good" : "bad"}`}>{ok ? "Healthy" : "Needs attention"}</span>;
}

export default async function AdminPage() {
  const platformAdmin = await requirePlatformAdmin();
  const data = await getAdminOverview();

  return (
    <AdminShell active="Overview" adminEmail={platformAdmin.email}>
      <div className="page">
        <div className="page-head"><div><h1>Admin overview</h1><p>Platform-wide customer, billing, processing, and delivery health.</p></div><span className="badge good">{platformAdmin.role.replace("_", " ")}</span></div>

        <div className="metrics-grid">
          <section className="metric"><div className="metric-label">Customers</div><div className="metric-value">{data.organizationCount}</div><div className="metric-note">Organizations created</div></section>
          <section className="metric"><div className="metric-label">Active subscriptions</div><div className="metric-value">{data.activeSubscriptions}</div><div className="metric-note">Active or trialing</div></section>
          <section className="metric"><div className="metric-label">Estimated MRR</div><div className="metric-value">${data.mrr.toLocaleString()}</div><div className="metric-note">Based on current plan prices</div></section>
          <section className="metric"><div className="metric-label">Invoices this month</div><div className="metric-value">{data.invoicesThisMonth}</div><div className="metric-note">Across all customers</div></section>
        </div>

        <div className="split">
          <section className="panel">
            <div className="panel-head"><div><h2>Operations</h2><span className="panel-subtitle">Items that may need intervention</span></div><Link href="/admin/operations" className="text-link">View details →</Link></div>
            <div style={{ padding: 20, display: "grid", gap: 14 }}>
              <div className="panel-head" style={{ padding: 0 }}><span>Failed invoice jobs</span><strong>{data.failedInvoices}</strong></div>
              <div className="panel-head" style={{ padding: 0 }}><span>Queued / processing</span><strong>{data.processingInvoices}</strong></div>
              <div className="panel-head" style={{ padding: 0 }}><span>Failed notifications</span><strong>{data.failedNotifications}</strong></div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><div><h2>System health</h2><span className="panel-subtitle">Internal infrastructure readiness</span></div></div>
            <div style={{ padding: 20, display: "grid", gap: 14 }}>
              <div className="panel-head" style={{ padding: 0 }}><span>OpenAI processing</span>{systemBadge(data.system.openai)}</div>
              <div className="panel-head" style={{ padding: 0 }}><span>Email delivery</span>{systemBadge(data.system.resend)}</div>
              <div className="panel-head" style={{ padding: 0 }}><span>Stripe billing</span>{systemBadge(data.system.stripe)}</div>
              <div className="panel-head" style={{ padding: 0 }}><span>Background processing</span>{systemBadge(data.system.cron)}</div>
              <div className="panel-head" style={{ padding: 0 }}><span>Database</span>{systemBadge(data.system.supabase)}</div>
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-head"><div><h2>Recent customers</h2><span className="panel-subtitle">Newest organizations</span></div><Link href="/admin/customers" className="text-link">All customers →</Link></div>
          {data.recentOrganizations.length ? <div className="table-wrap"><table><thead><tr><th>Business</th><th>Industry</th><th>Notification email</th><th>Created</th></tr></thead><tbody>{data.recentOrganizations.map((org: any) => <tr key={org.id}><td><strong>{org.name}</strong></td><td>{org.industry || "—"}</td><td>{org.notification_email || "—"}</td><td>{new Date(org.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty">No customer organizations yet.</div>}
        </section>
      </div>
    </AdminShell>
  );
}
