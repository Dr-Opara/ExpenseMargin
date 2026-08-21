import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { PriceChangeTable } from "@/components/PriceChangeTable";
import { getDashboardData } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function usage(value: number, limit: number) {
  if (limit >= 999) return `${value} active`;
  return `${value} of ${limit}`;
}

function Capability({ title, description, enabled, href }: { title: string; description: string; enabled: boolean; href?: string }) {
  return (
    <div className="step" style={{opacity: enabled ? 1 : 0.62}}>
      <span>{enabled ? "Included" : "Upgrade"}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {enabled && href ? <Link href={href} className="text-link">Open →</Link> : !enabled ? <Link href="/billing" className="text-link">Compare plans →</Link> : null}
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/onboarding");

  return (
    <AppShell active="Dashboard">
      <div className="page">
        <div className="page-head">
          <div>
            <h1>{data.plan.name} dashboard</h1>
            <p>See how your invoices are structured, what changed, and which intelligence is included in your plan.</p>
          </div>
          <a href="/invoices" className="btn">View invoices</a>
        </div>

        <div className="grid-3">
          <MetricCard label="Invoices this month" value={usage(data.monthlyInvoiceCount, data.invoiceLimit)} note={`${Math.max(0, data.invoiceLimit - data.monthlyInvoiceCount)} remaining in your plan`} />
          <MetricCard label="Business locations" value={usage(data.locationCount, data.locationLimit)} note={data.plan.locationLabel} />
          <MetricCard label="Suppliers monitored" value={String(data.supplierCount)} note={`${data.invoiceCount} completed invoices`} />
        </div>

        <section className="panel">
          <div className="panel-head">
            <div><h2>Invoice structure</h2><span className="panel-subtitle">Standard in every paid plan</span></div>
            <Link href="/invoices" className="text-link">View all invoices →</Link>
          </div>
          <div className="grid-3" style={{marginTop:18}}>
            <MetricCard label="Completed invoices" value={String(data.invoiceCount)} note="Processed and available for analysis" />
            <MetricCard label="Tracked suppliers" value={String(data.supplierCount)} note="Supplier history across uploaded invoices" />
            <MetricCard label="Detected cost changes" value={String(data.alertCount)} note="Based on normalized unit cost" />
          </div>
        </section>

        {data.reviewCount > 0 && (
          <section className="attention-bar">
            <div><strong>{data.reviewCount} product match{data.reviewCount === 1 ? "" : "es"} need review</strong><span>Confirm uncertain matches before they affect cost-change reporting.</span></div>
            <a href="/review" className="btn">Review now</a>
          </section>
        )}

        <section className="panel">
          <div className="panel-head">
            <div><h2>Plan intelligence</h2><span className="panel-subtitle">Capabilities automatically unlock with your subscription tier</span></div>
            <Link href="/billing" className="text-link">Manage plan →</Link>
          </div>
          <div className="steps" style={{marginTop:18}}>
            <Capability title="Basic price-change detection" description="Track supplier and item cost history and surface normalized unit-cost changes." enabled={true} href="/alerts" />
            <Capability title="Financial impact analysis" description="Estimate monthly and annual financial impact so the most important cost changes rise to the top." enabled={data.entitlements.financialImpact} href="/alerts" />
            <Capability title="Shrinkflation detection" description="Identify quantity and pack-size changes that can increase effective unit cost even when sticker price looks stable." enabled={data.entitlements.shrinkflation} href="/products" />
            <Capability title="Supplier comparison insights" description="Compare recurring item costs across suppliers and find purchasing opportunities." enabled={data.entitlements.supplierComparison} href="/suppliers" />
            <Capability title="Cost trend analytics" description="See recurring supplier and item cost movement over time." enabled={data.entitlements.costTrends} href="/products" />
            <Capability title="Weekly cost summary" description="Receive an automated summary of meaningful cost movement and items that need attention." enabled={data.entitlements.weeklySummary} />
            <Capability title="Team access" description={`Collaborate with additional team members. ${data.memberCount} member${data.memberCount === 1 ? "" : "s"} currently connected.`} enabled={data.entitlements.teamAccess} href="/settings" />
            <Capability title="Cross-location intelligence" description="Compare location-level supplier costs and identify sites paying more for the same item." enabled={data.entitlements.crossLocation} href="/locations" />
            <Capability title="Executive reporting" description="Consolidated organization-wide margin and supplier reporting for multi-location operators." enabled={data.entitlements.executiveReporting} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><h2>Biggest cost changes</h2><span className="panel-subtitle">Recent supplier cost movement</span></div><a href="/alerts" className="text-link">View all →</a></div>
          {data.entitlements.financialImpact && (
            <div style={{margin:"16px 0"}}>
              <MetricCard label="Potential annual impact" value={money(data.annualImpact)} note={`Across ${data.alertCount} active cost changes`} />
            </div>
          )}
          <PriceChangeTable rows={data.alerts} />
        </section>
      </div>
    </AppShell>
  );
}
