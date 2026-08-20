import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/data/context";

export async function getActivityData() {
  const context = await getOrganizationContext();
  if (!context) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_events")
    .select("id,user_id,actor_type,event_type,entity_type,entity_id,metadata,created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  return {
    context,
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      actorType: row.actor_type,
      eventType: row.event_type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    })),
  };
}
