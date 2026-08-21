import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlatformAdmin = {
  userId: string;
  email: string;
  role: "admin" | "super_admin";
};

export async function requirePlatformAdmin(): Promise<PlatformAdmin> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const admin = createAdminClient();
  const { data: platformAdmin } = await admin
    .from("platform_admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!platformAdmin) redirect("/dashboard");

  return {
    userId: user.id,
    email: user.email ?? "",
    role: platformAdmin.role,
  };
}
