import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ReviewActions } from "@/components/ReviewActions";
import { getReviewData } from "@/lib/data/reviews";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const data = await getReviewData();
  if (!data) redirect("/onboarding");

  return (
    <AppShell active="Review">
      <div className="page">
        <div className="page-head"><div><h1>Product review</h1><p>Confirm uncertain matches before they affect your price history.</p></div><span className="badge warn">{data.rows.length} pending</span></div>
        {data.rows.length === 0 ? (
          <section className="panel"><div className="empty"><strong>Nothing needs review.</strong><br/>ExpenseMargin will only interrupt you when a product match is genuinely uncertain.</div></section>
        ) : (
          <div className="review-grid">
            {data.rows.map((row) => (
              <section className="metric review-card" key={row.id}>
                <div className="metric-label">{row.supplier}</div>
                <h2>{row.description}</h2>
                {row.sku && <div className="review-sku">SKU: {row.sku}</div>}
                {row.candidate ? (
                  <div className="match-box"><span>Likely matches</span><strong>{row.candidate}</strong><small>{Math.round(row.confidence * 100)}% confidence</small></div>
                ) : (
                  <div className="match-box"><span>No reliable existing match</span><strong>Create as a new product?</strong></div>
                )}
                <ReviewActions reviewId={row.id} hasCandidate={!!row.candidate} />
              </section>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
