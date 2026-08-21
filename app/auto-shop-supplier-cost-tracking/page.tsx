import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Auto Shop Supplier Cost Tracking",
  description: "Track auto parts, shop supplies, fluid, tire, freight, and vendor cost changes from recurring invoices. ExpenseMargin helps repair shops protect margins.",
  alternates: { canonical: "/auto-shop-supplier-cost-tracking" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Auto shop supplier costs</span><h1>Track parts and shop-supply cost increases before they reduce job margins.</h1><p>ExpenseMargin helps repair shops compare recurring vendor invoices for parts, fluids, tires, shop supplies, freight, and other repeat purchases so rising costs are easier to catch and price around.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/supplier-cost-monitoring">Monitor supplier costs →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Repair shop cost visibility</span><h2>Know which vendor costs changed before your next estimate goes out.</h2><p>Use recurring invoice history to see where purchasing costs are moving across parts vendors and shop suppliers.</p></div><div className="steps"><div className="step"><span>01</span><h3>Parts and materials</h3><p>Compare common parts, fluids, tires, filters, and frequently purchased materials.</p></div><div className="step"><span>02</span><h3>Freight and surcharges</h3><p>Spot delivery, fuel, environmental, and vendor fees that can increase the real cost of a job.</p></div><div className="step"><span>03</span><h3>Margin awareness</h3><p>Estimate the impact of recurring increases so labor rates, markups, and sourcing decisions stay informed.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Start free</span><h2>See which auto shop costs are rising.</h2></div><Link className="btn primary" href="/signup">Create your account</Link></section>
  </div></main>;
}
