import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";
import { stripePost } from "@/lib/billing/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const context = await getOrganizationContext();
  if (!context?.stripeCustomerId) return NextResponse.redirect(new URL("/billing", request.url), 303);
  if (!['owner', 'admin'].includes(context.role)) {
    return NextResponse.json({ error: "Only organization admins can manage billing" }, { status: 403 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const params = new URLSearchParams({
    customer: context.stripeCustomerId,
    return_url: `${appUrl}/billing`,
  });
  const session = await stripePost("/billing_portal/sessions", params);
  if (!session.url) return NextResponse.json({ error: "Stripe did not return a portal URL" }, { status: 502 });
  return NextResponse.redirect(session.url, 303);
}
