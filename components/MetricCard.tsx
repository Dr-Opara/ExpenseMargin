export function MetricCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "good" }) {
  return (
    <section className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className={`metric-note ${tone === "good" ? "good" : ""}`}>{note}</div>
    </section>
  );
}
