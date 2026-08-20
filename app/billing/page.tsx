import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getBillingData } from "@/lib/data/billing";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

function planStatusLabel(status: string) {
  if (status === "active" || status === "trialing") return "Active";
  if (status === "past_due") return "Payment issue";
  if (status === "canceled") return "Canceled";
  return "Free";
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await getBillingData();
  if (!data) redirect("/onboarding");
  const params = await searchParams;
  const currentPlan = data.context.plan as PlanId;
  const usagePercent = Math.min(100, Math.round((data.used / Math.max(1, data.limit)) * 100));

  return (
    <AppShell active="Billing">
      <div className="page">
        <div className="page-head"><div><h1>Billing & usage</h1><p>Choose the invoice capacity that fits your business.</p></div><span className={`badge ${data.context.subscriptionStatus === "past_due" ? "bad" : "good"}`}>{planStatusLabel(data.context.subscriptionStatus)}</span></div>
        {params.checkout === "success" && <div className="form-success" style={{marginBottom:16}}>Checkout completed. Your plan will update as soon as Stripe confirms the subscription.</div>}
        {params.checkout === "cancelled" && <div className="form-error" style={{marginBottom:16}}>Checkout was canceled. Your current plan has not changed.</div>}

        <section className="panel" style={{marginTop:0}}>
          <div className="panel-head"><h2>This month</h2><strong>{data.used} / {data.limit} invoices</strong></div>
          <div style={{padding:20}}>
            <div className="usage-bar"><span style={{width:`${usagePercent}%`}} /></div>
            <div className="metric-note">Your {PLANS[currentPlan].name} plan resets invoice usage at the start of each calendar month.</div>
            {data.cancelAtPeriodEnd && data.currentPeriodEnd && <div className="form-error" style={{marginTop:14}}>Your paid plan is scheduled to end on {new Date(data.currentPeriodEnd).toLocaleDateString()}.</div>}
          </div>
        </section>

        <div className="pricing-grid">
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const current = planId === currentPlan;
            return (
              <section className={`metric pricing-card ${current ? "selected" : ""}`} key={planId}>
                <div className="metric-label">{plan.name}</div>
                <div className="plan-price">${plan.monthlyPrice}<small>/month</small></div>
                <p>{plan.description}</p>
                <strong>{plan.invoiceLimit} invoices/month</strong>
                <div style={{marginTop:18}}>
                  {current ? <span className="badge good">Current plan</span> : planId === "free" ? <span className="metric-note">Free plan activates when no paid subscription is active.</span> : data.canManageBilling ? (
                    <form action="/api/billing/checkout" method="post">
                      <input type="hidden" name="plan" value={planId} />
                      <button className="btn primary" type="submit">Choose {plan.name}</button>
                    </form>
                  ) : <span className="metric-note">Ask an organization admin to change plans.</span>}
                </div>
              </section>
            );
          })}
        </div>

        {data.context.stripeCustomerId && data.canManageBilling && (
          <section className="panel"><div className="panel-head"><div><h2>Manage subscription</h2><div className="metric-note">Update payment details, cancel, or view invoices in Stripe's secure customer portal.</div></div><form action="/api/billing/portal" method="post"><button className="btn" type="submit">Open billing portal</button></form></div></section>
        )}
      </div>
    </AppShell>
  );
}
