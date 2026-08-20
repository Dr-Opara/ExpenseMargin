import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getAlertsData } from "@/lib/data/alerts";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default async function AlertsPage() {
  const data = await getAlertsData();
  if (!data) redirect("/onboarding");
  return <AppShell active="Alerts"><div className="page"><div className="page-head"><div><h1>Alerts</h1><p>Review the cost changes most likely to affect your margin.</p></div></div>{data.rows.length ? <div style={{display:"grid",gap:12}}>{data.rows.map((a)=><section className="metric" key={a.id}><div style={{display:"flex",justifyContent:"space-between",gap:18}}><div><div className="metric-label">{a.supplier}</div><div style={{fontWeight:800,fontSize:18,marginTop:5}}>{a.item}</div><div className="metric-note">{money(a.previous)} → {money(a.current)} · estimated +{money(a.annualImpact)}/year</div></div><span className="badge bad">+{a.change.toFixed(1)}%</span></div></section>)}</div> : <section className="panel" style={{marginTop:0}}><div className="empty"><strong>No cost alerts yet.</strong><br/>ExpenseMargin will surface meaningful unit-cost increases here.</div></section>}</div></AppShell>;
}
