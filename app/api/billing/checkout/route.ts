import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";
import { isPaidPlan, priceIdForPlan } from "@/lib/billing/plans";
import { stripePost } from "@/lib/billing/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const context = await getOrganizationContext();
  if (!context) return NextResponse.redirect(new URL("/onboarding", request.url), 303);
  if (!['owner', 'admin'].includes(context.role)) {
    return NextResponse.json({ error: "Only organization admins can change billing" }, { status: 403 });
  }

  const form = await request.formData();
  const requestedPlan = String(form.get("plan") || "");
  if (!isPaidPlan(requestedPlan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const priceId = priceIdForPlan(requestedPlan);
  if (!priceId) return NextResponse.json({ error: "Stripe price is not configured" }, { status: 503 });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("success_url", `${appUrl}/billing?checkout=success`);
  params.set("cancel_url", `${appUrl}/billing?checkout=cancelled`);
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("client_reference_id", context.organizationId);
  params.set("metadata[organization_id]", context.organizationId);
  params.set("metadata[plan]", requestedPlan);
  params.set("subscription_data[metadata][organization_id]", context.organizationId);
  params.set("subscription_data[metadata][plan]", requestedPlan);
  params.set("allow_promotion_codes", "true");

  if (context.stripeCustomerId) params.set("customer", context.stripeCustomerId);
  else if (user.email) params.set("customer_email", user.email);

  const session = await stripePost("/checkout/sessions", params);
  if (!session.url) return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
  return NextResponse.redirect(session.url, 303);
}
