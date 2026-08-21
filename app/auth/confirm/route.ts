import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { notifySalesOfNewCustomer } from "@/lib/notifications/new-customer";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const fallback = type === "recovery" ? "/update-password" : "/onboarding";
  const next = safeNext(url.searchParams.get("next"), fallback);

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/login?error=invalid_auth_link", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    console.error("Auth token verification failed", {
      type,
      message: error.message,
      status: error.status,
    });
    return NextResponse.redirect(new URL("/login?error=auth_link_invalid_or_expired", url.origin));
  }

  if (next === "/onboarding" && type !== "recovery") {
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
