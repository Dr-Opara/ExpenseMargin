import Link from "next/link";
import { getOrganizationContext } from "@/lib/data/context";
import { APP_VERSION } from "@/lib/version";

const links = [
  ["Dashboard", "/dashboard"],
  ["Invoices", "/invoices"],
  ["Suppliers", "/suppliers"],
  ["Products", "/products"],
  ["Alerts", "/alerts"],
  ["Review", "/review"],
  ["Billing", "/billing"],
];

export async function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  const context = await getOrganizationContext();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">EM</span>
          <span>ExpenseMargin</span>
        </Link>
        <nav className="side-nav">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={`side-link ${active === label ? "active" : ""}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="side-footer">
          <div>Track expenses. Protect margins.</div>
          {context && <div style={{marginTop:8}}>{context.plan.toUpperCase()} plan</div>}
          <div style={{ marginTop: 8, opacity: .7 }}>v{APP_VERSION}</div>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div><strong>{context?.organizationName ?? "ExpenseMargin"}</strong></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {context && <span className="badge good">{context.plan}</span>}
            <Link href="/invoices" className="btn primary">Upload invoices</Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
