import Link from "next/link";
import { Brand } from "@/components/Brand";

export function AdminShell({ active, children, adminEmail }: { active: string; children: React.ReactNode; adminEmail: string }) {
  const links = [
    ["Overview", "/admin"],
    ["Customers", "/admin/customers"],
    ["Subscriptions", "/admin/subscriptions"],
    ["Operations", "/admin/operations"],
  ] as const;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div style={{ margin: "18px 0 8px", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#98a2b3" }}>Internal admin</div>
        <nav className="side-nav">
          {links.map(([label, href]) => <Link key={href} href={href} className={active === label ? "active" : ""}>{label}</Link>)}
        </nav>
        <div style={{ marginTop: "auto", borderTop: "1px solid #eaecf0", paddingTop: 16 }}>
          <div className="metric-note" style={{ wordBreak: "break-word" }}>{adminEmail}</div>
          <Link href="/dashboard" className="text-link" style={{ display: "inline-block", marginTop: 10 }}>Customer portal →</Link>
          <form action="/auth/signout" method="post" style={{ marginTop: 10 }}><button className="text-link" type="submit" style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}>Sign out</button></form>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar"><strong>ExpenseMargin Administration</strong><span className="badge warn">Internal only</span></header>
        {children}
      </div>
    </div>
  );
}
