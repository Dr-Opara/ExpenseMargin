import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ExpenseMargin",
  description: "B2B pricing for supplier cost intelligence and invoice monitoring.",
};

export default function PricingPage() {
  return (
    <main className="marketing-shell">
      <div className="container">
        <nav className="landing-nav">
          <Brand />
          <div className="landing-links"><Link href="/">Product</Link><Link href="/security">Security</Link></div>
          <div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div>
        </nav>

        <section className="home-section" style={{paddingBottom:56}}>
          <div className="section-heading">
            <span className="overline">Pricing</span>
            <h2>Choose the invoice volume that fits your business.</h2>
            <p>Start free, then move up when your supplier activity grows. No per-user pricing.</p>
          </div>

          <div className="pricing-grid" style={{marginTop:40}}>
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
        </section>

        <section className="steps" style={{marginTop:0}}>
          <div className="step"><span>Included</span><h3>Cost history</h3><p>Secure invoice storage plus supplier and product history across recurring purchases.</p></div>
          <div className="step"><span>Included</span><h3>Change detection</h3><p>Normalized unit-cost tracking, price-change alerts, and shrinkflation detection.</p></div>
          <div className="step"><span>Included</span><h3>Financial impact</h3><p>Monthly and annual impact estimates so teams can prioritize the changes that matter.</p></div>
        </section>

        <div style={{padding:"28px 0 70px",color:"#667085",fontSize:13}}>
          Every plan includes the core intelligence engine. Processing more than 2,000 invoices per month? Higher-volume pricing will be available for larger teams.
        </div>
      </div>
    </main>
  );
}
