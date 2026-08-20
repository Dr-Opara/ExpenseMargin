import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrganizationContext } from "@/lib/data/context";
import { recordAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 1000;

async function fetchAll(admin: SupabaseClient, table: string, organizationId: string) {
  const rows: unknown[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from(table)
      .select("*")
      .eq("organization_id", organizationId)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Could not export ${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const context = await getOrganizationContext();
  if (!context) return NextResponse.json({ error: "No organization found" }, { status: 404 });
  if (!['owner', 'admin'].includes(context.role)) {
    return NextResponse.json({ error: "Only organization admins can export workspace data" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("*")
    .eq("id", context.organizationId)
    .single();
  if (organizationError) return NextResponse.json({ error: "Could not export organization" }, { status: 500 });

  try {
    const [
      members,
      suppliers,
      products,
      invoices,
      invoiceItems,
      costAlerts,
      matchReviews,
      notificationDeliveries,
      auditEvents,
    ] = await Promise.all([
      fetchAll(admin, "organization_members", context.organizationId),
      fetchAll(admin, "suppliers", context.organizationId),
      fetchAll(admin, "products", context.organizationId),
      fetchAll(admin, "invoices", context.organizationId),
      fetchAll(admin, "invoice_items", context.organizationId),
      fetchAll(admin, "cost_alerts", context.organizationId),
      fetchAll(admin, "match_reviews", context.organizationId),
      fetchAll(admin, "notification_deliveries", context.organizationId),
      fetchAll(admin, "audit_events", context.organizationId),
    ]);

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("plan,status,current_period_end,cancel_at_period_end,created_at,updated_at")
      .eq("organization_id", context.organizationId)
      .maybeSingle();

    await recordAuditEvent(admin, {
      organizationId: context.organizationId,
      userId: user.id,
      eventType: "organization.data_exported",
      entityType: "organization",
      entityId: context.organizationId,
      metadata: { format: "json" },
    });

    const exportedAt = new Date();
    const body = JSON.stringify({
      schemaVersion: 1,
      exportedAt: exportedAt.toISOString(),
      organization,
      subscription: subscription ?? null,
      members,
      suppliers,
      products,
      invoices,
      invoiceItems,
      costAlerts,
      matchReviews,
      notificationDeliveries,
      auditEvents,
    }, null, 2);

    const date = exportedAt.toISOString().slice(0, 10);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="expensemargin-export-${date}.json"`,
        "cache-control": "private, no-store, max-age=0",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    console.error("ExpenseMargin data export failed", error);
    return NextResponse.json({ error: "Could not create data export" }, { status: 500 });
  }
}
