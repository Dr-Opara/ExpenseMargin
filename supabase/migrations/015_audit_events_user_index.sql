-- v1.3.0: support access reviews and audit-event queries by actor.

create index if not exists audit_events_user_id_idx
on public.audit_events(user_id)
where user_id is not null;
