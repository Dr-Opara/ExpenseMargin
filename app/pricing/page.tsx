import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PLANS, PUBLIC_PLAN_IDS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ExpenseMargin",
  description: "Supplier cost intelligence for small and multi-location businesses. Plans start at $19 per month.",
  alternates: { canonical: "/pricing" },
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
            <h2>Start small. Unlock deeper cost intelligence as you grow.</h2>
            <p>Every plan includes an ExpenseMargin dashboard. Higher plans add deeper automation, analysis, collaboration, and multi-location intelligence.</p>
          </div>

          <div className="pricing-grid" style={{marginTop:40}}>
            {PUBLIC_PLAN_IDS.map((planId) => {
              const plan = PLANS[planId];
              return (
                <section className={`metric pricing-card ${planId === "pro" ? "selected" : ""}`} key={planId}>
                  <div className="metric-label">{plan.name}{planId === "pro" ? " · Most popular" : ""}</div>
                  <div className="plan-price">${plan.monthlyPrice}<small>/month</small></div>
                  <p>{plan.description}</p>
                  <div style={{fontSize:13,color:"#667085",marginBottom:12}}>Best for: {plan.audience}</div>
                  <strong>{plan.invoiceLimit.toLocaleString()} invoices/month · {plan.locationLabel}</strong>
                  <ul style={{listStyle:"none",padding:0,margin:"20px 0 0",display:"grid",gap:10,fontSize:14,lineHeight:1.45}}>
                    {plan.features.map((feature) => (
                      <li key={feature} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                        <span aria-hidden="true" style={{fontWeight:800}}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{marginTop:"auto",paddingTop:24}}><Link className="btn primary" href="/signup">Choose {plan.name}</Link></div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="home-section" style={{paddingTop:8,paddingBottom:28}}>
          <div className="section-heading">
            <span className="overline">Designed to grow with you</span>
            <h2>The dashboard is standard. The intelligence gets deeper by tier.</h2>
            <p>Starter gives a small business the essentials. Growth adds deeper analysis and automation. Multi-Location adds cross-site visibility and management controls.</p>
          </div>
          <section className="steps" style={{marginTop:28}}>
            <div className="step"><span>Starter</span><h3>See your invoice structure</h3><p>Track suppliers, line items, price history, completed invoices, and basic cost changes from one dashboard.</p></div>
            <div className="step"><span>Growth</span><h3>Understand the financial impact</h3><p>Add shrinkflation signals, supplier comparisons, trend analytics, custom thresholds, weekly summaries, and team access.</p></div>
            <div className="step"><span>Multi-Location</span><h3>Compare every site</h3><p>See which location pays more for the same items, consolidate supplier analytics, and manage organization-wide reporting.</p></div>
          </section>
        </section>

        <div style={{padding:"20px 0 70px",color:"#667085",fontSize:13}}>
          Need more than 200 invoices per month or a larger location footprint? <a href="mailto:sales@expensemargin.com" style={{fontWeight:650}}>Contact sales</a> for higher-volume pricing.
        </div>
      </div>
    </main>
  );
}
