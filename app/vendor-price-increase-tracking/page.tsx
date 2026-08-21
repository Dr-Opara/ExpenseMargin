import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Vendor Price Increase Tracking",
  description: "Track vendor price increases from recurring invoices and see which changes are affecting your margins most. ExpenseMargin helps small businesses catch cost creep early.",
  alternates: { canonical: "/vendor-price-increase-tracking" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Vendor price increases</span><h1>Catch vendor price increases before they compound.</h1><p>Small changes across dozens of recurring purchases can quietly add up. ExpenseMargin compares invoices over time so you can see when vendors raise prices, add surcharges, or change what you receive for the same spend.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/supplier-cost-monitoring">Monitor supplier costs →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Cost creep detection</span><h2>Turn recurring invoices into an early warning system.</h2><p>ExpenseMargin helps you compare the latest invoice against prior purchases and understand whether a change is material.</p></div><div className="steps"><div className="step"><span>01</span><h3>Detect increases</h3><p>Identify higher unit prices, delivery charges, service fees, and repeated vendor adjustments.</p></div><div className="step"><span>02</span><h3>Measure the difference</h3><p>See the percentage and dollar movement instead of scanning invoices line by line.</p></div><div className="step"><span>03</span><h3>Act with context</h3><p>Use estimated financial impact to decide which vendors or purchases deserve review first.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Related</span><h2>Track supplier prices across recurring purchases.</h2></div><Link className="btn" href="/supplier-price-tracking">Supplier price tracking</Link></section>
  </div></main>;
}
