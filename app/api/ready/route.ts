import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function integrationStatus() {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
    stripe: Boolean(
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_BUSINESS_PRICE_ID &&
      process.env.STRIPE_PRO_PRICE_ID &&
      process.env.STRIPE_SCALE_PRICE_ID
    ),
    cron: Boolean(process.env.CRON_SECRET),
  };
}

export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);
  const integrations = integrationStatus();
  if (missing.length) {
    return NextResponse.json({
      status: "not_ready",
      service: "ExpenseMargin",
      configured: false,
      database: false,
      integrations,
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
      integrations,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: "not_ready",
      service: "ExpenseMargin",
      configured: true,
      database: false,
      integrations,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
