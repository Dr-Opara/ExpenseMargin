"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Brand } from "@/components/Brand";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/onboarding`;
    const result = await supabase.auth.signUp({
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
      options: {
        data: { full_name: String(data.get("name") || "") },
        emailRedirectTo,
      },
    });
    if (result.error) {
      setError(result.error.message);
    } else if (result.data.session) {
      window.location.href = "/onboarding";
      return;
    } else {
      setMessage("Account created. Check your email to confirm your address, then continue to ExpenseMargin.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Brand />
        <h1>Create your account</h1>
        <p>Start free with up to 5 supplier invoices per month.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="btn primary" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
        </form>
        <div className="auth-foot">By creating an account you agree to the <Link href="/terms"><strong>Terms</strong></Link> and acknowledge the <Link href="/privacy"><strong>Privacy Policy</strong></Link>.</div>
        <div className="auth-foot">Already have an account? <Link href="/login"><strong>Sign in</strong></Link></div>
      </div>
    </div>
  );
}
