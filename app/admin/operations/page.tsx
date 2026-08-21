import { AdminShell } from "@/components/AdminShell";
import { requirePlatformAdmin } from "@/lib/admin/auth";
import { getAdminOperations } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  const platformAdmin = await requirePlatformAdmin();
  const data = await getAdminOperations();

  return (
    <AdminShell active="Operations" adminEmail={platformAdmin.email}>
      <div className="page">
        <div className="page-head"><div><h1>Operations</h1><p>Inspect recent invoice-processing jobs and notification delivery across all customers.</p></div><span className="badge warn">Internal diagnostics</span></div>

        <section className="panel" style={{ marginTop: 0 }}>
          <div className="panel-head"><div><h2>Invoice processing</h2><span className="panel-subtitle">Latest 100 jobs</span></div></div>
          {data.invoices.length ? <div className="table-wrap"><table><thead><tr><th>Customer</th><th>File</th><th>Status</th><th>Attempts</th><th>Error</th><th>Created</th></tr></thead><tbody>{data.invoices.map((invoice: any) => <tr key={invoice.id}><td>{invoice.organizationName}</td><td>{invoice.original_filename || "—"}</td><td><span className={`badge ${invoice.status === "processed" ? "good" : invoice.status === "failed" ? "bad" : "warn"}`}>{invoice.status}</span></td><td>{invoice.attempt_count ?? 0}</td><td><span className="metric-note">{invoice.error_message || "—"}</span></td><td>{new Date(invoice.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty">No invoice jobs yet.</div>}
        </section>

        <section className="panel">
          <div className="panel-head"><div><h2>Notification delivery</h2><span className="panel-subtitle">Latest 100 delivery attempts</span></div></div>
          {data.notifications.length ? <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Type</th><th>Recipient</th><th>Status</th><th>Error</th><th>When</th></tr></thead><tbody>{data.notifications.map((delivery: any) => <tr key={delivery.id}><td>{delivery.organizationName}</td><td>{delivery.notification_type.replaceAll("_", " ")}</td><td>{delivery.recipient || "—"}</td><td><span className={`badge ${delivery.status === "sent" ? "good" : delivery.status === "failed" ? "bad" : "warn"}`}>{delivery.status}</span></td><td><span className="metric-note">{delivery.error_message || "—"}</span></td><td>{new Date(delivery.sent_at || delivery.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty">No notification attempts yet.</div>}
        </section>
      </div>
    </AdminShell>
  );
}
