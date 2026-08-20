"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const supabase = createClient();
    const result = await supabase.auth.signUp({
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
      options: { data: { full_name: String(data.get("name") || "") } },
    });
    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
        <h1>Create your account</h1>
        <p>Start by uploading two invoices from the same supplier.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="btn primary" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
        </form>
        <div className="auth-foot">Already have an account? <Link href="/login"><strong>Sign in</strong></Link></div>
      </div>
    </div>
  );
}
