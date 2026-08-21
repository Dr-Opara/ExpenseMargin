import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";
import { hasEntitlement } from "@/lib/billing/plans";

export async function getSettingsData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();

  const [{ data: organization }, { data: deliveries }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id,name,industry,notification_email,notify_cost_alerts,timezone,cost_change_threshold_pct,weekly_summary_enabled")
      .eq("id", context.organizationId)
      .single(),
    supabase
      .from("notification_deliveries")
      .select("id,notification_type,recipient,status,error_message,created_at,sent_at")
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!organization) return null;

  return {
    context,
    intelligenceSettingsEnabled: hasEntitlement(context.plan, "custom_thresholds"),
    weeklySummaryEnabledForPlan: hasEntitlement(context.plan, "weekly_summary"),
    organization: {
      id: organization.id,
      name: organization.name,
      industry: organization.industry ?? "",
      notificationEmail: organization.notification_email ?? "",
      notifyCostAlerts: organization.notify_cost_alerts !== false,
      timezone: organization.timezone ?? "UTC",
      costChangeThresholdPct: Number(organization.cost_change_threshold_pct ?? 5),
      weeklySummaryEnabled: organization.weekly_summary_enabled === true,
    },
    deliveries: (deliveries ?? []).map((row: any) => ({
      id: row.id,
      type: row.notification_type,
      recipient: row.recipient,
      status: row.status,
      error: row.error_message,
      createdAt: row.created_at,
      sentAt: row.sent_at,
    })),
  };
}
