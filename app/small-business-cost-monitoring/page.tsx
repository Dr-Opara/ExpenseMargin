import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Small Business Cost Monitoring Software",
  description:
    "Monitor recurring supplier costs, identify price increases and hidden fees, and protect margins with ExpenseMargin cost intelligence for small businesses.",
  alternates: { canonical: "/small-business-cost-monitoring" },
};

export default function SmallBusinessCostMonitoringPage() {
  return (
    <main className="marketing-shell">
      <div className="container">
        <nav className="landing-nav">
          <Brand />
          <div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div>
          <div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div>
        </nav>

        <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:840}}>
          <div className="hero-copy" style={{maxWidth:840}}>
            <span className="overline">Small business cost monitoring</span>
            <h1>Watch recurring costs before they squeeze your margin.</h1>
            <p>ExpenseMargin helps small businesses monitor supplier costs without a procurement team. Upload recurring invoices, compare what you are paying over time, and surface the changes that deserve attention.</p>
            <div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/pricing">See plans →</Link></div>
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading">
            <span className="overline">Designed for everyday operators</span>
            <h2>Useful cost visibility for businesses that buy from suppliers every month.</h2>
            <p>Restaurants, clinics, contractors, retailers, auto shops, pharmacies, salons, property managers, cleaning companies, and other supplier-dependent businesses can use ExpenseMargin to understand cost movement.</p>
          </div>
          <div className="steps">
            <div className="step"><span>Visibility</span><h3>See recurring spend</h3><p>Build a consistent history of supplier purchases and recurring charges.</p></div>
            <div className="step"><span>Detection</span><h3>Catch costly changes</h3><p>Surface price increases, new fees, surcharges, and quantity changes that may otherwise go unnoticed.</p></div>
            <div className="step"><span>Action</span><h3>Protect profitability</h3><p>Use estimated financial impact to prioritize supplier conversations, pricing decisions, and purchasing changes.</p></div>
          </div>
        </section>

        <section className="simple-cta">
          <div><span className="overline">Explore</span><h2>See exactly how supplier costs move over time.</h2></div>
          <Link className="btn" href="/supplier-price-tracking">Supplier price tracking</Link>
        </section>
      </div>
    </main>
  );
}
