import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = { title: "Terms — ExpenseMargin", description: "Terms of use for ExpenseMargin." };

export default function TermsPage() {
  return <div className="container">
    <nav className="landing-nav"><Brand /><div className="nav-actions"><Link className="btn" href="/privacy">Privacy</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="page" style={{paddingLeft:0,paddingRight:0}}>
      <div className="page-head"><div><span className="eyebrow">Terms</span><h1>Terms of Use</h1><p>Effective August 20, 2026</p></div></div>
      <section className="panel"><div style={{padding:24,lineHeight:1.8}}>
        <h2>Service</h2><p>ExpenseMargin provides software that analyzes supplier invoices, organizes purchasing history, identifies cost changes, and estimates potential financial impact.</p>
        <h2>Your account and data</h2><p>You are responsible for maintaining accurate account information, protecting credentials, and ensuring you have the right to upload and process documents submitted to the service.</p>
        <h2>Decision-support only</h2><p>ExpenseMargin findings are informational decision-support outputs. They are not accounting, legal, tax, procurement, or financial advice. Supplier terms, prices, quantities, and recommendations should be independently verified before action is taken.</p>
        <h2>Billing</h2><p>Paid plans are billed according to the pricing shown at checkout. Plan limits and included invoice volumes may change prospectively with notice. Stripe handles payment processing when paid billing is enabled.</p>
        <h2>Acceptable use</h2><p>You may not use ExpenseMargin to violate law, upload content you are not authorized to process, probe or disrupt the service, bypass usage controls, or access another customer's data.</p>
        <h2>Availability</h2><p>We work to keep the service reliable, but availability is not guaranteed and features may change as the product evolves. Maintenance, provider outages, and security events may temporarily affect access.</p>
        <h2>Limitation</h2><p>To the maximum extent permitted by applicable law, ExpenseMargin is provided without guarantees that every invoice field, product match, savings opportunity, or supplier change will be identified. Customers remain responsible for business decisions made using the service.</p>
        <h2>Changes</h2><p>These terms may be updated as the product and commercial offering mature. Continued use after an updated effective date indicates acceptance of the revised terms where permitted by law.</p>
      </div></section>
    </section>
  </div>;
}
