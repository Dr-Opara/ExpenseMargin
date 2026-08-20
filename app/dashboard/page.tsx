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
        <div className="page-head"><div><h1>Cost overview</h1><p>Supplier cost movement and estimated margin impact.</p></div>{data.reviewCount > 0 && <a href="/review" className="badge warn">{data.reviewCount} match{data.reviewCount === 1 ? "" : "es"} need review</a>}</div>
        <div className="grid-4">
          <MetricCard label="Potential annual cost increase" value={money(data.annualImpact)} note={`Across ${data.alertCount} active cost alerts`} />
          <MetricCard label="Price increases detected" value={String(data.alertCount)} note="Based on normalized unit cost" />
          <MetricCard label="Suppliers monitored" value={String(data.supplierCount)} note={`${data.invoiceCount} completed invoices`} />
          <MetricCard label="Invoices needing review" value={String(data.reviewCount)} note={data.reviewCount ? "Confirm uncertain product matches" : "No matching decisions pending"} tone={data.reviewCount ? undefined : "good"} />
        </div>
        <section className="panel"><div className="panel-head"><h2>Biggest cost changes</h2><a href="/alerts" className="btn">View all</a></div><PriceChangeTable rows={data.alerts} /></section>
      </div>
    </AppShell>
  );
}
