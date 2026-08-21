import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrganizationContext } from "@/lib/data/context";
import { hasEntitlement } from "@/lib/billing/plans";
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
  const requestedThreshold = Number(form.get("cost_change_threshold_pct") || 5);
  const requestedWeeklySummary = form.get("weekly_summary_enabled") === "on";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.redirect(new URL("/settings?error=invalid_name", request.url), 303);
  }
  if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
    return NextResponse.redirect(new URL("/settings?error=invalid_email", request.url), 303);
  }
  if (!Number.isFinite(requestedThreshold) || requestedThreshold < 0.5 || requestedThreshold > 100) {
    return NextResponse.redirect(new URL("/settings?error=invalid_threshold", request.url), 303);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const update: Record<string, unknown> = {
    name,
    industry: industry || null,
    notification_email: notificationEmail || null,
    notify_cost_alerts: notifyCostAlerts,
  };

  if (hasEntitlement(context.plan, "custom_thresholds")) {
    update.cost_change_threshold_pct = requestedThreshold;
  }
  if (hasEntitlement(context.plan, "weekly_summary")) {
    update.weekly_summary_enabled = requestedWeeklySummary;
  }

  const { error } = await supabase
    .from("organizations")
    .update(update)
    .eq("id", context.organizationId);

  if (error) return NextResponse.redirect(new URL("/settings?error=save_failed", request.url), 303);

  await recordAuditEvent(createAdminClient(), {
    organizationId: context.organizationId,
    userId: user.id,
    eventType: "organization.settings_updated",
    entityType: "organization",
    entityId: context.organizationId,
    metadata: {
      industry: industry || null,
      notificationConfigured: Boolean(notificationEmail),
      notifyCostAlerts,
      costChangeThresholdPct: hasEntitlement(context.plan, "custom_thresholds") ? requestedThreshold : undefined,
      weeklySummaryEnabled: hasEntitlement(context.plan, "weekly_summary") ? requestedWeeklySummary : undefined,
    },
  });

  return NextResponse.redirect(new URL("/settings?saved=1", request.url), 303);
}
