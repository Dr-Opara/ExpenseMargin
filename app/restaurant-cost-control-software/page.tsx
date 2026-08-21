import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Restaurant Cost Control Software",
  description: "Track food, supply, delivery, and vendor cost changes from recurring invoices. ExpenseMargin helps restaurants identify rising supplier costs before they squeeze margins.",
  alternates: { canonical: "/restaurant-cost-control-software" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Restaurant cost control</span><h1>See when food and supply costs start eating into restaurant margins.</h1><p>ExpenseMargin helps restaurants compare recurring vendor invoices for ingredients, packaging, cleaning supplies, delivery fees, and other operating costs so price changes are easier to catch early.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/supplier-cost-monitoring">See supplier cost monitoring →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Built for recurring purchasing</span><h2>Track vendor changes without another restaurant spreadsheet.</h2><p>Use invoice history to see where costs are moving and which changes deserve attention before menu margins erode.</p></div><div className="steps"><div className="step"><span>01</span><h3>Food and beverage</h3><p>Compare ingredient and wholesale purchasing costs across recurring deliveries.</p></div><div className="step"><span>02</span><h3>Packaging and supplies</h3><p>Watch takeout containers, paper goods, cleaning products, and consumables for price movement.</p></div><div className="step"><span>03</span><h3>Fees and delivery</h3><p>Surface fuel surcharges, delivery fees, and other vendor charges that can quietly increase total cost.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Start free</span><h2>Know which restaurant costs changed this month.</h2></div><Link className="btn primary" href="/signup">Create your account</Link></section>
  </div></main>;
}
