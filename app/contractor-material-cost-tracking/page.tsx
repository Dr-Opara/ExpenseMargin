import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Contractor Material Cost Tracking",
  description: "Track contractor material prices, supplier increases, delivery fees, and recurring purchasing changes from invoices. ExpenseMargin helps contractors protect project margins.",
  alternates: { canonical: "/contractor-material-cost-tracking" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Contractor material costs</span><h1>Track material cost increases before they erode project margins.</h1><p>ExpenseMargin helps contractors compare supplier invoices for materials, fixtures, equipment, rentals, delivery, and recurring job inputs so purchasing changes are easier to catch before estimates and margins fall behind.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/supplier-price-tracking">Track supplier prices →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Project cost visibility</span><h2>See where supplier and material costs are moving over time.</h2><p>Use invoice history to identify recurring changes that can affect bids, change orders, and project profitability.</p></div><div className="steps"><div className="step"><span>01</span><h3>Materials and fixtures</h3><p>Compare recurring purchases across lumber, electrical, plumbing, HVAC, roofing, finishes, and other job inputs.</p></div><div className="step"><span>02</span><h3>Delivery and vendor fees</h3><p>Surface freight, fuel, handling, rental, and supplier surcharges that increase true project cost.</p></div><div className="step"><span>03</span><h3>Protect estimates</h3><p>Use recent cost movement to make better-informed bids, purchasing decisions, and margin reviews.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Start free</span><h2>Turn contractor invoices into cost intelligence.</h2></div><Link className="btn primary" href="/signup">Create your account</Link></section>
  </div></main>;
}
