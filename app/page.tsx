import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="container">
        <nav className="landing-nav">
          <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
          <div className="nav-actions">
            <Link className="btn" href="/pricing">Pricing</Link>
            <Link className="btn" href="/login">Sign in</Link>
            <Link className="btn primary" href="/signup">Start free</Link>
          </div>
        </nav>
        <section className="hero">
          <div>
            <span className="eyebrow">AI-powered supplier cost intelligence</span>
            <h1>Track expenses.<br/>Protect margins.</h1>
            <p>ExpenseMargin catches supplier price increases, new fees, and shrinking pack sizes before they quietly eat your profit.</p>
            <div className="hero-actions"><Link className="btn primary" href="/signup">Start free</Link><Link className="btn" href="/pricing">See pricing</Link></div>
          </div>
          <div className="hero-card">
            <div className="alert-card">
              <div className="alert-top"><div><div className="alert-title">Nitrile Gloves — Large</div><div style={{ color: "#6b7280", marginTop: 4 }}>ABC Supply</div></div><div className="alert-change">+16.7%</div></div>
              <div className="kpi-line"><div className="kpi-mini"><small>Previous unit cost</small><strong>$72.00</strong></div><div className="kpi-mini"><small>Current unit cost</small><strong>$84.00</strong></div></div>
              <div className="kpi-line"><div className="kpi-mini"><small>Monthly impact</small><strong>+$240</strong></div><div className="kpi-mini"><small>Annual impact</small><strong>+$2,880</strong></div></div>
            </div>
          </div>
        </section>
        <section className="feature-strip">
          <div className="feature"><h3>Detect changes</h3><p>Compare repeated invoice line items and flag meaningful unit-cost increases automatically.</p></div>
          <div className="feature"><h3>Measure the impact</h3><p>Turn a price change into monthly and annual margin impact so owners know what matters.</p></div>
          <div className="feature"><h3>Act early</h3><p>See supplier and product trends before a small increase becomes a large annual expense.</p></div>
        </section>
        <section className="panel" style={{marginTop:24}}><div style={{padding:24,lineHeight:1.7}}>
          <h2>Built for businesses without a procurement department.</h2>
          <p>Upload supplier invoices, build a cost history, review uncertain product matches, and see the financial impact of supplier changes in one place.</p>
          <div className="hero-actions"><Link className="btn primary" href="/signup">Create your account</Link><Link className="btn" href="/security">How we protect your data</Link></div>
        </div></section>
        <footer style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap",padding:"28px 0",color:"#6b7280"}}>
          <span>© 2026 ExpenseMargin. Track expenses. Protect margins.</span>
          <span style={{display:"flex",gap:16,flexWrap:"wrap"}}><Link href="/pricing">Pricing</Link><Link href="/security">Security</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span>
        </footer>
      </div>
    </>
  );
}
