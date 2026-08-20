"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else setMessage("Password updated. You can now continue to ExpenseMargin.");
    setLoading(false);
  }

  return (
    <div className="auth-wrap"><div className="auth-card">
      <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
      <h1>Choose a new password</h1>
      <p>Use at least 8 characters and a password you do not reuse elsewhere.</p>
      <form onSubmit={submit} className="auth-form">
        <label>New password<input name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
        <label>Confirm password<input name="confirmation" type="password" minLength={8} required autoComplete="new-password" /></label>
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}
        <button className="btn primary" disabled={loading}>{loading ? "Updating…" : "Update password"}</button>
      </form>
      {message && <div className="auth-foot"><Link href="/dashboard"><strong>Continue to dashboard</strong></Link></div>}
    </div></div>
  );
}
