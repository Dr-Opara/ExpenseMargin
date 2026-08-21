import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Supplier Cost Monitoring Software",
  description: "Monitor supplier costs over time, detect unexpected increases, and prioritize changes by financial impact. Built for small businesses managing recurring vendor spend.",
  alternates: { canonical: "/supplier-cost-monitoring" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Supplier cost monitoring</span><h1>Monitor supplier costs before they become margin problems.</h1><p>ExpenseMargin turns recurring invoice data into a clear cost history so you can spot supplier increases, new fees, and purchasing changes without maintaining another spreadsheet.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/supplier-price-tracking">See supplier price tracking →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Cost visibility</span><h2>Know what changed across vendors, products, and recurring expenses.</h2><p>Use invoice history to identify cost movement and focus attention on the changes with the largest operational impact.</p></div><div className="steps"><div className="step"><span>01</span><h3>Build a cost history</h3><p>Organize recurring supplier purchases automatically from uploaded invoices.</p></div><div className="step"><span>02</span><h3>Flag unusual changes</h3><p>Surface price jumps, new surcharges, pack-size changes, and repeated fee increases.</p></div><div className="step"><span>03</span><h3>Prioritize by impact</h3><p>Estimate monthly and annual exposure so the biggest margin risks stand out first.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Related</span><h2>Compare invoices automatically.</h2></div><Link className="btn" href="/invoice-cost-analysis">Invoice cost analysis</Link></section>
  </div></main>;
}
