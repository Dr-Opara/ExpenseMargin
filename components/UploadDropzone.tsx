"use client";

import { useRef, useState } from "react";

type Status = "ready" | "uploading" | "analyzing" | "complete" | "failed";
type UploadFile = { file: File; status: Status; error?: string; invoiceId?: string; alerts?: number; reviewRequired?: boolean };
type InvoiceStatus = { status: string; error?: string | null; alertsCreated?: number; reviewsPending?: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadFile[]>([]);

  function addFiles(next: FileList | null) {
    if (!next) return;
    const allowed = Array.from(next)
      .filter((file) => ["application/pdf", "image/png", "image/jpeg"].includes(file.type))
      .filter((file) => file.size <= 12 * 1024 * 1024)
      .map((file) => ({ file, status: "ready" as const }));
    setItems((current) => [...current, ...allowed]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function patch(index: number, next: Partial<UploadFile>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...next } : item));
  }

  async function waitForInvoice(invoiceId: string): Promise<InvoiceStatus> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not read invoice status");
      if (["complete", "review_required", "failed"].includes(payload.status)) return payload;
      await sleep(2500);
    }
    return { status: "processing" };
  }

  async function analyze(index: number, invoiceId: string) {
    patch(index, { status: "analyzing", invoiceId, error: undefined });
    const extractResponse = await fetch("/api/invoices/extract", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });
    const extractPayload = await extractResponse.json().catch(() => ({}));

    if (extractResponse.ok && ["complete", "review_required"].includes(extractPayload.status)) {
      patch(index, {
        status: "complete",
        alerts: Number(extractPayload.alertsCreated ?? 0),
        reviewRequired: extractPayload.status === "review_required",
      });
      return;
    }

    if (extractResponse.status === 409 || extractPayload.status === "processing") {
      const status = await waitForInvoice(invoiceId);
      if (status.status === "failed") throw new Error(status.error || "Invoice analysis failed");
      if (!["complete", "review_required"].includes(status.status)) throw new Error("Analysis is still processing. Open the invoice to check progress.");
      patch(index, {
        status: "complete",
        alerts: Number(status.alertsCreated ?? 0),
        reviewRequired: status.status === "review_required" || Number(status.reviewsPending ?? 0) > 0,
      });
      return;
    }

    throw new Error(extractPayload.error || "Analysis failed");
  }

  async function uploadOne(index: number) {
    const current = items[index];
    if (!current || current.status !== "ready") return;
    patch(index, { status: "uploading", error: undefined });
    const body = new FormData();
    body.append("file", current.file);
    try {
      const uploadResponse = await fetch("/api/invoices/upload", { method: "POST", body });
      const uploadPayload = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) throw new Error(uploadPayload.error || "Upload failed");
      await analyze(index, uploadPayload.invoiceId);
    } catch (error) {
      patch(index, { status: "failed", error: error instanceof Error ? error.message : "Processing failed" });
    }
  }

  async function uploadAll() {
    for (let i = 0; i < items.length; i += 1) {
      if (items[i].status === "ready") await uploadOne(i);
    }
  }

  const readyCount = items.filter((item) => item.status === "ready").length;

  function statusText(item: UploadFile) {
    if (item.status === "ready") return "Ready";
    if (item.status === "uploading") return "Uploading…";
    if (item.status === "analyzing") return "Analyzing…";
    if (item.status === "complete") {
      if (item.reviewRequired) return "Needs product review";
      return item.alerts ? `${item.alerts} alert${item.alerts === 1 ? "" : "s"} found` : "Complete";
    }
    return item.error || "Failed";
  }

  return (
    <>
      <div className="upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
        <div style={{ fontSize: 32 }}>↥</div>
        <h3>Drop supplier invoices here</h3>
        <p>Upload PDF, JPG, or PNG invoices up to 12 MB. ExpenseMargin extracts line items, normalizes unit costs, and checks them against your history.</p>
        <button className="btn primary" onClick={() => inputRef.current?.click()}>Choose files</button>
        <input ref={inputRef} className="file-input" type="file" accept="application/pdf,image/png,image/jpeg" multiple onChange={(e) => addFiles(e.target.files)} />
      </div>
      {items.length > 0 && (
        <div className="upload-list">
          {items.map((item, index) => (
            <div key={`${item.file.name}-${index}`} className="upload-item">
              <span><strong>{item.file.name}</strong><br/><small style={{color:"#6b7280"}}>{Math.max(1, Math.round(item.file.size / 1024))} KB</small></span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <span className={`upload-status ${item.status === "complete" ? "uploaded" : item.status === "failed" ? "failed" : item.status === "ready" ? "" : "uploading"}`}>{statusText(item)}</span>
                {item.invoiceId && <a className="btn" href={`/invoices/${item.invoiceId}`}>Open</a>}
                {item.status === "failed" && <button className="btn" onClick={() => patch(index, { status: "ready", error: undefined })}>Retry</button>}
              </span>
            </div>
          ))}
          {readyCount > 0 && <button className="btn primary" onClick={uploadAll}>Analyze {readyCount} invoice{readyCount === 1 ? "" : "s"}</button>}
        </div>
      )}
    </>
  );
}
