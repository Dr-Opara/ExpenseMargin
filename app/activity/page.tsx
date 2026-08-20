import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getActivityData } from "@/lib/data/activity";

export const dynamic = "force-dynamic";

function eventLabel(value: string) {
  return value.split(".").map((part) => part.replaceAll("_", " ")).join(" · ");
}

export default async function ActivityPage() {
  const data = await getActivityData();
  if (!data) redirect("/onboarding");

  return (
    <AppShell active="Activity">
      <div className="page">
        <div className="page-head"><div><h1>Activity</h1><p>A tenant-visible record of important actions and automated processing.</p></div><span className="badge good">Latest 100</span></div>
        <section className="panel" style={{ marginTop: 0 }}>
          {data.rows.length ? <div className="table-wrap"><table><thead><tr><th>Event</th><th>Actor</th><th>Entity</th><th>When</th></tr></thead><tbody>{data.rows.map((row) => {
            const entityHref = row.entityType === "invoice" && row.entityId ? `/invoices/${row.entityId}` : null;
            return <tr key={row.id}><td><strong>{eventLabel(row.eventType)}</strong></td><td><span className={`badge ${row.actorType === "system" ? "warn" : "good"}`}>{row.actorType}</span></td><td>{entityHref ? <Link href={entityHref}>{row.entityType} →</Link> : row.entityType || "—"}</td><td>{new Date(row.createdAt).toLocaleString()}</td></tr>;
          })}</tbody></table></div> : <div className="empty"><strong>No activity recorded yet.</strong><br/>New uploads, processing, reviews, settings changes, and billing events will appear here.</div>}
        </section>
      </div>
    </AppShell>
  );
}
