import Link from "next/link";
import { Brand } from "@/components/Brand";

const industries = [
  "Grocery Markets",
  "Restaurants",
  "Medical Services",
  "Dental Practices",
  "Pharmacies",
  "Dry Cleaners & Laundry",
  "Retail",
  "Hospitality",
  "Auto Shops",
  "Auto Dealerships",
  "Contractors",
  "Home Builders",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Cleaning Services",
  "Salons & Spas",
  "Manufacturing",
  "Warehousing",
  "Convenience Stores",
  "Veterinary Clinics",
  "Home Health",
  "Property Management",
  "Landscaping",
  "Roofing",
  "Catering",
  "Bakeries",
  "Car Washes",
  "Janitorial Services",
  "Distribution Companies",
];

const costRows = [
  { item: "Nitrile gloves — Large", supplier: "ABC Supply", before: "$72.00", now: "$84.00", change: "+16.7%", impact: "+$2,880/yr" },
  { item: "Paper towels — 12 ct", supplier: "Metro Janitorial", before: "$38.00", now: "$41.00", change: "+7.9%", impact: "+$468/yr" },
  { item: "Delivery surcharge", supplier: "Regional Foods", before: "$110.00", now: "$135.00", change: "+22.7%", impact: "+$900/yr" },
];

export default function Home() {
  return (
    <main className="marketing-shell">
      <div className="container">
        <nav className="landing-nav">
          <Brand />
          <div className="landing-links">
            <a href="#how-it-works">How it works</a>
            <Link href="/pricing">Pricing</Link>
            <Link href="/security">Security</Link>
          </div>
          <div className="nav-actions">
            <Link className="nav-signin" href="/login">Sign in</Link>
            <Link className="btn primary" href="/signup">Start free</Link>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-copy">
            <span className="overline">Supplier cost intelligence</span>
            <h1>Know when supplier costs change.</h1>
            <p>ExpenseMargin compares recurring supplier invoices, flags meaningful cost increases, and shows what those changes could mean for your margin.</p>
            <div className="hero-actions">
              <Link className="btn primary" href="/signup">Start free</Link>
              <Link className="text-link" href="/pricing">View pricing →</Link>
            </div>
            <div className="hero-note">Start with 5 invoices per month free.</div>
          </div>

          <div className="product-frame" aria-label="ExpenseMargin cost change preview">
            <div className="product-frame-head">
              <div>
                <span className="product-frame-kicker">Cost overview</span>
                <strong>Supplier changes this month</strong>
              </div>
              <span className="status-dot">Updated</span>
            </div>
            <div className="preview-kpis">
              <div><span>Potential annual impact</span><strong>$4,248</strong></div>
              <div><span>Cost changes</span><strong>3</strong></div>
            </div>
            <div className="preview-table-wrap">
              <table className="preview-table">
                <thead><tr><th>Item</th><th>Before</th><th>Now</th><th>Change</th><th>Impact</th></tr></thead>
                <tbody>
                  {costRows.map((row) => (
                    <tr key={row.item}>
                      <td><strong>{row.item}</strong><span>{row.supplier}</span></td>
                      <td>{row.before}</td>
                      <td>{row.now}</td>
                      <td><span className="change-up">{row.change}</span></td>
                      <td>{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="industry-band" aria-label="Industries ExpenseMargin is built for">
          <div className="industry-copy">
            <span>Built for businesses that buy from suppliers and manage recurring costs every month.</span>
          </div>
          <div className="industry-list" style={{ gap: 10 }}>
            {industries.map((industry) => (
              <span
                key={industry}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 11px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 999,
                  background: "#fff",
                  color: "#475467",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {industry}
              </span>
            ))}
          </div>
        </section>

        <section className="home-section" id="how-it-works">
          <div className="section-heading">
            <span className="overline">How it works</span>
            <h2>See what changed. Understand the impact. Act early.</h2>
            <p>No procurement department required.</p>
          </div>
          <div className="steps">
            <div className="step"><span>01</span><h3>Upload invoices</h3><p>Add supplier PDFs, JPGs, or PNGs. ExpenseMargin builds your purchasing history automatically.</p></div>
            <div className="step"><span>02</span><h3>See what changed</h3><p>Track normalized unit costs, pack-size changes, fees, surcharges, and supplier price movement.</p></div>
            <div className="step"><span>03</span><h3>Protect margin</h3><p>Prioritize the changes that matter by estimated monthly and annual financial impact.</p></div>
          </div>
        </section>

        <section className="home-section" aria-labelledby="seo-solutions-heading" style={{paddingTop:0}}>
          <div className="section-heading">
            <span className="overline">Cost intelligence tools</span>
            <h2 id="seo-solutions-heading">Find the supplier cost changes that affect your business.</h2>
            <p>Explore how ExpenseMargin helps small businesses compare invoices, monitor recurring costs, and catch supplier price increases.</p>
          </div>
          <div className="steps" style={{marginTop:36}}>
            <div className="step"><span>Track</span><h3><Link href="/supplier-price-tracking">Supplier price tracking</Link></h3><p>Detect supplier price increases, new fees, surcharges, and quantity changes from recurring invoices.</p></div>
            <div className="step"><span>Analyze</span><h3><Link href="/invoice-cost-analysis">Invoice cost analysis</Link></h3><p>Turn invoice history into structured cost comparisons without maintaining another spreadsheet.</p></div>
            <div className="step"><span>Monitor</span><h3><Link href="/small-business-cost-monitoring">Small-business cost monitoring</Link></h3><p>Watch recurring supplier expenses and understand which cost changes are putting pressure on margin.</p></div>
          </div>
        </section>

        <section className="simple-cta">
          <div><span className="overline">Start with your next invoice</span><h2>Turn supplier paperwork into cost visibility.</h2></div>
          <Link className="btn primary" href="/signup">Create your account</Link>
        </section>

        <footer
          className="marketing-footer"
          style={{ minHeight: 118, fontSize: 15, gap: 34, padding: "18px 0" }}
        >
          <span style={{ fontWeight: 600 }}>© 2026 ExpenseMargin</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Track expenses. Protect margins.</span>
          <span className="footer-links" style={{ gap: 24, alignItems: "center", fontSize: 15, fontWeight: 600 }}>
            <Link href="/pricing">Pricing</Link>
            <Link href="/security">Security</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="https://x.com/expensemargin" target="_blank" rel="noreferrer">X @expensemargin</a>
            <a
              href="https://www.linkedin.com/company/expensemargin"
              target="_blank"
              rel="noreferrer"
              style={{ border: "1px solid #d0d5dd", borderRadius: 7, padding: "8px 11px" }}
            >
              LinkedIn ExpenseMargin
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}
