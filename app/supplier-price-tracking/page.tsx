import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Supplier Price Tracking Software",
  description:
    "Track supplier price increases, fees, surcharges, and recurring cost changes automatically from invoices. ExpenseMargin helps small businesses protect margins.",
  alternates: { canonical: "/supplier-price-tracking" },
};

export default function SupplierPriceTrackingPage() {
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
            <span className="overline">Supplier price tracking</span>
            <h1>Know when your suppliers raise prices.</h1>
            <p>ExpenseMargin compares recurring supplier invoices so you can catch unit-cost increases, new fees, delivery surcharges, pack-size changes, and other cost movement before it quietly reduces your margin.</p>
            <div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/pricing">View pricing →</Link></div>
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading">
            <span className="overline">Why businesses use it</span>
            <h2>Supplier price changes are easy to miss when they are buried in invoices.</h2>
            <p>Instead of manually comparing PDFs or spreadsheets, ExpenseMargin builds a purchasing history and highlights meaningful cost changes.</p>
          </div>
          <div className="steps">
            <div className="step"><span>01</span><h3>Compare recurring invoices</h3><p>Track the same products, services, fees, and suppliers over time.</p></div>
            <div className="step"><span>02</span><h3>Detect price increases</h3><p>Identify unit-cost movement, surcharges, shrinkflation, and unexpected line-item changes.</p></div>
            <div className="step"><span>03</span><h3>See margin impact</h3><p>Estimate monthly and annual impact so you know which supplier changes deserve attention first.</p></div>
          </div>
        </section>

        <section className="simple-cta">
          <div><span className="overline">Related</span><h2>Need deeper invoice analysis?</h2><p style={{color:"#667085"}}>See how ExpenseMargin turns invoice data into cost intelligence.</p></div>
          <Link className="btn" href="/invoice-cost-analysis">Invoice cost analysis</Link>
        </section>
      </div>
    </main>
  );
}
