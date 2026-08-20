import type { Metadata } from "next";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ExpenseMargin",
  description: "Simple pricing for supplier cost intelligence and invoice monitoring.",
};

export default function PricingPage() {
  return (
    <div className="container">
      <nav className="landing-nav">
        <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
        <div className="nav-actions"><Link className="btn" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div>
      </nav>
      <section className="page" style={{paddingLeft:0,paddingRight:0}}>
        <div className="page-head"><div><span className="eyebrow">Simple pricing</span><h1>Protect more margin as you grow.</h1><p>Start free. Upgrade when your invoice volume grows.</p></div></div>
        <div className="pricing-grid">
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            return <section className={`metric pricing-card ${planId === "business" ? "selected" : ""}`} key={planId}>
              <div className="metric-label">{plan.name}</div>
              <div className="plan-price">${plan.monthlyPrice}<small>/month</small></div>
              <p>{plan.description}</p>
              <strong>{plan.invoiceLimit} invoices/month</strong>
              <div style={{marginTop:18}}><Link className="btn primary" href="/signup">{planId === "free" ? "Start free" : `Choose ${plan.name}`}</Link></div>
            </section>;
          })}
        </div>
        <section className="panel"><div style={{padding:20,lineHeight:1.7}}>
          <strong>Every plan includes:</strong> secure invoice storage, supplier and product history, normalized unit-cost comparisons, price-change alerts, shrinkflation detection, and estimated monthly/annual margin impact. Paid checkout activates after Stripe is configured for production.
        </div></section>
      </section>
    </div>
  );
}
