import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Dental Supplier Cost Tracking",
  description: "Track dental supply costs, vendor price increases, shipping fees, and recurring invoice changes. ExpenseMargin helps dental practices protect margins and purchasing budgets.",
  alternates: { canonical: "/dental-supplier-cost-tracking" },
};

export default function Page() {
  return <main className="marketing-shell"><div className="container">
    <nav className="landing-nav"><Brand /><div className="landing-links"><Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link></div><div className="nav-actions"><Link className="nav-signin" href="/login">Sign in</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",maxWidth:860}}><div className="hero-copy" style={{maxWidth:860}}><span className="overline">Dental supplier costs</span><h1>Track dental supply price changes before they pressure practice margins.</h1><p>ExpenseMargin helps dental practices compare recurring invoices for gloves, disposables, sterilization products, office supplies, lab-related purchases, and delivery charges so vendor increases are easier to spot.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="text-link" href="/invoice-price-comparison">Compare invoice prices →</Link></div></div></section>
    <section className="home-section"><div className="section-heading"><span className="overline">Practice purchasing visibility</span><h2>See where recurring dental supply costs are changing.</h2><p>Build a purchase history from supplier invoices and use it to catch changes that may otherwise disappear into monthly overhead.</p></div><div className="steps"><div className="step"><span>01</span><h3>Clinical supplies</h3><p>Monitor recurring consumables and frequently purchased treatment supplies.</p></div><div className="step"><span>02</span><h3>Office and facility costs</h3><p>Track cleaning, paper, front-office, and other repeat vendor purchases.</p></div><div className="step"><span>03</span><h3>Shipping and fees</h3><p>Identify new delivery charges, service fees, and vendor surcharges that increase total spend.</p></div></div></section>
    <section className="simple-cta"><div><span className="overline">Start free</span><h2>Turn dental invoices into cost visibility.</h2></div><Link className="btn primary" href="/signup">Create your account</Link></section>
  </div></main>;
}
