import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Invoice Cost Analysis Software",
  description:
    "Analyze recurring invoices, compare supplier costs, and spot price increases, fees, and margin impact automatically with ExpenseMargin.",
  alternates: { canonical: "/invoice-cost-analysis" },
};

export default function InvoiceCostAnalysisPage() {
  return (
    <main className="marketing-shell">
      <div className="container">
        <nav className="landing-nav">
          <Brand />
          <div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div>
          <div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div>
        </nav>

        <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:820}}>
          <div className="hero-copy" style={{maxWidth:820}}>
            <span className="overline">Invoice cost analysis</span>
            <h1>Turn supplier invoices into cost intelligence.</h1>
            <p>ExpenseMargin analyzes recurring invoices and gives small businesses a clear view of changing supplier costs. See what changed, how much it changed, and what the difference could mean for your monthly and annual spend.</p>
            <div className="hero-actions"><Link className="btn primary" href="/signup">Analyze your first invoices</Link><Link className="text-link" href="/supplier-price-tracking">Supplier price tracking →</Link></div>
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading">
            <span className="overline">From paperwork to insight</span>
            <h2>Compare invoice costs without maintaining another spreadsheet.</h2>
            <p>Recurring invoices contain a history of your business costs. ExpenseMargin organizes that history so price movement becomes visible.</p>
          </div>
          <div className="steps">
            <div className="step"><span>Upload</span><h3>Capture invoice data</h3><p>Add supplier PDFs, JPGs, or PNGs and build a structured history of purchases.</p></div>
            <div className="step"><span>Compare</span><h3>Normalize recurring costs</h3><p>Compare products, pack sizes, service lines, delivery fees, and other recurring charges across invoices.</p></div>
            <div className="step"><span>Prioritize</span><h3>Understand financial impact</h3><p>Focus on the changes that materially affect spend instead of reviewing every line manually.</p></div>
          </div>
        </section>

        <section className="simple-cta">
          <div><span className="overline">Built for small business</span><h2>Monitor recurring costs before they become margin problems.</h2></div>
          <Link className="btn" href="/small-business-cost-monitoring">Small-business cost monitoring</Link>
        </section>
      </div>
    </main>
  );
}
