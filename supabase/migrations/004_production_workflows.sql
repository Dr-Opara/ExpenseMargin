-- ExpenseMargin production workflow additions:
-- product matching review, processing lifecycle, notifications, and billing.

alter table public.organizations
  add column if not exists notification_email text,
  add column if not exists timezone text not null default 'UTC';

alter table public.invoices
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists processing_started_at timestamptz,
  add column if not exists processed_at timestamptz,
  add column if not exists notification_sent_at timestamptz,
  add column if not exists error_message text;

alter table public.invoice_items
  add column if not exists normalized_description text,
  add column if not exists invoice_date date;

alter table public.cost_alerts
  add column if not exists invoice_id uuid references public.invoices(id) on delete cascade,
  add column if not exists invoice_item_id uuid references public.invoice_items(id) on delete cascade;

create unique index if not exists cost_alerts_invoice_item_uidx
on public.cost_alerts(invoice_item_id)
where invoice_item_id is not null;

create table if not exists public.product_aliases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  normalized_description text not null,
  sku text,
  created_at timestamptz not null default now()
);

create unique index if not exists product_aliases_description_uidx
on public.product_aliases(organization_id, supplier_id, normalized_description);

create unique index if not exists product_aliases_sku_uidx
on public.product_aliases(organization_id, supplier_id, lower(sku))
where sku is not null and length(trim(sku)) > 0;

create index if not exists product_aliases_org_idx
on public.product_aliases(organization_id);

create table if not exists public.match_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  invoice_item_id uuid not null unique references public.invoice_items(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  candidate_product_id uuid references public.products(id) on delete set null,
  raw_description text not null,
  normalized_description text not null,
  sku text,
  confidence numeric(5,4) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','new_product','dismissed')),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists match_reviews_org_status_idx
on public.match_reviews(organization_id, status, created_at desc);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null default 'free' check (plan in ('free','business','pro')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
on public.subscriptions(stripe_customer_id);

alter table public.product_aliases enable row level security;
alter table public.match_reviews enable row level security;
alter table public.subscriptions enable row level security;

create policy "members manage product aliases"
on public.product_aliases for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members manage match reviews"
on public.match_reviews for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members read subscriptions"
on public.subscriptions for select
using (public.is_org_member(organization_id));

create or replace function public.is_org_admin(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  );
$$;

create policy "admins update organizations"
on public.organizations for update
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

-- Preserve the original two-argument onboarding API while capturing the authenticated email.
create or replace function public.create_organization(org_name text, org_industry text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  user_email text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(org_name)) < 2 then raise exception 'Organization name is required'; end if;

  user_email := nullif(auth.jwt() ->> 'email', '');

  insert into public.organizations(name, industry, notification_email)
  values (trim(org_name), nullif(trim(org_industry), ''), user_email)
  returning id into new_org_id;

  insert into public.organization_members(organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  return new_org_id;
end;
$$;

grant execute on function public.create_organization(text, text) to authenticated;

-- Atomically claims queued/failed invoices for the background worker.
create or replace function public.claim_invoice_jobs(batch_size integer default 5)
returns table(id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select i.id
    from public.invoices i
    where (
      i.status = 'queued'
      or (i.status = 'failed' and i.attempt_count < 3)
      or (i.status = 'processing' and i.processing_started_at < now() - interval '15 minutes' and i.attempt_count < 3)
    )
    order by i.created_at asc
    for update skip locked
    limit greatest(1, least(batch_size, 10))
  ), claimed as (
    update public.invoices i
    set status = 'processing',
        processing_started_at = now(),
        attempt_count = i.attempt_count + 1,
        error_message = null
    from candidates c
    where i.id = c.id
    returning i.id
  )
  select claimed.id from claimed;
end;
$$;

revoke all on function public.claim_invoice_jobs(integer) from public, anon, authenticated;
grant execute on function public.claim_invoice_jobs(integer) to service_role;
