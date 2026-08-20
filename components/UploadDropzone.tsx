"use client";

import { useRef, useState } from "react";

type Status = "ready" | "uploading" | "analyzing" | "complete" | "failed";
type UploadFile = { file: File; status: Status; error?: string; invoiceId?: string; alerts?: number; reviewRequired?: boolean };

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadFile[]>([]);

  function addFiles(next: FileList | null) {
    if (!next) return;
    const allowed = Array.from(next)
      .filter((file) => ["application/pdf", "image/png", "image/jpeg"].includes(file.type))
      .map((file) => ({ file, status: "ready" as const }));
    setItems((current) => [...current, ...allowed]);
  }

  async function uploadAll() {
    for (let i = 0; i < items.length; i += 1) {
      if (items[i].status !== "ready") continue;
      setItems((current) => current.map((item, index) => index === i ? { ...item, status: "uploading" } : item));
      const body = new FormData();
      body.append("file", items[i].file);
      try {
        const uploadResponse = await fetch("/api/invoices/upload", { method: "POST", body });
        const uploadPayload = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadPayload.error || "Upload failed");

        setItems((current) => current.map((item, index) => index === i ? { ...item, status: "analyzing", invoiceId: uploadPayload.invoiceId } : item));
        const extractResponse = await fetch("/api/invoices/extract", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ invoiceId: uploadPayload.invoiceId }),
        });
        const extractPayload = await extractResponse.json();
        if (!extractResponse.ok) throw new Error(extractPayload.error || "Analysis failed");

        setItems((current) => current.map((item, index) => index === i ? { ...item, status: "complete", alerts: extractPayload.alertsCreated, reviewRequired: extractPayload.status === "review_required" } : item));
      } catch (error) {
        setItems((current) => current.map((item, index) => index === i ? { ...item, status: "failed", error: error instanceof Error ? error.message : "Processing failed" } : item));
      }
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
        <p>Upload PDF, JPG, or PNG invoices. ExpenseMargin extracts line items, normalizes unit costs, and checks them against your history.</p>
        <button className="btn primary" onClick={() => inputRef.current?.click()}>Choose files</button>
        <input ref={inputRef} className="file-input" type="file" accept="application/pdf,image/png,image/jpeg" multiple onChange={(e) => addFiles(e.target.files)} />
      </div>
      {items.length > 0 && (
        <div className="upload-list">
          {items.map((item, index) => (
            <div key={`${item.file.name}-${index}`} className="upload-item">
              <span><strong>{item.file.name}</strong><br/><small style={{color:"#6b7280"}}>{Math.max(1, Math.round(item.file.size / 1024))} KB</small></span>
              <span className={`upload-status ${item.status === "complete" ? "uploaded" : item.status === "failed" ? "failed" : item.status === "ready" ? "" : "uploading"}`}>{statusText(item)}</span>
            </div>
          ))}
          {readyCount > 0 && <button className="btn primary" onClick={uploadAll}>Analyze {readyCount} invoice{readyCount === 1 ? "" : "s"}</button>}
        </div>
      )}
    </>
  );
}
