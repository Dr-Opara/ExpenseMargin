import { NextResponse } from "next/server";

export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
  ];
  const missing = required.filter((key) => !process.env[key]);
  return NextResponse.json({
    status: missing.length ? "degraded" : "ok",
    service: "ExpenseMargin",
    timestamp: new Date().toISOString(),
    configured: missing.length === 0,
  }, { status: missing.length ? 503 : 200 });
}
