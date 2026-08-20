import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { UploadDropzone } from "@/components/UploadDropzone";
import { getInvoicesData } from "@/lib/data/invoices";

export const dynamic = "force-dynamic";

function money(value: number | null, currency: string) {
  if (value == null) return "—";
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value); }
  catch { return `$${value.toFixed(2)}`; }
}

export default async function InvoicesPage() {
  const data = await getInvoicesData();
  if (!data) redirect("/onboarding");
  return (
    <AppShell active="Invoices">
      <div className="page">
        <div className="page-head"><div><h1>Invoices</h1><p>Upload supplier invoices to build a cost history and track every analysis from upload to alert.</p></div><Link className="btn" href="/billing">{data.context.plan} plan</Link></div>
        <div className="split">
          <section className="panel" style={{ marginTop: 0 }}><div className="panel-head"><h2>Upload invoices</h2></div><div style={{ padding: 20 }}><UploadDropzone /></div></section>
          <section className="panel" style={{ marginTop: 0 }}><div className="panel-head"><h2>How analysis works</h2></div><div style={{ padding: 20, lineHeight: 1.7, color: "#4b5563" }}><ol><li>Extract supplier, invoice date, SKU, quantity, unit price, fees, and totals.</li><li>Match repeated products across invoices.</li><li>Normalize pack size and unit cost for comparable history.</li><li>Flag meaningful increases and estimate monthly and annual impact.</li><li>Route uncertain product matches to human review before creating alerts.</li></ol></div></section>
        </div>
        <section className="panel"><div className="panel-head"><h2>Recent invoices</h2><span className="metric-note">Latest 50</span></div>{data.rows.length ? <div className="table-wrap"><table><thead><tr><th>Supplier</th><th>Invoice</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>{data.rows.map((row)=><tr key={row.id}><td><strong>{row.supplier}</strong><div className="metric-note">{row.filename}</div></td><td>{row.invoiceNumber || "—"}</td><td>{row.invoiceDate ? new Date(`${row.invoiceDate}T00:00:00`).toLocaleDateString() : "—"}</td><td>{money(row.total,row.currency)}</td><td><span className={`badge ${row.status === "complete" ? "good" : row.status === "failed" ? "bad" : "warn"}`}>{row.status.replaceAll("_"," ")}</span></td><td><Link className="btn" href={`/invoices/${row.id}`}>Open</Link></td></tr>)}</tbody></table></div> : <div className="empty"><strong>No invoices uploaded yet.</strong><br/>Your uploaded invoices will appear here immediately.</div>}</section>
      </div>
    </AppShell>
  );
}
