import { AdminShell } from "@/components/AdminShell";
import { requirePlatformAdmin } from "@/lib/admin/auth";
import { getAdminSubscriptions } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const platformAdmin = await requirePlatformAdmin();
  const subscriptions = await getAdminSubscriptions();
  const active = subscriptions.filter((s: any) => ["active", "trialing"].includes(s.status));
  const mrr = active.reduce((sum: number, s: any) => sum + s.monthlyPrice, 0);

  return (
    <AdminShell active="Subscriptions" adminEmail={platformAdmin.email}>
      <div className="page">
        <div className="page-head"><div><h1>Subscriptions</h1><p>Monitor paid plans, billing status, renewals, and cancellations.</p></div><span className="badge good">${mrr.toLocaleString()} MRR</span></div>
        <section className="panel" style={{ marginTop: 0 }}>
          {subscriptions.length ? <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Plan</th><th>Price</th><th>Status</th><th>Renews / ends</th><th>Canceling?</th><th>Stripe customer</th></tr></thead><tbody>{subscriptions.map((sub: any) => <tr key={sub.organization_id}><td><strong>{sub.organizationName}</strong></td><td>{sub.plan}</td><td>${sub.monthlyPrice}/mo</td><td><span className={`badge ${["active","trialing"].includes(sub.status) ? "good" : sub.status === "past_due" ? "bad" : "warn"}`}>{sub.status}</span></td><td>{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}</td><td>{sub.cancel_at_period_end ? "Yes" : "No"}</td><td><span className="metric-note">{sub.stripe_customer_id || "—"}</span></td></tr>)}</tbody></table></div> : <div className="empty">No subscription records yet.</div>}
        </section>
      </div>
    </AdminShell>
  );
}
