-- v0.3.0: notification preferences, delivery history, and Stripe webhook idempotency.

alter table public.organizations
  add column if not exists notify_cost_alerts boolean not null default true;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete cascade,
  channel text not null default 'email' check (channel in ('email')),
  notification_type text not null default 'cost_alert_summary',
  recipient text,
  provider_message_id text,
  status text not null check (status in ('sent','skipped','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notification_deliveries_org_created_idx
on public.notification_deliveries(organization_id, created_at desc);

create index if not exists notification_deliveries_invoice_idx
on public.notification_deliveries(invoice_id)
where invoice_id is not null;

alter table public.notification_deliveries enable row level security;

create policy "members read notification deliveries"
on public.notification_deliveries for select to authenticated
using (private.is_org_member(organization_id));

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  status text not null default 'received' check (status in ('received','processed','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.stripe_webhook_events enable row level security;

create or replace function public.claim_stripe_webhook_event(event_id text, event_type text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean := false;
begin
  insert into public.stripe_webhook_events(id, event_type, status, error_message, processed_at)
  values (event_id, event_type, 'received', null, null)
  on conflict (id) do update
    set event_type = excluded.event_type,
        status = 'received',
        error_message = null,
        processed_at = null
    where public.stripe_webhook_events.status = 'failed';

  claimed := found;
  return claimed;
end;
$$;

revoke all on function public.claim_stripe_webhook_event(text, text) from public, anon, authenticated;
grant execute on function public.claim_stripe_webhook_event(text, text) to service_role;
