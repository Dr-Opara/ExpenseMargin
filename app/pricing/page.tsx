import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PLANS, PUBLIC_PLAN_IDS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — ExpenseMargin",
  description: "Affordable supplier cost intelligence for small businesses. Plans start at $19 per month with no per-user pricing.",
  alternates: { canonical: "/pricing" },
};

const CORE_FEATURES = [
  "AI-powered invoice extraction and line-item analysis",
  "Supplier and product cost history",
  "Automatic unit-cost normalization",
  "Price-increase and cost-change alerts",
  "Shrinkflation and pack-size change detection",
  "Monthly and annual margin-impact estimates",
  "Secure invoice storage and searchable history",
  "Unlimited suppliers tracked",
  "Workspace data export",
  "No per-user pricing",
];

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
            <h2>Enterprise-style supplier cost intelligence, priced for small business.</h2>
            <p>Every paid plan includes the full ExpenseMargin intelligence engine. You choose the invoice volume — not which core features you are allowed to use.</p>
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
                  <ul style={{listStyle:"none",padding:0,margin:"20px 0 0",display:"grid",gap:10,fontSize:14,lineHeight:1.45}}>
                    {CORE_FEATURES.map((feature) => (
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
            <span className="overline">Why businesses switch</span>
            <h2>More visibility without the procurement-software price tag.</h2>
            <p>ExpenseMargin focuses on the work small businesses actually need: understand what changed, why it matters, and where margin is being lost.</p>
          </div>

          <section className="steps" style={{marginTop:28}}>
            <div className="step"><span>Built in</span><h3>AI invoice analysis</h3><p>Upload supplier invoices and automatically turn line items into structured cost intelligence instead of manually comparing PDFs and spreadsheets.</p></div>
            <div className="step"><span>Built in</span><h3>Price-change detection</h3><p>Spot increases, normalized unit-cost changes, pack-size reductions, and recurring supplier cost movement across purchases.</p></div>
            <div className="step"><span>Built in</span><h3>Margin impact</h3><p>Translate supplier changes into estimated monthly and annual financial impact so the biggest risks rise to the top.</p></div>
          </section>
        </section>

        <section className="home-section" style={{paddingTop:20,paddingBottom:32}}>
          <div className="section-heading">
            <span className="overline">Included in every plan</span>
            <h2>No feature maze. No per-seat surprise.</h2>
            <p>Starter customers get the same core cost-intelligence capabilities as higher-volume customers. Upgrade when your invoice volume grows — not because a critical feature is locked away.</p>
          </div>

          <div className="steps" style={{marginTop:28}}>
            <div className="step"><span>01</span><h3>Track every supplier</h3><p>Keep cost history across all of your recurring suppliers without paying extra for each vendor you monitor.</p></div>
            <div className="step"><span>02</span><h3>Know what changed</h3><p>See historical pricing, unit-cost movement, shrinkflation signals, and cost alerts in one place.</p></div>
            <div className="step"><span>03</span><h3>Act before margin slips</h3><p>Use impact estimates and historical context to challenge increases, renegotiate, switch suppliers, or adjust pricing sooner.</p></div>
          </div>
        </section>

        <div style={{padding:"20px 0 70px",color:"#667085",fontSize:13}}>
          Need to process more than 200 invoices per month? <a href="mailto:sales@expensemargin.com" style={{fontWeight:650}}>Contact sales</a> for higher-volume pricing. ExpenseMargin does not charge per user.
        </div>
      </div>
    </main>
  );
}
