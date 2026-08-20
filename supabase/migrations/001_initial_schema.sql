create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, normalized_name)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  normalized_name text not null,
  sku text,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  invoice_number text,
  invoice_date date,
  currency text not null default 'USD',
  subtotal numeric(14,2),
  fees numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2),
  storage_path text,
  status text not null default 'uploaded' check (status in ('uploaded','queued','processing','review_required','complete','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  raw_description text not null,
  sku text,
  quantity numeric(14,4) not null,
  unit text,
  unit_price numeric(14,4) not null,
  line_total numeric(14,2) not null,
  match_confidence numeric(5,4),
  created_at timestamptz not null default now()
);

create table if not exists public.cost_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  previous_unit_cost numeric(14,4) not null,
  current_unit_cost numeric(14,4) not null,
  percent_change numeric(10,4) not null,
  estimated_monthly_impact numeric(14,2),
  estimated_annual_impact numeric(14,2),
  status text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists suppliers_org_idx on public.suppliers(organization_id);
create index if not exists products_org_idx on public.products(organization_id);
create index if not exists invoices_org_date_idx on public.invoices(organization_id, invoice_date desc);
create index if not exists invoice_items_org_product_idx on public.invoice_items(organization_id, product_id);
create index if not exists cost_alerts_org_created_idx on public.cost_alerts(organization_id, created_at desc);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.cost_alerts enable row level security;

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_org and m.user_id = auth.uid()
  );
$$;

create policy "members can read organizations" on public.organizations for select using (public.is_org_member(id));
create policy "members can read memberships" on public.organization_members for select using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy "members manage suppliers" on public.suppliers for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members manage products" on public.products for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members manage invoices" on public.invoices for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members manage invoice items" on public.invoice_items for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members manage alerts" on public.cost_alerts for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
