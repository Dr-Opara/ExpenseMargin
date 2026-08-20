"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewActions({ reviewId, hasCandidate }: { reviewId: string; hasCandidate: boolean }) {
  const [loading, setLoading] = useState<"confirm" | "new_product" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function resolve(action: "confirm" | "new_product") {
    setLoading(action);
    setError("");
    const response = await fetch(`/api/reviews/${reviewId}/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || "Could not resolve match");
      setLoading(null);
      return;
    }
    router.refresh();
  }

  return (
    <div className="review-actions">
      {hasCandidate && <button className="btn primary" disabled={!!loading} onClick={() => resolve("confirm")}>{loading === "confirm" ? "Saving…" : "Yes, same product"}</button>}
      <button className="btn" disabled={!!loading} onClick={() => resolve("new_product")}>{loading === "new_product" ? "Saving…" : "No, new product"}</button>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
