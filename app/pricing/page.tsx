import type { Metadata } from "next";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ExpenseMargin",
  description: "B2B pricing for supplier cost intelligence and invoice monitoring.",
};

const included = [
  "Secure invoice storage",
  "Supplier and product history",
  "Normalized unit-cost tracking",
  "Price-change alerts",
  "Shrinkflation detection",
  "Monthly and annual impact estimates",
];

export default function PricingPage() {
  return (
    <main className="marketing-shell">
      <div className="container">
        <nav className="landing-nav">
          <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
          <div className="landing-links"><Link href="/">Product</Link><Link href="/security">Security</Link></div>
          <div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div>
        </nav>

        <section className="public-page">
          <div className="pricing-hero">
            <span className="overline">Pricing</span>
            <h1>Choose the invoice volume that fits your business.</h1>
            <p>Start free, then move up when your supplier activity grows. No per-user pricing.</p>
          </div>

          <div className="pricing-grid">
            {(Object.keys(PLANS) as PlanId[]).map((planId) => {
              const plan = PLANS[planId];
              return (
                <section className={`metric pricing-card ${planId === "business" ? "selected" : ""}`} key={planId}>
                  <div className="metric-label">{plan.name}{planId === "business" ? " · Most popular" : ""}</div>
                  <div className="plan-price">${plan.monthlyPrice}<small>/month</small></div>
                  <p>{plan.description}</p>
                  <strong>{plan.invoiceLimit.toLocaleString()} invoices/month</strong>
                  <div style={{marginTop:"auto",paddingTop:20}}><Link className="btn primary" href="/signup">{planId === "free" ? "Start free" : `Choose ${plan.name}`}</Link></div>
                </section>
              );
            })}
          </div>

          <section className="pricing-includes">
            <div><span className="overline">Included in every plan</span><h2>The same core intelligence. More capacity as you grow.</h2></div>
            <div className="included-list">{included.map((item) => <span key={item}>{item}</span>)}</div>
          </section>

          <div className="pricing-note">Processing more than 2,000 invoices per month? Higher-volume pricing will be available for larger teams.</div>
        </section>
      </div>
    </main>
  );
}
