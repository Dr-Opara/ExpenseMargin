import type { Metadata } from "next";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ExpenseMargin",
  description: "B2B pricing for supplier cost intelligence and invoice monitoring.",
};

export default function PricingPage() {
  return (
    <div className="container">
      <nav className="landing-nav">
        <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
        <div className="nav-actions"><Link className="btn" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div>
      </nav>
      <section className="page" style={{paddingLeft:0,paddingRight:0}}>
        <div className="page-head"><div><span className="eyebrow">B2B pricing</span><h1>Small software cost. Serious margin visibility.</h1><p>Start with five invoices free, then choose a monthly plan based on the volume you monitor.</p></div></div>
        <div className="pricing-grid">
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            return <section className={`metric pricing-card ${planId === "business" ? "selected" : ""}`} key={planId}>
              <div className="metric-label">{plan.name}{planId === "business" ? " · Most popular" : ""}</div>
              <div className="plan-price">${plan.monthlyPrice}<small>/month</small></div>
              <p>{plan.description}</p>
              <strong>{plan.invoiceLimit.toLocaleString()} invoices/month</strong>
              <div style={{marginTop:18}}><Link className="btn primary" href="/signup">{planId === "free" ? "Start free" : `Choose ${plan.name}`}</Link></div>
            </section>;
          })}
        </div>
        <section className="panel"><div style={{padding:20,lineHeight:1.7}}>
          <strong>All plans include the core intelligence engine:</strong> secure invoice storage, supplier and product history, normalized unit-cost comparisons, price-change alerts, shrinkflation detection, product-match review, and estimated monthly and annual margin impact. Businesses processing more than 2,000 invoices per month can move to custom volume pricing.
        </div></section>
        <section className="panel"><div style={{padding:20,lineHeight:1.7}}>
          <strong>Why the pricing works:</strong> ExpenseMargin is designed to identify cost leakage that can exceed the subscription price many times over. The product is priced as business decision-support software, not as a low-cost receipt scanner.
        </div></section>
      </section>
    </div>
  );
}
