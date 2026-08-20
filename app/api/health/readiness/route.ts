import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("organizations").select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      status: "ready",
      service: "ExpenseMargin",
      database: "reachable",
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: "not_ready",
      service: "ExpenseMargin",
      database: "unreachable",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
