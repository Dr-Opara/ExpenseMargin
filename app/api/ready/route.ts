import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    return NextResponse.json({
      status: "not_ready",
      service: "ExpenseMargin",
      configured: false,
      database: false,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("organizations").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;

    return NextResponse.json({
      status: "ready",
      service: "ExpenseMargin",
      configured: true,
      database: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: "not_ready",
      service: "ExpenseMargin",
      configured: true,
      database: false,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
