import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

export async function getSettingsData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();

  const [{ data: organization }, { data: deliveries }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id,name,industry,notification_email,notify_cost_alerts,timezone")
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
    organization: {
      id: organization.id,
      name: organization.name,
      industry: organization.industry ?? "",
      notificationEmail: organization.notification_email ?? "",
      notifyCostAlerts: organization.notify_cost_alerts !== false,
      timezone: organization.timezone ?? "UTC",
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
    integrations: {
      resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_BUSINESS_PRICE_ID && process.env.STRIPE_PRO_PRICE_ID),
      openai: Boolean(process.env.OPENAI_API_KEY),
    },
  };
}
