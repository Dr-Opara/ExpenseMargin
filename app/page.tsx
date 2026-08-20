import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="container">
        <nav className="landing-nav">
          <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
          <div className="nav-actions"><Link className="btn" href="/dashboard">View demo</Link><Link className="btn primary" href="/invoices">Analyze invoices</Link></div>
        </nav>
        <section className="hero">
          <div>
            <span className="eyebrow">AI-powered supplier cost intelligence</span>
            <h1>Track expenses.<br/>Protect margins.</h1>
            <p>ExpenseMargin catches supplier price increases, new fees, and shrinking pack sizes before they quietly eat your profit.</p>
            <div className="hero-actions"><Link className="btn primary" href="/invoices">Upload invoices</Link><Link className="btn" href="/dashboard">See sample dashboard</Link></div>
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
      </div>
    </>
  );
}
