import { AdminShell } from "@/components/AdminShell";
import { requirePlatformAdmin } from "@/lib/admin/auth";
import { getAdminCustomers } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const platformAdmin = await requirePlatformAdmin();
  const customers = await getAdminCustomers();

  return (
    <AdminShell active="Customers" adminEmail={platformAdmin.email}>
      <div className="page">
        <div className="page-head"><div><h1>Customers</h1><p>Review customer organizations, account owners, plan status, and usage footprint.</p></div><span className="badge good">{customers.length} total</span></div>
        <section className="panel" style={{ marginTop: 0 }}>
          {customers.length ? <div className="table-wrap"><table><thead><tr><th>Business</th><th>Owner</th><th>Industry</th><th>Plan</th><th>Status</th><th>Invoices</th><th>Created</th></tr></thead><tbody>{customers.map((customer: any) => <tr key={customer.id}><td><strong>{customer.name}</strong><div className="metric-note">{customer.notification_email || "No alert email"}</div></td><td>{customer.ownerEmails.length ? customer.ownerEmails.join(", ") : "—"}</td><td>{customer.industry || "—"}</td><td>{customer.subscription?.plan || "No plan"}</td><td><span className={`badge ${["active","trialing"].includes(customer.subscription?.status) ? "good" : customer.subscription?.status === "past_due" ? "bad" : "warn"}`}>{customer.subscription?.status || "inactive"}</span></td><td>{customer.invoiceCount}</td><td>{new Date(customer.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="empty">No customers yet.</div>}
        </section>
      </div>
    </AdminShell>
  );
}
