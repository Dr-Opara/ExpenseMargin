-- v0.4.0: tenant-visible audit trail for production observability.

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user','system')),
  event_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_org_created_idx
on public.audit_events(organization_id, created_at desc);

create index if not exists audit_events_entity_idx
on public.audit_events(organization_id, entity_type, entity_id)
where entity_id is not null;

alter table public.audit_events enable row level security;

create policy "members read audit events"
on public.audit_events for select to authenticated
using (private.is_org_member(organization_id));
