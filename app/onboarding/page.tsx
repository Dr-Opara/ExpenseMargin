"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const supabase = createClient();

    const existing = await supabase.from("organization_members").select("organization_id").limit(1);
    if (existing.data?.length) {
      window.location.href = "/dashboard";
      return;
    }

    const result = await supabase.rpc("create_organization", {
      org_name: String(data.get("company") || ""),
      org_industry: String(data.get("industry") || ""),
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/invoices";
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></div>
        <h1>Set up your business</h1>
        <p>This creates your private company workspace and keeps your invoice data isolated from every other customer.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Business name<input name="company" required placeholder="Acme Dental" /></label>
          <label>Industry<input name="industry" placeholder="Dental, restaurant, auto repair…" /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn primary" disabled={loading}>{loading ? "Creating workspace…" : "Create workspace"}</button>
        </form>
      </div>
    </div>
  );
}
