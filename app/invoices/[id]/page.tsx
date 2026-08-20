import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getInvoiceDetail } from "@/lib/data/invoice-detail";

export const dynamic = "force-dynamic";

function money(value: number | null, currency: string) {
  if (value == null) return "—";
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value); }
  catch { return `$${value.toFixed(2)}`; }
}

function badgeClass(status: string) {
  if (status === "complete") return "good";
  if (status === "failed") return "bad";
  return "warn";
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getInvoiceDetail(id);
  if (!data) redirect("/onboarding");
  if (!data.invoice) notFound();

  const { invoice } = data;
  const impact = data.alerts.reduce((sum, alert) => sum + Number(alert.annualImpact ?? 0), 0);

  return (
    <AppShell active="Invoices">
      <div className="page">
        <div className="page-head">
          <div>
            <Link href="/invoices" className="metric-note">← Back to invoices</Link>
            <h1 style={{ marginTop: 8 }}>{invoice.supplier}</h1>
            <p>{invoice.invoiceNumber ? `Invoice ${invoice.invoiceNumber}` : invoice.filename || "Supplier invoice"}</p>
          </div>
          <span className={`badge ${badgeClass(invoice.status)}`}>{invoice.status.replaceAll("_", " ")}</span>
        </div>

        {invoice.errorMessage && (
          <section className="panel" style={{ borderColor: "#fecaca" }}>
            <div style={{ padding: 18 }}><strong>Processing issue</strong><div className="metric-note" style={{ marginTop: 6 }}>{invoice.errorMessage}</div></div>
          </section>
        )}

        <div className="metrics">
          <div className="metric"><div className="metric-label">Invoice total</div><div className="metric-value">{money(invoice.total, invoice.currency)}</div></div>
          <div className="metric"><div className="metric-label">Detected annual impact</div><div className="metric-value">{money(impact, invoice.currency)}</div><div className="metric-note">Across {data.alerts.length} cost alert{data.alerts.length === 1 ? "" : "s"}</div></div>
          <div className="metric"><div className="metric-label">Line items</div><div className="metric-value">{data.items.length}</div></div>
          <div className="metric"><div className="metric-label">Pending review</div><div className="metric-value">{data.reviewsPending}</div>{data.reviewsPending > 0 && <Link href="/review" className="metric-note">Resolve matches →</Link>}</div>
        </div>

        <section className="panel">
          <div className="panel-head"><h2>Invoice summary</h2><span className="metric-note">Uploaded {new Date(invoice.createdAt).toLocaleString()}</span></div>
          <div style={{ padding: 20 }}>
            <div className="kpi-line">
              <div className="kpi-mini"><small>Date</small><strong>{invoice.invoiceDate ? new Date(`${invoice.invoiceDate}T00:00:00`).toLocaleDateString() : "—"}</strong></div>
              <div className="kpi-mini"><small>Subtotal</small><strong>{money(invoice.subtotal, invoice.currency)}</strong></div>
              <div className="kpi-mini"><small>Fees</small><strong>{money(invoice.fees, invoice.currency)}</strong></div>
              <div className="kpi-mini"><small>Tax</small><strong>{money(invoice.tax, invoice.currency)}</strong></div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Line items</h2><span className="metric-note">Normalized purchasing history</span></div>
          {data.items.length ? (
            <div className="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit price</th><th>Line total</th><th>Match</th></tr></thead><tbody>
              {data.items.map((item) => <tr key={item.id}>
                <td><strong>{item.product || item.description}</strong>{item.product && item.product !== item.description && <div className="metric-note">{item.description}</div>}</td>
                <td>{item.sku || "—"}</td>
                <td>{item.normalizedQuantity != null ? `${item.normalizedQuantity} ${item.normalizedUnit || "units"}` : `${item.quantity} ${item.unit || ""}`}</td>
                <td>{money(item.unitPrice, invoice.currency)}</td>
                <td>{money(item.lineTotal, invoice.currency)}</td>
                <td>{item.confidence == null ? <span className="badge warn">review</span> : <span className="badge good">{Math.round(item.confidence * 100)}%</span>}</td>
              </tr>)}
            </tbody></table></div>
          ) : <div className="empty">Line items will appear after invoice analysis completes.</div>}
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Cost alerts</h2><Link href="/alerts" className="metric-note">All alerts →</Link></div>
          {data.alerts.length ? (
            <div className="table-wrap"><table><thead><tr><th>Product</th><th>Previous</th><th>Current</th><th>Change</th><th>Annual impact</th></tr></thead><tbody>
              {data.alerts.map((alert) => <tr key={alert.id}><td><strong>{alert.product}</strong></td><td>{money(alert.previousUnitCost, invoice.currency)}</td><td>{money(alert.currentUnitCost, invoice.currency)}</td><td><span className="badge bad">+{alert.percentChange.toFixed(1)}%</span></td><td>{money(alert.annualImpact, invoice.currency)}</td></tr>)}
            </tbody></table></div>
          ) : <div className="empty">No meaningful cost increases were detected for this invoice.</div>}
        </section>
      </div>
    </AppShell>
  );
}
