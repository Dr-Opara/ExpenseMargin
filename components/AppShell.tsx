import Link from "next/link";
import { Brand } from "@/components/Brand";
import { getOrganizationContext } from "@/lib/data/context";
import { PLANS } from "@/lib/billing/plans";
import { APP_VERSION } from "@/lib/version";

const navGroups = [
  {
    label: "Cost monitoring",
    links: [
      ["Invoices", "/invoices"],
      ["Suppliers", "/suppliers"],
      ["Products", "/products"],
      ["Alerts", "/alerts"],
    ],
  },
  {
    label: "Operations",
    links: [
      ["Locations", "/locations"],
      ["Review", "/review"],
      ["Activity", "/activity"],
    ],
  },
];

export async function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  const context = await getOrganizationContext();
  const planName = context ? PLANS[context.plan].name : null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand href="/dashboard" className="app-brand" />

        <nav className="side-nav">
          <Link href="/dashboard" className={`side-link ${active === "Dashboard" ? "active" : ""}`}>Dashboard</Link>
          {navGroups.map((group) => (
            <div className="side-group" key={group.label}>
              <div className="side-group-label">{group.label}</div>
              {group.links.map(([label, href]) => (
                <Link key={href} href={href} className={`side-link ${active === label ? "active" : ""}`}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-footer">
          <div className="side-secondary-links">
            <Link href="/billing" className={active === "Billing" ? "active" : ""}>Billing</Link>
            <Link href="/settings" className={active === "Settings" ? "active" : ""}>Settings</Link>
          </div>
          {planName && <div className="side-plan">{planName} plan</div>}
          <div className="side-version">v{APP_VERSION}</div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="signout-link">Sign out</button>
          </form>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-org">{context?.organizationName ?? "ExpenseMargin"}</div>
          <div className="topbar-actions">
            {planName && <span className="plan-label">{planName}</span>}
            <Link href="/invoices" className="btn primary">Upload invoices</Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
