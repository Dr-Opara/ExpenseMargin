import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Shrinkflation Detection for Supplier Invoices",
  description: "Detect shrinkflation, pack-size changes, and hidden unit-cost increases across supplier invoices. ExpenseMargin helps small businesses catch cost changes that are easy to miss.",
  alternates: { canonical: "/shrinkflation-detection" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Shrinkflation detection</span><h1>Catch smaller packs and higher unit costs hiding in plain sight.</h1><p>When a case, box, or pack gets smaller while the invoice total stays similar, your effective unit cost can rise without an obvious price jump. ExpenseMargin helps surface those changes across recurring purchases.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/invoice-price-comparison">Compare invoice prices →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Hidden cost changes</span><h2>Track what you pay and what you actually receive.</h2><p>ExpenseMargin helps normalize recurring purchases so pack-size changes, quantity changes, and effective unit-cost increases are easier to spot.</p></div><div className="steps"><div className="step"><span>01</span><h3>Normalize units</h3><p>Compare effective cost per unit instead of relying only on total invoice price.</p></div><div className="step"><span>02</span><h3>Spot pack-size changes</h3><p>Identify when suppliers reduce quantity, count, or packaging while pricing stays flat or rises.</p></div><div className="step"><span>03</span><h3>Protect margins</h3><p>Use the resulting cost movement to inform vendor conversations, pricing, and purchasing decisions.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Related</span><h2>Track every supplier cost change.</h2></div><Link className="btn" href="/supplier-price-tracking">Supplier price tracking</Link></section>
  </div></main>;
}
