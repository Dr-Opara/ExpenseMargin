import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFromPriceId, type PlanId } from "@/lib/billing/plans";
import { verifyStripeSignature } from "@/lib/billing/stripe";

export const runtime = "nodejs";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length ? value : null;
}

function unixToIso(value: unknown): string | null {
  return typeof value === "number" && value > 0 ? new Date(value * 1000).toISOString() : null;
}

async function findOrganizationId(admin: ReturnType<typeof createAdminClient>, object: any): Promise<string | null> {
  const direct = asString(object?.metadata?.organization_id) || asString(object?.client_reference_id);
  if (direct) return direct;
  const customerId = asString(object?.customer);
  if (!customerId) return null;
  const { data } = await admin
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.organization_id ?? null;
}

async function syncSubscription(admin: ReturnType<typeof createAdminClient>, object: any, forcedStatus?: string) {
  const organizationId = await findOrganizationId(admin, object);
  if (!organizationId) return;

  const customerId = asString(object?.customer);
  const subscriptionId = asString(object?.subscription) || (object?.object === "subscription" ? asString(object?.id) : null);
  const priceId = asString(object?.items?.data?.[0]?.price?.id) || null;
  const metadataPlan = asString(object?.metadata?.plan) as PlanId | null;
  let plan: PlanId = metadataPlan === "business" || metadataPlan === "pro" ? metadataPlan : (planFromPriceId(priceId) ?? "free");
  const status = forcedStatus || asString(object?.status) || "active";
  if (["canceled", "unpaid", "incomplete_expired"].includes(status)) plan = "free";

  const { error } = await admin.from("subscriptions").upsert({
    organization_id: organizationId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    plan,
    status,
    current_period_end: unixToIso(object?.current_period_end),
    cancel_at_period_end: Boolean(object?.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  }, { onConflict: "organization_id" });
  if (error) throw new Error(error.message);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try { event = JSON.parse(payload); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const admin = createAdminClient();
  const object = event?.data?.object;
  try {
    switch (event?.type) {
      case "checkout.session.completed":
        await syncSubscription(admin, {
          ...object,
          status: object?.payment_status === "paid" ? "active" : "pending",
        });
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncSubscription(admin, object);
        break;
      case "customer.subscription.deleted":
        await syncSubscription(admin, object, "canceled");
        break;
      case "invoice.paid": {
        const organizationId = await findOrganizationId(admin, object);
        if (organizationId) await admin.from("subscriptions").update({ status: "active", updated_at: new Date().toISOString() }).eq("organization_id", organizationId);
        break;
      }
      case "invoice.payment_failed": {
        const organizationId = await findOrganizationId(admin, object);
        if (organizationId) await admin.from("subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("organization_id", organizationId);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handling failed", event?.type, error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
