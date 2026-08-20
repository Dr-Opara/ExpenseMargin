import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrganizationContext } from "@/lib/data/context";
import { recordAuditEvent } from "@/lib/audit";

export async function POST(request: Request) {
  const context = await getOrganizationContext();
  if (!context) return NextResponse.redirect(new URL("/onboarding", request.url), 303);
  if (!['owner', 'admin'].includes(context.role)) {
    return NextResponse.json({ error: "Only organization admins can update settings" }, { status: 403 });
  }

  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const industry = String(form.get("industry") || "").trim();
  const notificationEmail = String(form.get("notification_email") || "").trim().toLowerCase();
  const notifyCostAlerts = form.get("notify_cost_alerts") === "on";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.redirect(new URL("/settings?error=invalid_name", request.url), 303);
  }
  if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
    return NextResponse.redirect(new URL("/settings?error=invalid_email", request.url), 303);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      industry: industry || null,
      notification_email: notificationEmail || null,
      notify_cost_alerts: notifyCostAlerts,
    })
    .eq("id", context.organizationId);

  if (error) return NextResponse.redirect(new URL("/settings?error=save_failed", request.url), 303);

  await recordAuditEvent(createAdminClient(), {
    organizationId: context.organizationId,
    userId: user.id,
    eventType: "organization.settings_updated",
    entityType: "organization",
    entityId: context.organizationId,
    metadata: { industry: industry || null, notificationConfigured: Boolean(notificationEmail), notifyCostAlerts },
  });

  return NextResponse.redirect(new URL("/settings?saved=1", request.url), 303);
}
