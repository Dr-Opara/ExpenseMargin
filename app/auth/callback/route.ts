import { NextResponse } from "next/server";
import { notifySalesOfNewCustomer } from "@/lib/notifications/new-customer";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/onboarding";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) return NextResponse.redirect(new URL("/login?error=missing_auth_code", url.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=auth_callback_failed", url.origin));

  if (next === "/onboarding") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      try {
        await notifySalesOfNewCustomer({
          email: user.email,
          fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
          userId: user.id,
          confirmedAt: user.email_confirmed_at,
        });
      } catch (notificationError) {
        console.error("New-customer sales notification failed", notificationError);
      }
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
