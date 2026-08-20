import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = { title: "Privacy — ExpenseMargin", description: "ExpenseMargin privacy practices for account and invoice data." };

export default function PrivacyPage() {
  return <div className="container">
    <nav className="landing-nav"><Brand /><div className="nav-actions"><Link className="btn" href="/security">Security</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="page" style={{paddingLeft:0,paddingRight:0}}>
      <div className="page-head"><div><span className="eyebrow">Privacy</span><h1>Privacy Policy</h1><p>Effective August 20, 2026</p></div></div>
      <section className="panel"><div style={{padding:24,lineHeight:1.8}}>
        <h2>Information we process</h2><p>ExpenseMargin processes account information, organization details, supplier invoices, extracted invoice data, product and supplier histories, billing metadata, and application activity needed to provide the service.</p>
        <h2>How information is used</h2><p>We use this information to authenticate users, isolate organization workspaces, analyze invoices, calculate cost changes, deliver alerts, operate billing, improve reliability, prevent abuse, and support customers.</p>
        <h2>Service providers</h2><p>ExpenseMargin relies on infrastructure and service providers such as Supabase, Vercel, OpenAI, Stripe, and Resend when those integrations are enabled. Data is shared with providers only as needed to deliver the relevant service.</p>
        <h2>AI processing</h2><p>Invoice documents may be sent to the configured AI provider for structured extraction. ExpenseMargin uses its own deterministic application logic for financial comparisons and impact calculations.</p>
        <h2>Access and portability</h2><p>Authorized workspace administrators can export organization data from ExpenseMargin. Export activity is recorded in the workspace audit trail.</p>
        <h2>Retention and deletion</h2><p>Business records are retained while needed to operate the account, maintain purchasing history, satisfy contractual obligations, and meet applicable legal requirements. Formal retention and deletion schedules are maintained as part of the service security and compliance program.</p>
        <h2>Security</h2><p>ExpenseMargin uses tenant-scoped database policies, private file storage, HTTPS, server-side credential handling, and operational logging. No online system can guarantee absolute security.</p>
        <h2>Changes</h2><p>We may update this policy as the product, providers, or legal requirements change. Material revisions will be reflected by updating the effective date.</p>
      </div></section>
    </section>
  </div>;
}
