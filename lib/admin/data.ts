import { createAdminClient } from "@/lib/supabase/admin";

const planPrices: Record<string, number> = {
  business: 19,
  pro: 39,
  scale: 79,
  scale_plus: 99,
};

export async function getAdminOverview() {
  const admin = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [
    organizations,
    subscriptions,
    invoices,
    failedInvoices,
    processingInvoices,
    failedNotifications,
  ] = await Promise.all([
    admin.from("organizations").select("id,name,industry,created_at,notification_email").order("created_at", { ascending: false }).limit(8),
    admin.from("subscriptions").select("organization_id,plan,status,cancel_at_period_end,current_period_end"),
    admin.from("invoices").select("id", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
    admin.from("invoices").select("id", { count: "exact", head: true }).eq("status", "failed"),
    admin.from("invoices").select("id", { count: "exact", head: true }).in("status", ["queued", "processing"]),
    admin.from("notification_deliveries").select("id", { count: "exact", head: true }).eq("status", "failed"),
  ]);

  const activeSubscriptions = (subscriptions.data ?? []).filter((s: any) => ["active", "trialing"].includes(s.status));
  const mrr = activeSubscriptions.reduce((sum: number, s: any) => sum + (planPrices[s.plan] ?? 0), 0);

  return {
    organizationCount: organizations.count ?? (organizations.data?.length ?? 0),
    activeSubscriptions: activeSubscriptions.length,
    mrr,
    invoicesThisMonth: invoices.count ?? 0,
    failedInvoices: failedInvoices.count ?? 0,
    processingInvoices: processingInvoices.count ?? 0,
    failedNotifications: failedNotifications.count ?? 0,
    recentOrganizations: organizations.data ?? [],
    system: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
      cron: Boolean(process.env.CRON_SECRET),
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
  };
}

export async function getAdminCustomers() {
  const admin = createAdminClient();
  const [{ data: organizations }, { data: memberships }, { data: subscriptions }, { data: invoices }, usersResult] = await Promise.all([
    admin.from("organizations").select("id,name,industry,created_at,notification_email").order("created_at", { ascending: false }),
    admin.from("organization_members").select("organization_id,user_id,role"),
    admin.from("subscriptions").select("organization_id,plan,status,current_period_end,cancel_at_period_end"),
    admin.from("invoices").select("organization_id,id,created_at"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const users = new Map((usersResult.data?.users ?? []).map((u: any) => [u.id, u]));
  const subscriptionMap = new Map((subscriptions ?? []).map((s: any) => [s.organization_id, s]));
  const invoiceCounts = new Map<string, number>();
  for (const invoice of invoices ?? []) invoiceCounts.set(invoice.organization_id, (invoiceCounts.get(invoice.organization_id) ?? 0) + 1);

  return (organizations ?? []).map((org: any) => {
    const owners = (memberships ?? []).filter((m: any) => m.organization_id === org.id && m.role === "owner");
    const ownerEmails = owners.map((m: any) => users.get(m.user_id)?.email).filter(Boolean);
    return {
      ...org,
      ownerEmails,
      subscription: subscriptionMap.get(org.id) ?? null,
      invoiceCount: invoiceCounts.get(org.id) ?? 0,
    };
  });
}

export async function getAdminSubscriptions() {
  const admin = createAdminClient();
  const [{ data: subscriptions }, { data: organizations }] = await Promise.all([
    admin.from("subscriptions").select("organization_id,plan,status,stripe_customer_id,stripe_subscription_id,current_period_end,cancel_at_period_end,updated_at").order("updated_at", { ascending: false }),
    admin.from("organizations").select("id,name"),
  ]);
  const orgNames = new Map((organizations ?? []).map((o: any) => [o.id, o.name]));
  return (subscriptions ?? []).map((s: any) => ({ ...s, organizationName: orgNames.get(s.organization_id) ?? "Unknown organization", monthlyPrice: planPrices[s.plan] ?? 0 }));
}

export async function getAdminOperations() {
  const admin = createAdminClient();
  const [{ data: invoices }, { data: notifications }, { data: organizations }] = await Promise.all([
    admin.from("invoices").select("id,organization_id,original_filename,status,attempt_count,error_message,created_at,processing_started_at,processed_at").order("created_at", { ascending: false }).limit(100),
    admin.from("notification_deliveries").select("id,organization_id,notification_type,recipient,status,error_message,created_at,sent_at").order("created_at", { ascending: false }).limit(100),
    admin.from("organizations").select("id,name"),
  ]);
  const orgNames = new Map((organizations ?? []).map((o: any) => [o.id, o.name]));
  return {
    invoices: (invoices ?? []).map((row: any) => ({ ...row, organizationName: orgNames.get(row.organization_id) ?? "Unknown organization" })),
    notifications: (notifications ?? []).map((row: any) => ({ ...row, organizationName: orgNames.get(row.organization_id) ?? "Unknown organization" })),
  };
}
