import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext, planInvoiceLimit } from "@/lib/data/context";

export async function getBillingData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [{ count }, { data: subscription }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId)
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("subscriptions")
      .select("plan,status,current_period_end,cancel_at_period_end,stripe_customer_id")
      .eq("organization_id", context.organizationId)
      .maybeSingle(),
  ]);

  return {
    context,
    used: count ?? 0,
    limit: planInvoiceLimit(context.plan),
    currentPeriodEnd: subscription?.current_period_end ?? null,
    cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
    canManageBilling: context.role === "owner" || context.role === "admin",
  };
}
