export type PriceChangeRow = {
  id: string;
  item: string;
  supplier: string;
  previous: number;
  current: number;
  change: number;
  annualImpact: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function PriceChangeTable({ rows }: { rows: PriceChangeRow[] }) {
  if (!rows.length) {
    return <div className="empty"><strong>No cost increases detected yet.</strong><br/>Upload recurring supplier invoices to build a price history.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Item</th><th>Supplier</th><th>Previous</th><th>Current</th><th>Change</th><th>Annual impact</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.item}</strong></td>
              <td>{row.supplier}</td>
              <td>{money(row.previous)}</td>
              <td>{money(row.current)}</td>
              <td><span className="badge bad">+{row.change.toFixed(1)}%</span></td>
              <td><strong>+{money(row.annualImpact)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
