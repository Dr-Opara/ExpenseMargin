"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
    });
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    window.location.href = "/onboarding";
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
        <h1>Welcome back</h1>
        <p>Sign in to monitor supplier costs and margin impact.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-foot">New to ExpenseMargin? <Link href="/signup"><strong>Create an account</strong></Link></div>
      </div>
    </div>
  );
}
