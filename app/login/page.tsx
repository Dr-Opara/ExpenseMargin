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
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";
  }

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const signedOut = params?.get("signed_out") === "1";
  const callbackError = params?.get("error");

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="brand"><span className="brand-mark">EM</span><span>ExpenseMargin</span></Link>
        <h1>Welcome back</h1>
        <p>Sign in to monitor supplier costs and margin impact.</p>
        {signedOut && <div className="form-success">You have been signed out.</div>}
        {callbackError && <div className="form-error">The sign-in link could not be completed. Please try again.</div>}
        <form onSubmit={submit} className="auth-form">
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-foot"><Link href="/forgot-password"><strong>Forgot password?</strong></Link></div>
        <div className="auth-foot">New to ExpenseMargin? <Link href="/signup"><strong>Create an account</strong></Link></div>
      </div>
    </div>
  );
}
