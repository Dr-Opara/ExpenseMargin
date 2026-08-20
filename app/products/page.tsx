import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getProductsData } from "@/lib/data/products";

export const dynamic = "force-dynamic";

function money(value: number | null) {
  return value == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default async function ProductsPage() {
  const data = await getProductsData();
  if (!data) redirect("/onboarding");
  return <AppShell active="Products"><div className="page"><div className="page-head"><div><h1>Products</h1><p>Normalized item-level cost history across supplier invoices.</p></div></div><section className="panel" style={{marginTop:0}}>{data.rows.length ? <div className="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Latest supplier</th><th>Current unit cost</th><th>Latest change</th><th>History</th></tr></thead><tbody>{data.rows.map((row)=><tr key={row.id}><td><strong>{row.name}</strong></td><td>{row.sku || "—"}</td><td>{row.supplier}</td><td>{money(row.currentCost)}</td><td>{row.change == null ? "—" : <span className={`badge ${row.change > 0 ? "bad" : "good"}`}>{row.change > 0 ? "+" : ""}{row.change.toFixed(1)}%</span>}</td><td>{row.historyCount} invoice line{row.historyCount === 1 ? "" : "s"}</td></tr>)}</tbody></table></div> : <div className="empty"><strong>No normalized products yet.</strong><br/>Products are created as recurring invoice line items are analyzed.</div>}</section></div></AppShell>;
}
