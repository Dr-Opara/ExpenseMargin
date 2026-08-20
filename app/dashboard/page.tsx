import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { PriceChangeTable } from "@/components/PriceChangeTable";
import { getDashboardData } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/onboarding");

  return (
    <AppShell active="Dashboard">
      <div className="page">
        <div className="page-head">
          <div><h1>Cost overview</h1><p>What changed, what it could cost, and what needs attention.</p></div>
          <a href="/invoices" className="btn">View invoices</a>
        </div>

        <div className="grid-3">
          <MetricCard label="Potential annual impact" value={money(data.annualImpact)} note={`Across ${data.alertCount} active cost changes`} />
          <MetricCard label="Active cost changes" value={String(data.alertCount)} note="Based on normalized unit cost" />
          <MetricCard label="Suppliers monitored" value={String(data.supplierCount)} note={`${data.invoiceCount} completed invoices`} />
        </div>

        {data.reviewCount > 0 && (
          <section className="attention-bar">
            <div><strong>{data.reviewCount} product match{data.reviewCount === 1 ? "" : "es"} need review</strong><span>Confirm uncertain matches before they affect cost-change reporting.</span></div>
            <a href="/review" className="btn">Review now</a>
          </section>
        )}

        <section className="panel">
          <div className="panel-head"><div><h2>Biggest cost changes</h2><span className="panel-subtitle">Prioritized by estimated financial impact</span></div><a href="/alerts" className="text-link">View all →</a></div>
          <PriceChangeTable rows={data.alerts} />
        </section>
      </div>
    </AppShell>
  );
}
