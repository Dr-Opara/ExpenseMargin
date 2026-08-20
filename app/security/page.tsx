import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security — ExpenseMargin",
  description: "How ExpenseMargin protects customer accounts, invoices, and tenant data.",
};

const controls = [
  ["Tenant isolation", "Organization data is protected with Supabase Row Level Security so authenticated users only access authorized workspaces."],
  ["Private invoice storage", "Uploaded invoices are stored in a private Supabase Storage bucket and are not published as public assets."],
  ["Server-side secrets", "Service-role, OpenAI, Stripe, Resend, and cron credentials are used only in server-side runtime paths."],
  ["Auditable activity", "Sensitive product, billing, settings, and invoice workflow events are recorded in tenant-scoped audit history."],
  ["Secure transport", "Production traffic is served over HTTPS with HSTS, frame protection, content-type protection, and a restrictive referrer policy."],
  ["Controlled AI processing", "AI is used for invoice understanding; financial comparisons and margin-impact calculations remain deterministic application logic."],
];

export default function SecurityPage() {
  return <div className="container">
    <nav className="landing-nav"><Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link><div className="nav-actions"><Link className="btn" href="/pricing">Pricing</Link><Link className="btn primary" href="/signup">Start free</Link></div></nav>
    <section className="page" style={{paddingLeft:0,paddingRight:0}}>
      <div className="page-head"><div><span className="eyebrow">Security</span><h1>Built to protect business purchasing data.</h1><p>ExpenseMargin uses layered application, database, storage, and operational controls.</p></div></div>
      <div className="feature-strip">{controls.slice(0,3).map(([title,text]) => <div className="feature" key={title}><h3>{title}</h3><p>{text}</p></div>)}</div>
      <div className="feature-strip" style={{marginTop:16}}>{controls.slice(3).map(([title,text]) => <div className="feature" key={title}><h3>{title}</h3><p>{text}</p></div>)}</div>
      <section className="panel"><div style={{padding:20,lineHeight:1.7}}><strong>Security reporting:</strong> During launch, security issues should be reported through the official ExpenseMargin contact channel published with the production domain. Do not include passwords, API keys, or sensitive invoice data in an initial report.</div></section>
    </section>
  </div>;
}
