import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PLANS, PUBLIC_PLAN_IDS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ExpenseMargin",
  description: "Affordable supplier cost intelligence for small businesses. Plans start at $19 per month with no per-user pricing.",
};

export default function PricingPage() {
  return (
    <main className="marketing-shell">
      <div className="container">
        <nav className="landing-nav">
          <Brand />
          <div className="landing-links"><Link href="/">Product</Link><Link href="/security">Security</Link></div>
          <div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Get started</Link></div>
        </nav>

        <section className="home-section" style={{paddingBottom:56}}>
          <div className="section-heading">
            <span className="overline">Pricing</span>
            <h2>Choose the invoice volume that fits your business.</h2>
            <p>Simple monthly pricing from $19. No per-user pricing and no permanent free tier.</p>
          </div>

          <div className="pricing-grid" style={{marginTop:40}}>
            {PUBLIC_PLAN_IDS.map((planId) => {
              const plan = PLANS[planId];
              return (
                <section className={`metric pricing-card ${planId === "pro" ? "selected" : ""}`} key={planId}>
                  <div className="metric-label">{plan.name}{planId === "pro" ? " · Most popular" : ""}</div>
                  <div className="plan-price">${plan.monthlyPrice}<small>/month</small></div>
                  <p>{plan.description}</p>
                  <strong>{plan.invoiceLimit.toLocaleString()} invoices/month</strong>
                  <div style={{marginTop:"auto",paddingTop:20}}><Link className="btn primary" href="/signup">Choose {plan.name}</Link></div>
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
          Every plan includes the core intelligence engine. Need to process more than 200 invoices per month? <a href="mailto:sales@expensemargin.com" style={{fontWeight:650}}>Contact sales</a> for higher-volume pricing.
        </div>
      </div>
    </main>
  );
}
