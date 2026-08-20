import { createClient } from "@/lib/supabase/server";

export type OrganizationContext = {
  userId: string;
  organizationId: string;
  organizationName: string;
  industry: string | null;
  notificationEmail: string | null;
  role: "owner" | "admin" | "member";
  plan: "free" | "business" | "pro";
  subscriptionStatus: string;
  stripeCustomerId: string | null;
};

export async function getOrganizationContext(): Promise<OrganizationContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const [{ data: organization }, { data: subscription }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, industry, notification_email")
      .eq("id", membership.organization_id)
      .single(),
    supabase
      .from("subscriptions")
      .select("plan, status, stripe_customer_id")
      .eq("organization_id", membership.organization_id)
      .maybeSingle(),
  ]);

  if (!organization) return null;

  return {
    userId: user.id,
    organizationId: organization.id,
    organizationName: organization.name,
    industry: organization.industry,
    notificationEmail: organization.notification_email,
    role: membership.role,
    plan: subscription && ["active", "trialing"].includes(subscription.status) ? subscription.plan : "free",
    subscriptionStatus: subscription?.status ?? "inactive",
    stripeCustomerId: subscription?.stripe_customer_id ?? null,
  };
}

export function planInvoiceLimit(plan: OrganizationContext["plan"]): number {
  if (plan === "pro") return 500;
  if (plan === "business") return 100;
  return 5;
}
