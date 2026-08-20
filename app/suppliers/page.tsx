import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSuppliersData } from "@/lib/data/suppliers";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default async function SuppliersPage() {
  const data = await getSuppliersData();
  if (!data) redirect("/onboarding");
  return (
    <AppShell active="Suppliers"><div className="page"><div className="page-head"><div><h1>Suppliers</h1><p>Monitor recurring spend and price changes by vendor.</p></div></div><section className="panel" style={{marginTop:0}}>{data.rows.length ? <div className="table-wrap"><table><thead><tr><th>Supplier</th><th>Invoices</th><th>Tracked spend</th><th>Active alerts</th></tr></thead><tbody>{data.rows.map((s)=><tr key={s.id}><td><strong>{s.name}</strong></td><td>{s.invoices}</td><td>{money(s.spend)}</td><td>{s.alerts ? <span className="badge bad">{s.alerts}</span> : <span className="badge good">0</span>}</td></tr>)}</tbody></table></div> : <div className="empty"><strong>No suppliers yet.</strong><br/>Suppliers appear automatically after an invoice is processed.</div>}</section></div></AppShell>
  );
}
