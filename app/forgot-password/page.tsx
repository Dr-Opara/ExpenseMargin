"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) setError(resetError.message);
    else setMessage("If that email is registered, a password reset link has been sent.");
    setLoading(false);
  }

  return (
    <div className="auth-wrap"><div className="auth-card">
      <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
      <h1>Reset your password</h1>
      <p>Enter the email address associated with your ExpenseMargin account.</p>
      <form onSubmit={submit} className="auth-form">
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}
        <button className="btn primary" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
      </form>
      <div className="auth-foot"><Link href="/login"><strong>Back to sign in</strong></Link></div>
    </div></div>
  );
}
