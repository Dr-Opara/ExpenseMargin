import type { SupabaseClient } from "@supabase/supabase-js";

export async function recordAuditEvent(client: SupabaseClient, input: {
  organizationId: string;
  userId?: string | null;
  actorType?: "user" | "system";
  eventType: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await client.from("audit_events").insert({
    organization_id: input.organizationId,
    user_id: input.userId || null,
    actor_type: input.actorType ?? (input.userId ? "user" : "system"),
    event_type: input.eventType,
    entity_type: input.entityType || null,
    entity_id: input.entityId || null,
    metadata: input.metadata ?? {},
  });
  if (error) console.error("ExpenseMargin audit event failed", input.eventType, error.message);
  return !error;
}
