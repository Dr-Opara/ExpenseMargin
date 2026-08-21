import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PLANS } from "@/lib/billing/plans";
import { getInsightsData } from "@/lib/data/insights";

export const dynamic = "force-dynamic";

const money = (v:number) => new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", maximumFractionDigits:2 }).format(v);

function Locked({ title, required }: { title:string; required:string }) {
  return <section className="panel"><div className="panel-head"><div><h2>{title}</h2><span className="panel-subtitle">Available on {required}</span></div><a className="btn" href="/billing">Upgrade</a></div><p style={{color:"#667085",margin:0}}>Upgrade your plan to unlock this analysis inside your dashboard.</p></section>;
}

export default async function InsightsPage() {
  const data = await getInsightsData();
  if (!data) redirect("/onboarding");
  const plan = PLANS[data.context.plan];

  return (
    <AppShell active="Insights">
      <div className="page">
        <div className="page-head">
          <div><h1>Cost intelligence</h1><p>Plan-aware analysis from your uploaded supplier invoices.</p></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><span className="plan-label">{plan.name}</span>{data.entitlements.export && <a className="btn" href="/api/export">Export CSV</a>}</div>
        </div>

        {data.entitlements.costTrends ? (
          <section className="panel">
            <div className="panel-head"><div><h2>Cost trends</h2><span className="panel-subtitle">Last 12 months of captured line-item spend</span></div></div>
            {data.costTrends.length ? <div className="table-wrap"><table><thead><tr><th>Month</th><th>Captured spend</th><th>Line items</th></tr></thead><tbody>{data.costTrends.map((r) => <tr key={r.month}><td>{r.month}</td><td>{money(r.spend)}</td><td>{r.lineItems}</td></tr>)}</tbody></table></div> : <p>No trend data yet. Upload invoices to begin building history.</p>}
          </section>
        ) : <Locked title="Cost trends" required="Growth" />}

        {data.entitlements.supplierComparison ? (
          <section className="panel">
            <div className="panel-head"><div><h2>Supplier comparison</h2><span className="panel-subtitle">Items purchased from more than one supplier</span></div></div>
            {data.supplierComparisons.length ? <div className="table-wrap"><table><thead><tr><th>Item</th><th>Lowest-cost supplier</th><th>Avg unit cost</th><th>Highest-cost supplier</th><th>Avg unit cost</th><th>Spread</th></tr></thead><tbody>{data.supplierComparisons.map((r) => <tr key={`${r.item}-${r.lowestSupplier}`}><td>{r.item}</td><td>{r.lowestSupplier}</td><td>{money(r.lowestCost)}</td><td>{r.highestSupplier}</td><td>{money(r.highestCost)}</td><td>{r.spreadPct.toFixed(1)}%</td></tr>)}</tbody></table></div> : <p>Supplier comparisons appear once the same item is purchased from multiple suppliers.</p>}
          </section>
        ) : <Locked title="Supplier comparison" required="Growth" />}

        {data.entitlements.shrinkflation ? (
          <section className="panel">
            <div className="panel-head"><div><h2>Shrinkflation signals</h2><span className="panel-subtitle">Possible quantity reductions without a proportional price decrease</span></div></div>
            {data.shrinkflationSignals.length ? <div className="table-wrap"><table><thead><tr><th>Item</th><th>Previous qty</th><th>Current qty</th><th>Previous cost</th><th>Current cost</th><th>Size reduction</th></tr></thead><tbody>{data.shrinkflationSignals.map((r,i) => <tr key={`${r.item}-${i}`}><td>{r.item}</td><td>{r.previousQty}</td><td>{r.currentQty}</td><td>{money(r.previousCost)}</td><td>{money(r.currentCost)}</td><td>{r.changePct.toFixed(1)}%</td></tr>)}</tbody></table></div> : <p>No shrinkflation signals detected in the current invoice history.</p>}
          </section>
        ) : <Locked title="Shrinkflation detection" required="Growth" />}

        {data.entitlements.crossLocation ? (
          <section className="panel">
            <div className="panel-head"><div><h2>Cross-location overview</h2><span className="panel-subtitle">Captured purchasing activity by business location</span></div></div>
            {data.locationComparison.length ? <div className="table-wrap"><table><thead><tr><th>Location</th><th>Captured spend</th><th>Invoices</th><th>Line items</th></tr></thead><tbody>{data.locationComparison.map((r) => <tr key={r.locationId}><td>{r.location}</td><td>{money(r.spend)}</td><td>{r.invoices}</td><td>{r.lineItems}</td></tr>)}</tbody></table></div> : <p>Add locations and upload invoices to compare purchasing activity across sites.</p>}
          </section>
        ) : <Locked title="Cross-location intelligence" required="Multi-Location" />}

        {data.entitlements.executiveReporting ? (
          <section className="panel"><div className="panel-head"><div><h2>Executive reporting</h2><span className="panel-subtitle">Management-ready rollup</span></div></div><p style={{margin:0}}>Your Multi-Location plan includes consolidated reporting. This view uses your live invoice, supplier and location data; scheduled delivery is the next automation layer.</p></section>
        ) : <Locked title="Executive reporting" required="Multi-Location" />}
      </div>
    </AppShell>
  );
}
