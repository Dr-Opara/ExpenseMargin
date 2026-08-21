import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Invoice Price Comparison Software",
  description: "Compare recurring invoice prices automatically to spot cost changes, fees, and supplier increases. ExpenseMargin helps small businesses avoid manual line-by-line comparisons.",
  alternates: { canonical: "/invoice-price-comparison" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Invoice price comparison</span><h1>Compare invoice prices without doing it manually.</h1><p>ExpenseMargin compares recurring supplier invoices so small businesses can quickly see where prices, fees, and pack sizes changed from one billing period to the next.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/invoice-cost-analysis">Explore invoice cost analysis →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Automatic comparison</span><h2>Spend less time checking PDFs and more time fixing cost problems.</h2><p>Build a consistent history of supplier purchases and surface meaningful differences without maintaining a manual comparison workbook.</p></div><div className="steps"><div className="step"><span>01</span><h3>Upload invoices</h3><p>Add recurring supplier invoices in common document and image formats.</p></div><div className="step"><span>02</span><h3>Compare line items</h3><p>Review changes in unit costs, quantities, pack sizes, fees, and supplier charges over time.</p></div><div className="step"><span>03</span><h3>Understand impact</h3><p>See which changes could create the largest monthly and annual pressure on your margins.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Related</span><h2>Need ongoing supplier monitoring?</h2></div><Link className="btn" href="/supplier-cost-monitoring">Supplier cost monitoring</Link></section>
  </div></main>;
}
